import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { ApiError } from '../utils/api-error.utils.js';

dotenv.config();

let razorpayInstance;

try {
	razorpayInstance = new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	});
} catch (error) {
	console.error(
		'Failed to initialize Razorpay. Check your API keys in .env file.',
		error
	);
	razorpayInstance = null;
}

export const getInstance = () => {
	if (!razorpayInstance) {
		throw new ApiError(
			500,
			'Razorpay service is not available. Please check server configuration.'
		);
	}
	return razorpayInstance;
};
