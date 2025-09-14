import Transaction from '#models/transaction.model.js';

const create = async (transactionData) => {
	return Transaction.create(transactionData);
};

const findByRazorpayOrderId = async (orderId) => {
	return Transaction.findOne({ razorpayOrderId: orderId });
};

const updateById = async (id, updateData) => {
	return Transaction.findByIdAndUpdate(id, updateData, { new: true });
};

const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;
	const dataQuery = Transaction.find(filter)
		.populate('user', 'name email')
		.populate('tokenPack', 'name')
		.sort(sort)
		.skip(skip)
		.limit(limit);

	const totalQuery = Transaction.countDocuments(filter);
	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

const findById = async (id) => {
	return Transaction.findById(id)
		.populate('user', 'name email')
		.populate('tokenPack', 'name');
};

export { create, findAll, findById, findByRazorpayOrderId, updateById };
