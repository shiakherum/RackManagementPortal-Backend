import * as feedbackService from '#services/feedback.service.js';
import { ApiError } from '#utils/api-error.utils.js';

export const submitFeedback = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const feedback = await feedbackService.submitFeedback(userId, req.body);

		res.status(201).json({
			success: true,
			message: 'Feedback submitted successfully',
			data: feedback,
		});
	} catch (error) {
		next(error);
	}
};

export const getUserFeedback = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { bookingId } = req.params;

		const feedback = await feedbackService.getUserFeedback(userId, bookingId);

		res.json({
			success: true,
			data: feedback,
		});
	} catch (error) {
		next(error);
	}
};

export const getAllFeedbacks = async (req, res, next) => {
	try {
		const { page, limit, sort } = req.query;
		const result = await feedbackService.getAllFeedbacks({ page, limit, sort });

		res.json({
			success: true,
			data: result.data,
			pagination: {
				total: result.total,
				page: parseInt(page) || 1,
				limit: parseInt(limit) || 20,
				pages: Math.ceil(result.total / (parseInt(limit) || 20)),
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getFeedbackById = async (req, res, next) => {
	try {
		const { feedbackId } = req.params;
		const feedback = await feedbackService.getFeedbackById(feedbackId);

		res.json({
			success: true,
			data: feedback,
		});
	} catch (error) {
		next(error);
	}
};

export const getFeedbackStats = async (req, res, next) => {
	try {
		const stats = await feedbackService.getFeedbackStats();

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		next(error);
	}
};
