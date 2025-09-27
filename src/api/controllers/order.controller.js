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

export { createOrder, verifyPaymentWebhook };
