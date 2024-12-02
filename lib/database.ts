import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECTION_URI as string, {
			dbName: 'telegram-casino-bot',
		});
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.log('Error connecting to database...', error);
	}
};

export default connectDB;
