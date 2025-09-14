import * as transactionRepo from '#repositories/transaction.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const getAllTransactions = async (filter, options) => {
	return transactionRepo.findAll(filter, options);
};

const getTransactionById = async (id) => {
	const transaction = await transactionRepo.findById(id);
	if (!transaction) {
		throw new ApiError(404, 'Transaction not found.');
	}
	return transaction;
};

export { getAllTransactions, getTransactionById };
