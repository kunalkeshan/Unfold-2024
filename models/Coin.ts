import { Schema, model, models, Document } from 'mongoose';

interface ICoin extends Document {
	account: object;
	amount: number;
	flipType: string;
	strikeNumber: number;
	strikeMultiplier: number;
	result: string;
	tokenMint: string;
	amountWon: number;
	amountLost: number;
	nonce: number;
	gameSeed: object;
}

const CoinSchema = new Schema<ICoin>(
	{
		account: {
			type: Schema.Types.ObjectId,
			ref: 'GameUser',
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		flipType: {
			type: String,
			enum: ['heads', 'tails'],
			required: true,
		},
		strikeNumber: {
			type: Number,
			required: true,
		},
		strikeMultiplier: {
			type: Number,
			required: true,
		},
		result: {
			type: String,
			enum: ['Won', 'Lost'],
		},
		tokenMint: {
			type: String,
			required: false,
		},
		amountWon: {
			type: Number,
			required: true,
		},
		amountLost: {
			type: Number,
			required: true,
		},
		nonce: {
			type: Number,
			required: true,
		},
		gameSeed: {
			type: Schema.ObjectId,
			ref: 'GameSeed',
			required: true,
		},
	},
	{ timestamps: true }
);

const Coin = models.Coin || model('Coin', CoinSchema);
export default Coin;
