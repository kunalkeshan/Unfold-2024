import { Schema, model, models, Document } from 'mongoose';

interface IDeposit extends Document {
	account: object;
	wallet: string;
	type: boolean;
	amount: number;
	tokenMint: string;
	status: string;
	comments: string;
	txnSignature: string;
}

const DepositSchema = new Schema<IDeposit>(
	{
		account: {
			type: Schema.Types.ObjectId,
			ref: 'GameUser',
			required: true,
		},
		wallet: {
			type: String,
			required: true,
		},
		type: {
			// true for deposits & false for withdrawal
			type: Boolean,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			default: 0,
		},
		tokenMint: {
			type: String,
			required: true,
			default: 'SOL',
		},
		status: {
			type: String,
			// review -> pending -> completed
			enum: ['review', 'pending', 'completed', 'failed'],
			default: 'completed',
			required: true,
		},
		comments: {
			type: String,
			default: 'NA',
			required: true,
		},
		txnSignature: {
			type: String,
			unique: true,
		},
	},
	{ timestamps: true }
);

const Deposit = models.Deposit || model('Deposit', DepositSchema);

export default Deposit;
