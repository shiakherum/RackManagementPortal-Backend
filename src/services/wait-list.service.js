import * as bookingRepo from '#repositories/booking.repository.js';
import * as waitlistRepo from '#repositories/wait-list.repository.js';
import { ApiError } from '../utils/api-error.utils.js';

const joinWaitlist = async (userId, waitlistDetails) => {
	const { rackId, startTime, endTime } = waitlistDetails;

	const conflictingBooking = await bookingRepo.findConflictingBooking(
		rackId,
		startTime,
		endTime
	);
	if (!conflictingBooking) {
		throw new ApiError(
			400,
			'This slot is currently available. Please proceed with booking instead of joining a waitlist.'
		);
	}

	const existingWaitlistEntry = await waitlistRepo.findByUserAndSlot(
		userId,
		rackId,
		startTime,
		endTime
	);
	if (existingWaitlistEntry) {
		throw new ApiError(
			409,
			'You are already on the waitlist for this time slot.'
		);
	}

	const newWaitlistEntry = await waitlistRepo.create({
		user: userId,
		rack: rackId,
		desiredStartTime: startTime,
		desiredEndTime: endTime,
	});

	return newWaitlistEntry;
};

export { joinWaitlist };
