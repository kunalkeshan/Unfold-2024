// import {
//   SPL_TOKENS,
//   houseEdgeTiers,
//   launchPromoEdge,
//   maintainance,
//   maxPayouts,
//   minAmtFactor,
//   stakingTiers,
//   wsEndpoint,
// } from "@/context/config";
import Dice from '@/models/Dice';
import GameSeed from '@/models/GameSeed';
import User, { IGameUser } from '@/models/GameUser';
import {
	GameTokens,
	GameType,
	decryptServerSeed,
	generateGameResult,
	seedStatus,
} from '@/lib/provably-fair';
import { Decimal } from 'decimal.js';
import { NextApiRequest, NextApiResponse } from 'next';
import connectDatabase from '@/lib/database';
import updateGameStats from '@/lib/updateGameStats';
Decimal.set({ precision: 9 });

/**
 * @swagger
 * /games/dice:
 *   post:
 *     summary: Play a dice game
 *     description: This endpoint allows a user to play a dice game by betting a certain amount of tokens and choosing numbers. The game result is determined in a provably fair manner.
 *     tags:
 *      - Games
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wallet:
 *                 type: string
 *                 description: The wallet address of the user.
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               amount:
 *                 type: number
 *                 description: The amount of tokens to bet.
 *               tokenMint:
 *                 type: string
 *                 description: The token mint of the token being bet.
 *               chosenNumbers:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: The numbers chosen by the user for the dice game.
 *     responses:
 *       200:
 *         description: Game played successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     strikeNumber:
 *                       type: number
 *                     strikeMultiplier:
 *                       type: number
 *                     result:
 *                       type: string
 *                     amountWon:
 *                       type: number
 *                     amountLost:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 *     security:
 *       - API_KEY: []
 */

export const isArrayUnique = (arr: number[]) => {
	return new Set(arr).size === arr.length;
};

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export const config = {
	maxDuration: 60,
};

