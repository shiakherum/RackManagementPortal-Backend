import {
	getAllTransactions,
	getTransactionById,
} from '#controllers/admin.transaction.controller.js';
import { authorize, protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.use(protect, authorize('Admin'));

router.route('/').get(getAllTransactions);

router.route('/:id').get(getTransactionById);

export default router;
