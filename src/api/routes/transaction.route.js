import { getMyTransactions } from '#controllers/transaction.controller.js';
import { protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// Route for logged-in user to get their transactions
router.get('/my-transactions', protect, getMyTransactions);

export default router;