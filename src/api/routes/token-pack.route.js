import { Router } from 'express';

import {
	bulkUpdateTokenPacks,
	createTokenPack,
	deleteMultipleTokenPacks,
	deleteTokenPack,
	getAllTokenPacks,
	getTokenPackById,
	updateTokenPack,
} from '#controllers/token-pack.controller.js';
import { authorize, protect } from '#middlewares/auth.middleware.js';

const router = Router();

// Temporarily make token packs public for testing

// Protected admin routes
router
	.route('/')
	.post(createTokenPack)
	.get(getAllTokenPacks)
	.delete(deleteMultipleTokenPacks)
	.patch(bulkUpdateTokenPacks);

router
	.route('/:id')
	.get(getTokenPackById)
	.patch(updateTokenPack)
	.delete(deleteTokenPack);

export default router;
