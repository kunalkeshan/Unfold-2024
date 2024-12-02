import { seedStatus } from '@/lib/provably-fair';
import { Schema, model, models, Document } from 'mongoose';

interface IGameSeed extends Document {
	account: object;
	clientSeed: string;
	serverSeed: string;
	serverSeedHash: string;
	iv: string;
	nonce: number;
	status: seedStatus;
	pendingMines: boolean;
}

const GameSeedSchema = new Schema<IGameSeed>(
	{
		account: {
			type: Schema.Types.ObjectId,
			ref: 'GameUser',
			required: true,
		},
		clientSeed: String,
		serverSeed: {
			type: String,
			required: true,
			unique: true,
		},
		serverSeedHash: {
			type: String,
			required: true,
		},
		nonce: {
			type: Number,
			required: true,
			default: 0,
		},
		status: {
			type: String,
			required: true,
			default: seedStatus.NEXT,
		},
		pendingMines: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

const GameSeed = models.GameSeed || model('GameSeed', GameSeedSchema);

export default GameSeed;
