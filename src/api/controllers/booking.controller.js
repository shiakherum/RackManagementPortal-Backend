import * as bookingService from '#services/booking.service.js';

const createBooking = async (req, res) => {
	const userId = req.user.id;
	const bookingDetails = req.body;

	const newBooking = await bookingService.createBooking(userId, bookingDetails);

	res.status(201).json({
		success: true,
		message: 'Rack booked successfully.',
		data: newBooking,
	});
};

const getMyBookings = async (req, res) => {
	const userId = req.user.id;
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;
	const sort = req.query.sort || '-startTime'; // Default to show upcoming bookings first

	const { data: bookings, total } = await bookingService.getBookingsForUser(
		userId,
		{ limit, skip, sort }
	);

	res.status(200).json({
		success: true,
		pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
		data: bookings,
	});
};

const cancelBooking = async (req, res) => {
	const result = await bookingService.cancelBooking(req.user.id, req.params.id);
	res.status(200).json({ success: true, data: result });
};

const getRackAvailability = async (req, res) => {
	const { rackId } = req.params;
	const { start, end } = req.query; // e.g., ?start=2025-08-01T00:00:00.000Z&end=2025-08-31T23:59:59.999Z
	const bookings = await bookingService.getRackAvailability(rackId, start, end);
	res.status(200).json({ success: true, data: bookings });
};

export { cancelBooking, createBooking, getMyBookings, getRackAvailability };
