import {
	createBooking,
	deleteBooking,
	getAllBookings,
	getBookingById,
	updateBooking,
} from '#controllers/admin.booking.controller.js';
import { authorize, protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// All routes are for Admins only
router.use(protect, authorize('Admin'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBookingById).put(updateBooking).delete(deleteBooking);

export default router;
