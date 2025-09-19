import { Router } from 'express';
import { getPublicRacks } from '../controllers/rack.controller.js';

const router = Router();

// Public endpoint to get available racks for the landing page
router.route('/').get(getPublicRacks);

export default router;