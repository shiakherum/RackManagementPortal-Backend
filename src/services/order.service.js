import * as tokenPackRepo from '#repositories/token-pack.repository.js';
import * as transactionRepo from '#repositories/transaction.repository.js';
import * as userRepo from '#repositories/user.repository.js';
import { ApiError } from '#utils/api-error.utils.js';
import crypto from 'crypto';
import { getInstance as getRazorpayInstance } from './razorpay.service.js';

const createTokenPurchaseOrder = async (userId, tokenPackId) => {
	const razorpay = getRazorpayInstance();

	const tokenPack = await tokenPackRepo.findById(tokenPackId);
	if (!tokenPack) {
		throw new ApiError(404, 'Token Pack not found.');
	}

	const options = {
		amount: tokenPack.price, // Amount in the smallest currency unit (e.g., paise)
		currency: tokenPack.currency,
		receipt: `receipt_order_${new Date().getTime()}`,
	};

	const razorpayOrder = await razorpay.orders.create(options);

	const transaction = await transactionRepo.create({
		user: userId,
		tokenPack: tokenPackId,
		amount: tokenPack.price,
		currency: tokenPack.currency,
		razorpayOrderId: razorpayOrder.id,
		status: 'created',
	});

	return {
		razorpayOrderId: razorpayOrder.id,
		amount: razorpayOrder.amount,
		currency: razorpayOrder.currency,
		transactionId: transaction._id,
	};
};

const verifyPaymentAndUpdateTokens = async (
	razorpayOrderId,
	razorpayPaymentId,
	razorpaySignature
) => {
	const body = razorpayOrderId + '|' + razorpayPaymentId;

	const expectedSignature = crypto
		.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
		.update(body.toString())
		.digest('hex');

	if (expectedSignature !== razorpaySignature) {
		throw new ApiError(400, 'Invalid signature. Payment verification failed.');
	}

	const transaction = await transactionRepo.findByRazorpayOrderId(
		razorpayOrderId
	);
	if (!transaction) {
		throw new ApiError(404, 'Transaction not found for this order.');
	}

	const tokenPack = await tokenPackRepo.findById(transaction.tokenPack);
	if (!tokenPack) {
		throw new ApiError(404, 'Associated Token Pack not found.');
	}

	await userRepo.updateUserById(transaction.user, {
		$inc: { tokens: tokenPack.tokensGranted },
	});

	transaction.status = 'paid';
	transaction.razorpayPaymentId = razorpayPaymentId;
	transaction.razorpaySignature = razorpaySignature;
	await transaction.save();

	return transaction;
};

export { createTokenPurchaseOrder, verifyPaymentAndUpdateTokens };
