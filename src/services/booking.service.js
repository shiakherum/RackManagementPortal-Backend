import User from '#models/user.model.js';
import * as bookingRepo from '#repositories/booking.repository.js';
import * as rackRepo from '#repositories/rack.repository.js';
import * as userRepo from '#repositories/user.repository.js';
import { notifyUser } from '#services/notification.service.js';
import { ApiError } from '#utils/api-error.utils.js';
import mongoose from 'mongoose';

const TOKENS_PER_HOUR = 100; // Fallback if rack doesn't have tokenCostPerHour
const CANCELLATION_PENALTY_WINDOW_HOURS = 4;

const createBooking = async (userId, bookingDetails) => {
	const { rackId, startTime, endTime, selectedAciVersion, selectedPreConfigs } =
		bookingDetails;

	const rack = await rackRepo.findById(rackId);
	if (!rack || rack.status !== 'available') {
		throw new ApiError(404, 'Rack not found or is currently unavailable.');
	}
	if (new Date(startTime) >= new Date(endTime)) {
		throw new ApiError(400, 'End time must be after start time.');
	}
	if (new Date(startTime) < new Date()) {
		throw new ApiError(400, 'Booking start time must be in the future.');
	}

	const conflict = await bookingRepo.findConflictingBooking(
		rackId,
		new Date(startTime),
		new Date(endTime)
	);
	if (conflict) {
		throw new ApiError(
			409,
			'This time slot is already booked. Please select another time.'
		);
	}

	const durationInHours =
		(new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
	const tokensPerHour = rack.tokenCostPerHour || TOKENS_PER_HOUR;
	const totalTokenCost = Math.ceil(durationInHours * tokensPerHour);

	const user = await userRepo.findById(userId);
	if (!user || user.tokens < totalTokenCost) {
		throw new ApiError(402, 'Insufficient token balance to make this booking.');
	}

	// Deduct tokens from user
	await User.findByIdAndUpdate(
		userId,
		{ $inc: { tokens: -totalTokenCost } }
	);

	// Create booking
	const newBooking = await bookingRepo.create({
		user: userId,
		rack: rackId,
		startTime,
		endTime,
		tokenCost: totalTokenCost,
		selectedAciVersion,
		selectedPreConfigs,
		status: 'confirmed',
	});

	return newBooking;
};

const getBookingsForUser = async (userId, options) => {
	// Update expired bookings before fetching
	await bookingRepo.updateExpiredBookings();
	return bookingRepo.findByUser(userId, options);
};

const cancelBooking = async (userId, bookingId) => {
	const booking = await bookingRepo.findUserBookingById(bookingId, userId);

	if (!booking) {
		throw new ApiError(
			404,
			'Booking not found or you do not have permission to cancel it.'
		);
	}
	if (booking.status !== 'confirmed') {
		throw new ApiError(
			400,
			`Cannot cancel a booking with status '${booking.status}'.`
		);
	}
	if (new Date(booking.startTime) < new Date()) {
		throw new ApiError(
			400,
			'Cannot cancel a booking that has already started.'
		);
	}

	// Penalty Logic
	const hoursUntilBooking =
		(new Date(booking.startTime) - new Date()) / (1000 * 60 * 60);
	let refundAmount = booking.tokenCost;

	if (hoursUntilBooking < CANCELLATION_PENALTY_WINDOW_HOURS) {
		// Example: 50% penalty
		refundAmount = Math.floor(booking.tokenCost * 0.5);
	}

	// Use a transaction to ensure atomicity
	const session = await mongoose.startSession();
	try {
		session.startTransaction();

		await User.findByIdAndUpdate(
			userId,
			{ $inc: { tokens: refundAmount } },
			{ session }
		);

		booking.status = 'cancelled';
		await booking.save({ session });

		// TODO: Trigger waitlist notification logic here in the future

		await session.commitTransaction();
	} catch (error) {
		await session.abortTransaction();
		throw new ApiError(500, 'Failed to cancel booking. Please try again.');
	} finally {
		session.endSession();
	}

	try {
		const waitlistedUsers = await waitlistRepo.findWaitlistedUsersForSlot(
			booking.rack,
			booking.startTime,
			booking.endTime
		);

		if (waitlistedUsers.length > 0) {
			logger.info(
				`Found ${waitlistedUsers.length} user(s) on the waitlist for this slot.`
			);
			const notificationMessage = `A slot you were waiting for on Rack ID ${
				booking.rack
			} from ${booking.startTime.toLocaleString()} to ${booking.endTime.toLocaleString()} is now available!`;

			const userIdsToNotify = waitlistedUsers.map((w) => w.user);

			await Promise.all(
				userIdsToNotify.map((id) => notifyUser(id, notificationMessage))
			);

			await waitlistRepo.updateStatusForUsers(
				userIdsToNotify,
				booking.rack,
				booking.startTime,
				booking.endTime
			);
		}
	} catch (error) {
		logger.error(
			'Failed to process waitlist notifications after cancellation:',
			error
		);
	}

	return {
		message: 'Booking cancelled successfully.',
		refundedTokens: refundAmount,
	};
};

const getRackAvailability = async (rackId, rangeStart, rangeEnd) => {
	if (!rangeStart || !rangeEnd) {
		throw new ApiError(400, 'A start and end date range is required.');
	}
	return bookingRepo.findBookingsForRackInRange(
		rackId,
		new Date(rangeStart),
		new Date(rangeEnd)
	);
};

export {
	cancelBooking,
	createBooking,
	getBookingsForUser,
	getRackAvailability,
};
