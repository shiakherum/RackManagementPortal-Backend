import { Router } from 'express';

import {
	bulkUpdateUsers,
	createUser,
	deleteMultipleUsers,
	deleteUser,
	getAllUsers,
	getDashboardStats,
	getUserById,
	getUserStats,
	updateUser,
} from '#controllers/admin.controller.js';
import { authorize, protect } from '#middlewares/auth.middleware.js';

const router = Router();

// All routes in this file are for Admins
router.use(protect, authorize('Admin'));

// Dashboard Routes
router.get('/dashboard-stats', getDashboardStats);

// User Management Routes
router.get('/users/stats', getUserStats);
router
	.route('/users')
	.get(getAllUsers)
	.post(createUser)
	.delete(deleteMultipleUsers)
	.patch(bulkUpdateUsers);

router
	.route('/users/:id')
	.get(getUserById)
	.patch(updateUser)
	.delete(deleteUser);

export default router;
