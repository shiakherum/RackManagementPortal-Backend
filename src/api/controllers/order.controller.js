import * as orderService from '#services/order.service.js';

const createOrder = async (req, res) => {
	try {
		console.log('Order creation request:', { body: req.body, userId: req.user?.id });

		const { tokenPackId } = req.body;
		const userId = req.user.id;

		if (!tokenPackId) {
			throw new Error('tokenPackId is required');
		}

		if (!userId) {
			throw new Error('User ID not found in request');
		}

		const orderDetails = await orderService.createTokenPurchaseOrder(
			userId,
			tokenPackId
		);

		res.status(201).json({
			success: true,
			message: 'Order created successfully. Please proceed with payment.',
			data: orderDetails,
		});
	} catch (error) {
		console.error('Order creation error:', error);
		throw error;
	}
};

const verifyPayment = async (req, res) => {
	try {
		const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

		if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
			return res.status(400).json({
				success: false,
				message: 'Missing required payment verification parameters.',
			});
		}

		const transaction = await orderService.verifyPaymentAndUpdateTokens(
			razorpayOrderId,
			razorpayPaymentId,
			razorpaySignature
		);

		res.status(200).json({
			success: true,
			message: 'Payment verified and tokens added successfully.',
			data: transaction,
		});
	} catch (error) {
		console.error('Payment verification error:', error);
		throw error;
	}
};

const verifyPaymentWebhook = async (req, res) => {
	const signature = req.headers['x-razorpay-signature'];
	const { order_id, payment_id } = req.body.payload.payment.entity;

	await orderService.verifyPaymentAndUpdateTokens(
		order_id,
		payment_id,
		signature
	);

	res
		.status(200)
		.json({ success: true, message: 'Webhook processed successfully.' });
};

export { createOrder, verifyPayment, verifyPaymentWebhook };
