import { authorize, protect } from '#middlewares/auth.middleware.js';
import { validateJoi } from '#middlewares/validate.middleware.js';
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
import { createRack as createRackValidator, updateRack as updateRackValidator } from '../validators/rack.validator.js';

const router = Router();

router.use(protect, authorize('Admin'));

router
	.route('/')
	.post(validateJoi(createRackValidator), createRack)
	.get(getAllRacks)
	.delete(deleteMultipleRacks)
	.patch(bulkUpdateRacks);

router.route('/:id').get(getRackById).patch(validateJoi(updateRackValidator), updateRack).delete(deleteRack);

export default router;
