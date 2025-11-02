import * as transactionRepo from '#repositories/transaction.repository.js';
import * as bookingRepo from '#repositories/booking.repository.js';

const getMyTransactions = async (req, res) => {
	const userId = req.user.id;

	const transactions = await transactionRepo.findByUserId(userId);

	res.status(200).json({
		success: true,
		data: transactions,
	});
};

const getTokenBalanceSheet = async (req, res) => {
	try {
		const userId = req.user.id;

		// Get all token purchases (transactions)
		const transactions = await transactionRepo.findByUserId(userId);

		// Get all bookings (token spends)
		const bookingResult = await bookingRepo.findByUser(userId, {});
		const bookings = bookingResult.data;

		console.log(`Found ${transactions.length} transactions for user ${userId}`);
		console.log(`Found ${bookings.length} bookings for user ${userId}`);

		// Create a combined history array
		const history = [];
		let runningBalance = 0;

		// Add purchases (credits)
		const paidTransactions = transactions.filter(t => t.status === 'paid');
		console.log(`Paid transactions: ${paidTransactions.length}`);

		paidTransactions.forEach(transaction => {
			const tokensGranted = transaction.tokenPack?.tokensGranted || 0;
			const packName = transaction.tokenPack?.name || 'Token Pack (details unavailable)';
			console.log(`Transaction ${transaction._id}: status=${transaction.status}, tokens=${tokensGranted}, tokenPack=`, transaction.tokenPack);

			// Only add to history if we have token info OR this is a valid purchase
			// For old transactions where pack was deleted, we'll note it but can't show tokens
			history.push({
				type: 'credit',
				date: transaction.createdAt,
				description: `Purchased ${packName}`,
				tokenPackName: packName,
				tokens: tokensGranted,
				amount: transaction.amount,
				currency: transaction.currency,
				referenceId: transaction._id,
				transactionId: transaction.razorpayPaymentId || transaction._id,
				isUnknownPack: !transaction.tokenPack, // Flag for frontend
			});
		});

		// Add bookings (debits)
		bookings.forEach(booking => {
			if (booking.status === 'confirmed' || booking.status === 'completed') {
				history.push({
					type: 'debit',
					date: booking.createdAt,
					description: `Booked ${booking.rack?.name || 'Rack'}`,
					rackName: booking.rack?.name,
					bookingId: booking._id,
					tokens: -booking.tokenCost,
					startTime: booking.startTime,
					endTime: booking.endTime,
					status: booking.status,
				});
			}
			// If cancelled and refunded, show refund
			if (booking.status === 'cancelled' && booking.refundedTokens > 0) {
				history.push({
					type: 'credit',
					date: booking.updatedAt,
					description: `Refund for cancelled booking`,
					rackName: booking.rack?.name,
					bookingId: booking._id,
					tokens: booking.refundedTokens,
					status: 'refunded',
				});
			}
		});

		// Sort by date (newest first)
		history.sort((a, b) => new Date(b.date) - new Date(a.date));

		// Calculate running balance (starting from oldest to newest for accurate balance calculation)
		const historyWithBalance = [...history].reverse().map(item => {
			runningBalance += item.tokens;
			return {
				...item,
				balance: runningBalance,
			};
		});

		// Reverse back to show newest first
		historyWithBalance.reverse();

		// Calculate summary
		const totalSpent = bookings
			.filter(b => b.status === 'confirmed' || b.status === 'completed')
			.reduce((sum, b) => sum + b.tokenCost, 0);

		const totalRefunded = bookings
			.filter(b => b.status === 'cancelled')
			.reduce((sum, b) => sum + (b.refundedTokens || 0), 0);

		// Calculate total purchased from balance equation:
		// currentBalance = totalPurchased - totalSpent + totalRefunded
		// Therefore: totalPurchased = currentBalance + totalSpent - totalRefunded
		const totalPurchased = req.user.tokens + totalSpent - totalRefunded;

		console.log(`Summary: totalPurchased=${totalPurchased} (calculated), totalSpent=${totalSpent}, totalRefunded=${totalRefunded}, currentBalance=${req.user.tokens}`);

		res.status(200).json({
			success: true,
			data: {
				history: historyWithBalance,
				summary: {
					totalPurchased,
					totalSpent,
					totalRefunded,
					currentBalance: req.user.tokens,
				},
			},
		});
	} catch (error) {
		console.error('Error fetching token balance sheet:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch token balance sheet',
		});
	}
};

export { getMyTransactions, getTokenBalanceSheet };