type InputType = {
	wallet: string;
	email: string;
	amount: number;
	tokenMint: GameTokens;
	chosenNumbers: number[];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			const {
				wallet,
				email,
				amount,
				tokenMint,
				chosenNumbers,
			}: InputType = req.body;

			const minGameAmount = 10 ** -3;

			if ((!wallet && !email) || !amount || !tokenMint)
				return res
					.status(400)
					.json({ success: false, message: 'Missing parameters' });

			//check if all values are unique whole numbers between 1 and 6
			if (
				typeof amount !== 'number' ||
				!isFinite(amount) ||
				!(
					chosenNumbers &&
					chosenNumbers.length >= 1 &&
					chosenNumbers.length <= 5 &&
					chosenNumbers.every(
						(v: number) => Number.isInteger(v) && v >= 1 && v <= 6
					)
				) ||
				!isArrayUnique(chosenNumbers)
			)
				return res.status(400).json({
					success: false,
					message: 'Invalid chosen numbers',
				});

			if (amount < minGameAmount)
				return res.status(400).json({
					success: false,
					message: 'Invalid bet amount',
				});

			const strikeMultiplier = new Decimal(6 / chosenNumbers.length);
			const maxPayout = new Decimal(100);

			if (amount > maxPayout.toNumber())
				return res.status(400).json({
					success: false,
					message: 'Bet amount exceeds max payout!',
				});

			await connectDatabase();

			let user: IGameUser | null = null;
			if (wallet) {
				user = await User.findOne({
					wallet: wallet,
				});
			} else if (email) {
				user = await User.findOne({
					email: email,
				});
			}

			if (!user)
				return res
					.status(400)
					.json({ success: false, message: 'User does not exist!' });

			if (
				user &&
				(user.deposit.find((d) => d.tokenMint === tokenMint)?.amount ??
					0) < amount
			)
				return res.status(400).json({
					success: false,
					message: 'Insufficient balance for bet!',
				});

			const account = user._id;

			const activeGameSeed = await GameSeed.findOneAndUpdate(
				{
					account,
					status: seedStatus.ACTIVE,
				},
				{
					$inc: {
						nonce: 1,
					},
				},
				{ new: true }
			);

			if (!activeGameSeed) {
				throw new Error('Server hash not found!');
			}

			const {
				serverSeed: encryptedServerSeed,
				clientSeed,
				nonce,
				iv,
			} = activeGameSeed;
			const serverSeed = decryptServerSeed(
				encryptedServerSeed,
				encryptionKey,
				Buffer.from(iv, 'hex')
			);

			const strikeNumber = generateGameResult(
				serverSeed,
				clientSeed,
				nonce,
				GameType.dice
			);

			let result = 'Lost';
			let amountWon = new Decimal(0);
			let amountLost = amount;
			let feeGenerated = 0;

			if (chosenNumbers.includes(strikeNumber)) {
				result = 'Won';
				amountWon = Decimal.min(
					Decimal.mul(amount, strikeMultiplier),
					tokenMint === 'SUPER'
						? Decimal.mul(amount, strikeMultiplier)
						: maxPayout
				);
				amountLost = 0;

				feeGenerated = Decimal.min(
					Decimal.mul(amount, strikeMultiplier),
					tokenMint === 'SUPER'
						? Decimal.mul(amount, strikeMultiplier)
						: maxPayout
				).toNumber();
			}

			const addGame = !user.gamesPlayed.includes(GameType.dice);

			const userUpdate = await User.findOneAndUpdate(
				{
					_id: account,
					deposit: {
						$elemMatch: {
							tokenMint,
							amount: { $gte: amount },
						},
					},
				},
				{
					$inc: {
						'deposit.$.amount': amountWon.minus(amount).toNumber(),
						numOfGamesPlayed: 1,
					},
					...(addGame
						? { $addToSet: { gamesPlayed: GameType.dice } }
						: {}),
				},
				{
					new: true,
				}
			);

			if (!userUpdate) {
				throw new Error('Insufficient balance for bet!');
			}

			const dice = new Dice({
				account,
				amount,
				chosenNumbers,
				strikeNumber,
				strikeMultiplier,
				result,
				tokenMint,
				amountWon,
				amountLost,
				nonce,
				gameSeed: activeGameSeed._id,
			});
			await dice.save();

			await updateGameStats(
				user.id,
				GameType.dice,
				tokenMint,
				amount,
				addGame,
				feeGenerated
			);

			const record = await Dice.populate(dice, 'gameSeed');
			const { gameSeed, ...rest } = record.toObject();
			rest.game = GameType.dice;
			rest.userTier = 0;

			rest.gameSeed = {
				...gameSeed,
				serverSeed: undefined,
				_id: undefined,
				iv: undefined,
				pendingMines: undefined,
				__v: undefined,
				createdAt: undefined,
				updatedAt: undefined,
			};

			// const payload = rest;

			// const socket = new WebSocket(wsEndpoint);

			// socket.onopen = () => {
			// 	socket.send(
			// 		JSON.stringify({
			// 			clientType: 'api-client',
			// 			channel: 'fomo-casino_games-channel',
			// 			authKey: process.env.FOMO_CHANNEL_AUTH_KEY!,
			// 			payload,
			// 		})
			// 	);

			// 	socket.close();
			// };

			return res.status(201).json({
				success: true,
				data: {
					strikeNumber,
					strikeMultiplier: strikeMultiplier.toNumber(),
					result,
					amountWon: amountWon.toNumber(),
					amountLost,
				},
				message:
					result === 'Won'
						? 'Congratulations! You won'
						: 'Sorry, Better luck next time!',
			});
		} catch (e) {
			if (e instanceof Error) {
				return res.status(500).json({
					success: false,
					message: e.message,
				});
			} else {
				return res.status(500).json({
					success: false,
					message: 'Internal server error',
				});
			}
		}
	} else
		return res
			.status(405)
			.json({ success: false, message: 'Method not allowed' });
}

export default handler;
