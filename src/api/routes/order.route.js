import {
	createOrder,
	verifyPayment,
	verifyPaymentWebhook,
} from '#controllers/order.controller.js';
import { protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// Route for a logged-in user to create a payment order
router.post('/create', protect, createOrder);

// Route for client-side payment verification
router.post('/verify', protect, verifyPayment);

// Public route for Razorpay to send webhook notifications
router.post('/verify-payment', verifyPaymentWebhook);

export default router;
