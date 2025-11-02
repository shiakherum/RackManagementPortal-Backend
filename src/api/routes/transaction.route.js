import { getMyTransactions, getTokenBalanceSheet } from '#controllers/transaction.controller.js';
import { protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// Route for logged-in user to get their transactions
router.get('/my-transactions', protect, getMyTransactions);

// Route for logged-in user to get their token balance sheet
router.get('/token-balance-sheet', protect, getTokenBalanceSheet);

export default router;