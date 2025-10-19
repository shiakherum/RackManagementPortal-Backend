import {
	startRackAccess,
	stopRackAccess,
	getBookingAccessDetails,
} from '#services/rack-access.service.js';

/**
 * Start VNC access for a booking
 * POST /api/v1/rack-access/:bookingId/start
 */
export const startAccess = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const userId = req.user.id;

		const result = await startRackAccess(bookingId, userId);

		res.status(200).json({
			success: true,
			message: 'Rack access started successfully',
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Stop VNC access for a booking
 * POST /api/v1/rack-access/:bookingId/stop
 */
export const stopAccess = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const userId = req.user.id;

		const result = await stopRackAccess(bookingId, userId);

		res.status(200).json({
			success: true,
			message: 'Rack access stopped successfully',
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get booking details for access page
 * GET /api/v1/rack-access/:bookingId
 */
export const getAccessDetails = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const userId = req.user.id;

		const booking = await getBookingAccessDetails(bookingId, userId);

		res.status(200).json({
			success: true,
			data: booking,
		});
	} catch (error) {
		next(error);
	}
};
