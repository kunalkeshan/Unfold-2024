import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { encode } from 'next-auth/jwt';
import User, { IGameUser } from '@/models/GameUser';
import connectDB from '@/lib/database';
import { encryptServerSeed, generateIV } from '@/lib/provably-fair';
import { Account } from '@aptos-labs/ts-sdk';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'Telegram',
			credentials: {
				telegramId: { label: 'Telegram ID', type: 'text' },
				username: { label: 'Username', type: 'text' },
				first_name: { label: 'First Name', type: 'text' },
				last_name: { label: 'Last Name', type: 'text' },
				image: { label: 'Image', type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials?.telegramId) {
					throw new Error('Telegram ID is required');
				}

				await connectDB();

				let user = await User.findOne({
					telegramId: credentials.telegramId,
				});

				if (!user) {
					const account = Account.generate();
					const iv = generateIV();
					const encryptionKey = Buffer.from(
						process.env.ENCRYPTION_KEY!,
						'hex'
					);
					const publicKey = account.publicKey.toString();
					const privateKey = encryptServerSeed(
						account.privateKey.toString(),
						encryptionKey,
						iv
					);

					user = await User.create({
						telegramId: credentials.telegramId,
						name: credentials.username,
						image: credentials.image,
						wallet: publicKey,
						privateKey,
						iv: iv.toString('hex'),
						deposit: [{ amount: 100.0, tokenMint: 'SUPER' }],
					});
				} else {
					// Update existing user
					user = await User.findOneAndUpdate(
						{ telegramId: credentials.telegramId },
						{
							$set: {
								name: credentials.username,
								image: credentials.image,
							},
						},
						{ new: true }
					);
				}

				return {
					id: user._id.toString(),
					telegramId: user.telegramId,
					name: user.name,
					image: user.image,
					wallet: user.wallet,
				};
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user as Pick<
				IGameUser,
				'id' | 'telegramId' | 'name' | 'image' | 'wallet'
			>;
			return session;
		},
	},
});
