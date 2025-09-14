import { joinWaitlist } from '#controllers/wait-list.controller.js';
import { protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// A user must be logged in to join a waitlist
router.use(protect);

router.route('/').post(joinWaitlist);

export default router;
