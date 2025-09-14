import * as adminTransactionService from '#services/admin.transaction.service.js';

const getAllTransactions = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;
	const sort = req.query.sort || '-createdAt';

	const { data: transactions, total } =
		await adminTransactionService.getAllTransactions({}, { limit, skip, sort });

	res.status(200).json({
		success: true,
		pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
		data: transactions,
	});
};

const getTransactionById = async (req, res) => {
	const transaction = await adminTransactionService.getTransactionById(
		req.params.id
	);
	res.status(200).json({ success: true, data: transaction });
};

export { getAllTransactions, getTransactionById };
