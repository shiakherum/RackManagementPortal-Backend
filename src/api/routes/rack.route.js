import { authorize, protect } from '#middlewares/auth.middleware.js';
import { Router } from 'express';
import {
	bulkUpdateRacks,
	createRack,
	deleteMultipleRacks,
	deleteRack,
	getAllRacks,
	getRackById,
	updateRack,
} from '../controllers/rack.controller.js';

const router = Router();

router.use(protect, authorize('Admin'));

router
	.route('/')
	.post(createRack)
	.get(getAllRacks)
	.delete(deleteMultipleRacks)
	.patch(bulkUpdateRacks);

router.route('/:id').get(getRackById).patch(updateRack).delete(deleteRack);

export default router;
