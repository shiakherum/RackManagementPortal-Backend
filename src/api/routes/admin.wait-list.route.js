import {
	deleteWaitlistEntry,
	getAllWaitlistEntries,
} from '#controllers/admin.wait-list.controller.js';
import { authorize, protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.use(protect, authorize('Admin'));

router.route('/').get(getAllWaitlistEntries);

router.route('/:id').delete(deleteWaitlistEntry);

export default router;
