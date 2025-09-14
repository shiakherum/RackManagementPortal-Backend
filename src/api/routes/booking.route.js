import {
	cancelBooking,
	createBooking,
	getMyBookings,
	getRackAvailability,
} from '#controllers/booking.controller.js';
import { protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// PUBLIC ROUTES
router.get('/availability/:rackId', getRackAvailability);

// Below booking routes require a logged-in user
router.use(protect);

router.route('/').post(createBooking).get(getMyBookings);
router.route('/:id/cancel').patch(cancelBooking);

export default router;
