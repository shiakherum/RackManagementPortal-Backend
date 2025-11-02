import * as feedbackRepo from '#repositories/feedback.repository.js';
import * as bookingRepo from '#repositories/booking.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const submitFeedback = async (userId, feedbackData) => {
	const { bookingId, ...feedbackFields } = feedbackData;

	// Check if booking exists and belongs to user
	const booking = await bookingRepo.findUserBookingById(bookingId, userId);
	if (!booking) {
		throw new ApiError(404, 'Booking not found or does not belong to you.');
	}

	// Check if booking is completed
	if (booking.status !== 'completed') {
		throw new ApiError(400, 'Can only provide feedback for completed bookings.');
	}

	// Check if feedback already exists for this booking
	const existingFeedback = await feedbackRepo.findByBooking(bookingId);
	if (existingFeedback) {
		throw new ApiError(409, 'Feedback already submitted for this booking.');
	}

	// Create feedback
	const feedback = await feedbackRepo.create({
		user: userId,
		booking: bookingId,
		rack: booking.rack,
		...feedbackFields,
	});

	return feedback;
};

const getUserFeedback = async (userId, bookingId) => {
	const feedback = await feedbackRepo.findByBooking(bookingId);

	// Verify the feedback belongs to the user
	if (feedback && feedback.user._id.toString() !== userId.toString()) {
		throw new ApiError(403, 'Access denied.');
	}

	return feedback;
};

const getAllFeedbacks = async (options = {}) => {
	const { page = 1, limit = 20, sort = '-createdAt' } = options;
	const skip = (page - 1) * limit;

	return feedbackRepo.findAll({}, { limit, skip, sort });
};

const getFeedbackById = async (feedbackId) => {
	const feedback = await feedbackRepo.findById(feedbackId);
	if (!feedback) {
		throw new ApiError(404, 'Feedback not found.');
	}
	return feedback;
};

const getFeedbackStats = async () => {
	return feedbackRepo.getStatistics();
};

export {
	submitFeedback,
	getUserFeedback,
	getAllFeedbacks,
	getFeedbackById,
	getFeedbackStats,
};
