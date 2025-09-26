import express from 'express';
import passport from '#config/passport.config.js';

import {
	getMe,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	verifyEmail,
	googleAuth,
	googleCallback,
} from '#controllers/auth.controller.js';

import { protect } from '#middlewares/auth.middleware.js';
import { validate } from '#middlewares/validate.middleware.js';
import {
	loginValidator,
	registerValidator,
} from '#validators/auth.validator.js';

const router = express.Router();

router.get('/verify-email/:token', verifyEmail);
router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
