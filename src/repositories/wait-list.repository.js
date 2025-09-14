import Waitlist from '#models/wait-list.model.js';

const create = async (waitlistData) => {
	return Waitlist.create(waitlistData);
};

const findByUserAndSlot = async (userId, rackId, startTime, endTime) => {
	return Waitlist.findOne({
		user: userId,
		rack: rackId,
		desiredStartTime: startTime,
		desiredEndTime: endTime,
	});
};

const findWaitlistedUsersForSlot = async (rackId, startTime, endTime) => {
	return Waitlist.find({
		rack: rackId,
		desiredStartTime: startTime,
		desiredEndTime: endTime,
		status: 'waiting',
	});
};

const updateStatusForUsers = async (userIds, rackId, startTime, endTime) => {
	return Waitlist.updateMany(
		{
			user: { $in: userIds },
			rack: rackId,
			desiredStartTime: startTime,
			desiredEndTime: endTime,
		},
		{ $set: { status: 'notified' } }
	);
};

const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;
	const dataQuery = Waitlist.find(filter)
		.populate('user', 'name email')
		.populate('rack', 'name')
		.sort(sort)
		.skip(skip)
		.limit(limit);

	const totalQuery = Waitlist.countDocuments(filter);
	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

const deleteById = async (id) => {
	return Waitlist.findByIdAndDelete(id);
};

export {
	create,
	deleteById,
	findAll,
	findByUserAndSlot,
	findWaitlistedUsersForSlot,
	updateStatusForUsers,
};
