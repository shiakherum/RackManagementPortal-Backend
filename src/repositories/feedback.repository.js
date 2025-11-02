import Feedback from '#models/feedback.model.js';

export const create = async (feedbackData) => {
	return await Feedback.create(feedbackData);
};

export const findByBooking = async (bookingId) => {
	return Feedback.findOne({ booking: bookingId })
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name')
		.populate('booking', 'startTime endTime');
};

export const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;
	const dataQuery = Feedback.find(filter)
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name')
		.populate('booking', 'startTime endTime tokenCost')
		.sort(sort)
		.skip(skip)
		.limit(limit);

	const totalQuery = Feedback.countDocuments(filter);

	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

export const findById = async (id) => {
	return Feedback.findById(id)
		.populate('user', 'firstName lastName email')
		.populate('rack', 'name deviceId')
		.populate('booking', 'startTime endTime tokenCost selectedAciVersion');
};

export const getStatistics = async () => {
	const stats = await Feedback.aggregate([
		{
			$group: {
				_id: null,
				totalFeedbacks: { $sum: 1 },
				avgOverallRating: { $avg: '$overallRating' },
				avgHardwareQuality: { $avg: '$hardwareQuality' },
				avgConnectionStability: { $avg: '$connectionStability' },
				avgEaseOfUse: { $avg: '$easeOfUse' },
				avgValueForMoney: { $avg: '$valueForMoney' },
				wouldRecommendCount: {
					$sum: { $cond: ['$wouldRecommend', 1, 0] }
				},
			}
		}
	]);

	return stats[0] || {
		totalFeedbacks: 0,
		avgOverallRating: 0,
		avgHardwareQuality: 0,
		avgConnectionStability: 0,
		avgEaseOfUse: 0,
		avgValueForMoney: 0,
		wouldRecommendCount: 0,
	};
};
