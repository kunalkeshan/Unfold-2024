import crypto, { createECDH } from 'crypto';

// Before the game round:
export const generateClientSeed = () => {
	return crypto.randomBytes(8).toString('hex');
};

export const generateServerSeed = (encryptionKey: Buffer) => {
	const serverSeed = crypto.randomBytes(32).toString('hex');
	const serverSeedHash = crypto
		.createHash('sha256')
		.update(serverSeed)
		.digest('hex');

	const iv = generateIV();
	const encryptedServerSeed = encryptServerSeed(
		serverSeed,
		encryptionKey,
		iv
	);

	return { serverSeed, serverSeedHash, iv, encryptedServerSeed };
};

// Generate a random encryption key and IV (ensure secure storage of the key)
// const encryptionKey = crypto.randomBytes(32); // 32 bytes for AES-256
export const generateIV = () => crypto.randomBytes(16); // 16 bytes for AES

// Encrypt the serverSeed
export const encryptServerSeed = (
	serverSeed: string,
	key: Buffer,
	iv: Buffer
) => {
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	let encrypted = cipher.update(serverSeed, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
};

// Decrypt the serverSeed
export const decryptServerSeed = (
	encryptedServerSeed: string,
	key: Buffer,
	iv: Buffer
) => {
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	let decrypted = decipher.update(encryptedServerSeed, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
};

interface SeedData {
	serverSeed: string;
	clientSeed: string;
	nonce: number;
	cursor: number;
	count: number;
	curve?: string;
}

// Function to generate the HMAC-based pseudorandom number generator
// function* hmacGenerator({
// 	serverSeed,
// 	clientSeed,
// 	nonce,
// 	cursor,
// }: Omit<SeedData, 'count'>) {
// 	let blockIndex = Math.floor(cursor / 32);
// 	let byteIndex = cursor % 32;

// 	while (true) {
// 		const hmac = crypto.createHmac('sha256', serverSeed);
// 		hmac.update(`${clientSeed}:${nonce}:${blockIndex}`);
// 		const digest = hmac.digest();

// 		while (byteIndex < 32) {
// 			yield digest[byteIndex];
// 			byteIndex += 1;
// 		}

// 		byteIndex = 0;
// 		blockIndex += 1;
// 	}
// }

function* ecdsaGenerator({
	serverSeed,
	clientSeed,
	cursor,
	curve = 'prime256v1',
}: Omit<SeedData, 'count'>) {
	const ecdh = createECDH(curve);
	const privateKey = crypto.createHash('sha256').update(serverSeed).digest(); // Derive deterministic private key
	ecdh.setPrivateKey(privateKey);

	let blockIndex = Math.floor(cursor / 32);
	let byteIndex = cursor % 32;

	while (true) {
		const message = `${clientSeed}:${blockIndex}`;
		const hash = crypto.createHash('sha256').update(message).digest(); // Hash message deterministically
		const publicKey = ecdh.computeSecret(hash); // Use hash as a shared secret

		// Yield each byte of the resulting shared secret
		while (byteIndex < publicKey.length) {
			yield publicKey[byteIndex];
			byteIndex += 1;
		}

		// Move to the next block
		byteIndex = 0;
		blockIndex += 1;
	}
}

// Function to get the final values from the pseudorandom number generator
function getFinalValues(seedData: SeedData): number[] {
	const generator = ecdsaGenerator(seedData);
	const values: number[] = [];

	while (values.length < 4 * seedData.count) {
		values.push(generator.next().value as number);
	}

	return chunk(values, 4).map((chunk) =>
		chunk.reduce((sum, byte, index) => sum + byte / 256 ** (index + 1), 0)
	);
}

// Helper function to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

export enum seedStatus {
	EXPIRED = 'EXPIRED',
	ACTIVE = 'ACTIVE',
	NEXT = 'NEXT',
}

export enum GameTokens {
	SOL = 'SOL',
	USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	SUPER = 'SUPER',
}

export enum GameType {
	dice = 'dice',
	coin = 'coinflip',
	wheel = 'wheel',
}

type GameResult = number;

export const generateGameResult = <T extends GameType>(
	serverSeed: string,
	clientSeed: string,
	nonce: number,
	gameType: T
): GameResult => {
	switch (gameType) {
		case GameType.dice: {
			const n = getFinalValues({
				serverSeed,
				clientSeed,
				nonce,
				cursor: 0,
				count: 1,
			}).map((e) => Math.floor(6 * e) + 1);

			return n[0] as GameResult;
		}

		case GameType.coin: {
			const n = getFinalValues({
				serverSeed,
				clientSeed,
				nonce,
				cursor: 0,
				count: 1,
			}).map((e) => Math.floor(2 * e) + 1);

			return n[0] as GameResult;
		}

		case GameType.wheel: {
			const n = getFinalValues({
				serverSeed,
				clientSeed,
				nonce,
				cursor: 0,
				count: 1,
			}).map((e) => Math.floor(100 * e) + 1);

			return n[0] as GameResult;
		}

		default:
			throw new Error('Invalid game type!');
	}
};
