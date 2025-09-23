import { Router } from 'express';
import { getPublicRacks, getPublicRackByDeviceId } from '../controllers/rack.controller.js';

const router = Router();

// Public endpoint to get available racks for the landing page
router.route('/').get(getPublicRacks);

// Public endpoint to get a specific rack by device ID
router.route('/:deviceId').get(getPublicRackByDeviceId);

export default router;