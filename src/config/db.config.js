import mongoose from 'mongoose';

import logger from './logger.config.js';

const connectDB = async () => {
	try {
		mongoose.set('strictQuery', true);
		const conn = await mongoose.connect(process.env.MONGODB_URI);

		logger.info(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		logger.error(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
