import Booking from '#models/booking.model.js';

export const create = async (bookingData, session = null) => {
	if (session) {
		const newBooking = await Booking.create([bookingData], { session });
		return newBooking[0];
	} else {
		return await Booking.create(bookingData);
	}
};

const findConflictingBooking = async (rackId, startTime, endTime) => {
	// A conflict exists if another booking's start time is before our end time,
	// AND its end time is after our start time.
	const conflictingBooking = await Booking.findOne({
		rack: rackId,
		status: 'confirmed', // We only care about confirmed bookings
		$or: [
			{ startTime: { $lt: endTime, $gte: startTime } },
			{ endTime: { $gt: startTime, $lte: endTime } },
			{ startTime: { $lte: startTime }, endTime: { $gte: endTime } },
		],
	});
	return conflictingBooking;
};

const findByUser = async (userId, options = {}) => {
	const { limit, skip, sort } = options;
	const filter = { user: userId };

	const dataQuery = Booking.find(filter)
		.populate('rack', 'name location')
		.sort(sort)
		.skip(skip)
		.limit(limit);

	const totalQuery = Booking.countDocuments(filter);

	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

const findUserBookingById = async (bookingId, userId) => {
	return Booking.findOne({ _id: bookingId, user: userId });
};

const findBookingsForRackInRange = async (rackId, rangeStart, rangeEnd) => {
	return Booking.find({
		rack: rackId,
		status: 'confirmed',
		startTime: { $lt: rangeEnd },
		endTime: { $gt: rangeStart },
	}).select('startTime endTime');
};

const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;
	const dataQuery = Booking.find(filter)
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name')
		.sort(sort)
		.skip(skip)
		.limit(limit);

	const totalQuery = Booking.countDocuments(filter);

	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

const findById = async (id) => {
	return Booking.findById(id)
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name');
};

const findOne = async (filter) => {
	return Booking.findOne(filter);
};

const updateById = async (id, updateData, options = {}) => {
	// Remove session from options since we're not using transactions
	const { session, ...mongoOptions } = options;
	return Booking.findByIdAndUpdate(id, updateData, { new: true, ...mongoOptions })
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name');
};

const deleteById = async (id, session = null) => {
	// Ignore session parameter since we're not using transactions
	return Booking.findByIdAndDelete(id);
};

export {
	deleteById,
	findAll,
	findBookingsForRackInRange,
	findById,
	findByUser,
	findConflictingBooking,
	findOne,
	findUserBookingById,
	updateById,
};
