import { Schema, model, models, Document } from 'mongoose';

interface IGameStats extends Document {
	game: string;
	volume: Map<string, number>;
	feeGenerated: Map<string, number>;
	numOfWallets: number;
}

const GameStatsSchema: Schema = new Schema<IGameStats>({
	game: {
		type: String,
		required: true,
		unique: true,
	},
	volume: {
		type: Map,
		of: Number,
	},
	feeGenerated: {
		type: Map,
		of: Number,
	},
	numOfWallets: {
		type: Number,
		required: true,
		default: 0,
	},
});

const GameStats = models.GameStats || model('GameStats', GameStatsSchema);

export default GameStats;
