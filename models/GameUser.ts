import { Schema, model, models, Document } from 'mongoose';

export interface IGameUser extends Document {
	wallet: string;
	privateKey: string;
	name: string;
	telegramId: number;
	image: string;
	deposit: Array<{
		amount: number;
		tokenMint: string;
		depositAmount: number;
	}>;
	numOfGamesPlayed: number;
	gamesPlayed: string[];
	isDailyClaimed: boolean;
	claimCount: number;
	lastClaimDate: Date;
	joinedTelegramChannel: boolean;
	followedOnTwitter: boolean;
	iv: string;
}

const GameUserSchema = new Schema<IGameUser>(
	{
		wallet: {
			type: String,
			required: true,
			unique: true,
		},
		privateKey: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			sparse: true,
		},
		telegramId: {
			type: Number,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			sparse: true,
		},
		iv: {
			type: String,
			required: true,
		},
		deposit: [
			{
				amount: {
					type: Number,
					required: true,
					default: 0,
					min: 0,
				},
				tokenMint: {
					type: String,
					required: true,
					default: 'APT',
				},
				depositAmount: {
					type: Number,
					required: true,
					default: 0,
					min: 0,
				},
			},
		],
		numOfGamesPlayed: {
			type: Number,
			default: 0,
			required: true,
		},
		gamesPlayed: {
			type: [String],
			default: [],
			required: true,
		},
		isDailyClaimed: {
			type: Boolean,
			default: false,
		},
		claimCount: {
			type: Number,
			unique: true,
			sparse: true,
		},
		lastClaimDate: {
			type: Date,
		},
		joinedTelegramChannel: {
			type: Boolean,
			default: false,
		},
		followedOnTwitter: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const GameUser =
	models.GameUser || model<IGameUser>('GameUser', GameUserSchema);

export default GameUser;
