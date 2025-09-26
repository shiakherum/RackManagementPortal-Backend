import * as transactionRepo from '#repositories/transaction.repository.js';

const getMyTransactions = async (req, res) => {
	const userId = req.user.id;

	const transactions = await transactionRepo.findByUserId(userId);

	res.status(200).json({
		success: true,
		data: transactions,
	});
};

export { getMyTransactions };