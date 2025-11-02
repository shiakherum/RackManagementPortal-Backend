import express from 'express';
import * as feedbackController from '#controllers/feedback.controller.js';
import { protect, authorize } from '#middlewares/auth.middleware.js';

const router = express.Router();

// User routes (protected)
router.post('/', protect, feedbackController.submitFeedback);
router.get('/booking/:bookingId', protect, feedbackController.getUserFeedback);

// Admin routes (protected) - must be specific routes before generic ones
router.get('/admin/stats', protect, authorize('Admin'), feedbackController.getFeedbackStats);
router.get('/admin/:feedbackId', protect, authorize('Admin'), feedbackController.getFeedbackById);
router.get('/admin', protect, authorize('Admin'), feedbackController.getAllFeedbacks);

export default router;
