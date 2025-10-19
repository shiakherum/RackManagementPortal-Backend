import { Router } from 'express';
import { protect } from '#middlewares/auth.middleware.js';
import {
	startAccess,
	stopAccess,
	getAccessDetails,
} from '#controllers/rack-access.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Get booking access details
router.get('/:bookingId', getAccessDetails);

// Start VNC access for a booking
router.post('/:bookingId/start', startAccess);

// Stop VNC access for a booking
router.post('/:bookingId/stop', stopAccess);

export default router;
