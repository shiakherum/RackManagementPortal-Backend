import * as adminBookingService from '#services/admin.booking.service.js';

const getAllBookings = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;
	const sort = req.query.sort || '-createdAt';

	const { data: bookings, total } = await adminBookingService.getAllBookings(
		{},
		{ limit, skip, sort }
	);

	res.status(200).json({
		success: true,
		pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
		data: bookings,
	});
};

const getBookingById = async (req, res) => {
	const booking = await adminBookingService.getBookingById(req.params.id);
	res.status(200).json({ success: true, data: booking });
};

const deleteBooking = async (req, res) => {
	const result = await adminBookingService.deleteBookingByAdmin(req.params.id);
	res.status(200).json({ success: true, data: result });
};

export { deleteBooking, getAllBookings, getBookingById };

export const createBooking = async (req, res) => {
    const newBooking = await adminBookingService.createBookingForUser(req.body);
    res.status(201).json({
        success: true,
        data: newBooking,
    });
};

export const updateBooking = async (req, res) => {
    const updatedBooking = await adminBookingService.updateBookingForUser(req.params.id, req.body);
    res.status(200).json({
        success: true,
        data: updatedBooking,
    });
};
