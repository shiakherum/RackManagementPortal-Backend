import User from '#models/user.model.js';
import {
	loginUser as loginUserService,
	registerUser as registerUserService,
	verifyEmail as verifyEmailService,
} from '#services/auth.service.js';
import { ApiError } from '#utils/api-error.utils.js';
import jwt from 'jsonwebtoken';
import passport from '#config/passport.config.js';

const registerUser = async (req, res) => {
	const { user, accessToken, refreshToken } = await registerUserService(
		req.body
	);

	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	};

	res.status(201).cookie('refreshToken', refreshToken, cookieOptions).json({
		success: true,
		message: 'User registered successfully.',
		data: {
			user,
			accessToken,
		},
	});
};

const loginUser = async (req, res) => {
	const { user, accessToken, refreshToken } = await loginUserService(req.body);

	const cookieOptions = {
		httpOnly: true, // Prevents client-side JS from reading the cookie
		secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
		sameSite: 'strict', // Helps mitigate CSRF attacks
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matching refresh token expiry
	};

	res.status(200).cookie('refreshToken', refreshToken, cookieOptions).json({
		success: true,
		message: 'User logged in successfully.',
		data: {
			user,
			accessToken,
		},
	});
};

const refreshAccessToken = async (req, res) => {
	const incomingRefreshToken =
		req.body.refreshToken || req.cookies.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, 'Unauthorized request: No refresh token provided.');
	}

	try {
		const decoded = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		const user = await User.findById(decoded.id);
		if (!user) {
			throw new ApiError(401, 'Invalid refresh token.');
		}

		const newAccessToken = user.generateAccessToken();

		res.status(200).json({
			success: true,
			message: 'Access token refreshed successfully.',
			data: {
				accessToken: newAccessToken,
			},
		});
	} catch (error) {
		throw new ApiError(401, 'Invalid or expired refresh token.');
	}
};

const logoutUser = async (req, res) => {
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
	};

	res.status(200).clearCookie('refreshToken', cookieOptions).json({
		success: true,
		message: 'User logged out successfully.',
	});
};

export const getMe = async (req, res) => {
	res.status(200).json({
		success: true,
		data: req.user,
	});
};

const verifyEmail = async (req, res) => {
	const { token } = req.params;
	const result = await verifyEmailService(token);
	res.status(200).json({ success: true, data: result });
};

const googleAuth = (req, res, next) => {
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})(req, res, next);
};

const googleCallback = (req, res, next) => {
	passport.authenticate('google', { session: false }, async (err, user) => {
		if (err) {
			return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_error`);
		}

		if (!user) {
			return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_failed`);
		}

		try {
			const accessToken = user.generateAccessToken();
			const refreshToken = user.generateRefreshToken();

			const cookieOptions = {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			};

			res.cookie('refreshToken', refreshToken, cookieOptions);

			return res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`);
		} catch (error) {
			return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=token_generation_failed`);
		}
	})(req, res, next);
};

export { loginUser, logoutUser, refreshAccessToken, registerUser, verifyEmail, googleAuth, googleCallback };