import express from 'express';
import * as feedbackController from '#controllers/feedback.controller.js';
import { protect, authorize } from '#middlewares/auth.middleware.js';

const router = express.Router();

// User routes (protected)
router.post('/', protect, feedbackController.submitFeedback);
router.get('/booking/:bookingId', protect, feedbackController.getUserFeedback);

// Admin routes (protected)
router.get('/', protect, authorize('Admin'), feedbackController.getAllFeedbacks);
router.get('/stats', protect, authorize('Admin'), feedbackController.getFeedbackStats);
router.get('/:feedbackId', protect, authorize('Admin'), feedbackController.getFeedbackById);

export default router;
