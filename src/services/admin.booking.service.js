import * as rackRepo from '#repositories/rack.repository.js';
import * as bookingRepo from '#repositories/booking.repository.js';
import * as userRepo from '#repositories/user.repository.js';
import { ApiError } from '#utils/api-error.utils.js';
import mongoose from 'mongoose';

const getAllBookings = async (filter, options) => {
	return bookingRepo.findAll(filter, options);
};

const getBookingById = async (bookingId) => {
	const booking = await bookingRepo.findById(bookingId);
	if (!booking) {
		throw new ApiError(404, 'Booking not found.');
	}
	return booking;
};

const deleteBookingByAdmin = async (bookingId) => {
	const booking = await bookingRepo.findById(bookingId);
	if (!booking) {
		throw new ApiError(404, 'Booking not found.');
	}

	if (booking.status !== 'confirmed') {
		await bookingRepo.deleteById(bookingId);
		return { message: 'Booking record deleted (no token refund required).' };
	}

	try {
		// Refund tokens to user
		await userRepo.updateUserById(
			booking.user._id,
			{ $inc: { tokens: booking.tokenCost } }
		);

		// Delete the booking
		await bookingRepo.deleteById(bookingId);

		// TODO: Optionally notify the user their booking was cancelled by an admin.

	} catch (error) {
		console.error('Error deleting booking:', error);
		throw new ApiError(500, `Failed to delete booking: ${error.message}`);
	}

	return {
		message: `Booking deleted successfully. ${booking.tokenCost} tokens refunded to user ${booking.user.email}.`,
	};
};

export { deleteBookingByAdmin, getAllBookings, getBookingById };

export const createBookingForUser = async (bookingData) => {
    const { userId, rackId, startTime, endTime, tokenCost, selectedAciVersion, selectedPreConfigs } = bookingData;

    const user = await userRepo.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found.');
    }

    const rack = await rackRepo.findById(rackId);
    if (!rack) {
        throw new ApiError(404, 'Rack not found.');
    }

    if (user.tokens < tokenCost) {
        throw new ApiError(400, 'Insufficient tokens.');
    }

    // Optional: Check for booking conflicts
    const existingBooking = await bookingRepo.findOne({
        rack: rackId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    if (existingBooking) {
        throw new ApiError(409, 'Rack is already booked for the selected time slot.');
    }


    let newBooking;
    try {
        // Create the booking first
        newBooking = await bookingRepo.create({
            user: userId,
            rack: rackId,
            startTime,
            endTime,
            tokenCost,
            selectedAciVersion,
            selectedPreConfigs,
            status: 'confirmed',
        });

        // Deduct tokens from user
        user.tokens -= tokenCost;
        await user.save();

    } catch (error) {
        console.error('Error creating booking:', error);
        // If booking was created but user save failed, try to clean up
        if (newBooking && newBooking._id) {
            try {
                await bookingRepo.deleteById(newBooking._id);
            } catch (cleanupError) {
                console.error('Failed to cleanup booking after error:', cleanupError);
            }
        }
        throw new ApiError(500, `Failed to create booking: ${error.message}`);
    }

    return newBooking;
};

export const updateBookingForUser = async (bookingId, updateData) => {
    const { userId, rackId, startTime, endTime, tokenCost, selectedAciVersion, selectedPreConfigs, status } = updateData;
    
    const existingBooking = await bookingRepo.findById(bookingId);
    if (!existingBooking) {
        throw new ApiError(404, 'Booking not found.');
    }

    // If user is changed, validate new user exists
    if (userId && userId !== existingBooking.user._id.toString()) {
        const newUser = await userRepo.findById(userId);
        if (!newUser) {
            throw new ApiError(404, 'New user not found.');
        }
    }

    // If rack is changed, validate new rack exists
    if (rackId && rackId !== existingBooking.rack._id.toString()) {
        const rack = await rackRepo.findById(rackId);
        if (!rack) {
            throw new ApiError(404, 'Rack not found.');
        }

        // Check for booking conflicts if time or rack changes
        const conflictFilter = {
            rack: rackId,
            _id: { $ne: bookingId }, // Exclude current booking
            $or: [
                { startTime: { $lt: endTime || existingBooking.endTime }, endTime: { $gt: startTime || existingBooking.startTime } }
            ]
        };

        const conflictingBooking = await bookingRepo.findOne(conflictFilter);
        if (conflictingBooking) {
            throw new ApiError(409, 'Rack is already booked for the selected time slot.');
        }
    }

    let updatedBooking;
    try {
        // Handle token cost changes
        if (tokenCost && tokenCost !== existingBooking.tokenCost) {
            const tokenDifference = tokenCost - existingBooking.tokenCost;
            
            // If user is being changed, handle token operations for both users
            if (userId && userId !== existingBooking.user._id.toString()) {
                // Refund tokens to original user
                await userRepo.updateUserById(
                    existingBooking.user._id,
                    { $inc: { tokens: existingBooking.tokenCost } }
                );

                // Deduct new token cost from new user
                const newUser = await userRepo.findById(userId);
                if (newUser.tokens < tokenCost) {
                    throw new ApiError(400, 'New user has insufficient tokens.');
                }
                await userRepo.updateUserById(
                    userId,
                    { $inc: { tokens: -tokenCost } }
                );
            } else {
                // Same user, just adjust the difference
                const currentUser = await userRepo.findById(existingBooking.user._id);
                if (tokenDifference > 0 && currentUser.tokens < tokenDifference) {
                    throw new ApiError(400, 'User has insufficient tokens for the updated cost.');
                }
                await userRepo.updateUserById(
                    existingBooking.user._id,
                    { $inc: { tokens: -tokenDifference } }
                );
            }
        } else if (userId && userId !== existingBooking.user._id.toString()) {
            // User changed but token cost is same
            // Refund original user and charge new user
            await userRepo.updateUserById(
                existingBooking.user._id,
                { $inc: { tokens: existingBooking.tokenCost } }
            );

            const newUser = await userRepo.findById(userId);
            if (newUser.tokens < existingBooking.tokenCost) {
                throw new ApiError(400, 'New user has insufficient tokens.');
            }
            await userRepo.updateUserById(
                userId,
                { $inc: { tokens: -existingBooking.tokenCost } }
            );
        }

        // Update the booking
        const updateFields = {};
        if (userId) updateFields.user = userId;
        if (rackId) updateFields.rack = rackId;
        if (startTime) updateFields.startTime = startTime;
        if (endTime) updateFields.endTime = endTime;
        if (tokenCost) updateFields.tokenCost = tokenCost;
        if (selectedAciVersion !== undefined) updateFields.selectedAciVersion = selectedAciVersion;
        if (selectedPreConfigs !== undefined) updateFields.selectedPreConfigs = selectedPreConfigs;
        if (status) updateFields.status = status;

        updatedBooking = await bookingRepo.updateById(bookingId, updateFields);

    } catch (error) {
        console.error('Error updating booking:', error);
        throw error instanceof ApiError ? error : new ApiError(500, `Failed to update booking: ${error.message}`);
    }

    return updatedBooking;
};
