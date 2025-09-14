import jwt from 'jsonwebtoken';

import User from '#models/user.model.js';
import { ApiError } from '#utils/api-error.utils.js';

const protect = async (req, _res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			req.user = await User.findById(decoded.id).select('-password');

			if (!req.user) {
				return next(
					new ApiError(
						401,
						'The user belonging to this token does no longer exist.'
					)
				);
			}

			next();
		} catch (error) {
			// Catches errors from jwt.verify (e.g., expired token, invalid signature)
			return next(new ApiError(401, 'Not authorized, token failed.'));
		}
	}

	if (!token) {
		return next(new ApiError(401, 'Not authorized, no token provided.'));
	}
};

const authorize = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user || !req.user.role) {
			return next(
				new ApiError(
					500,
					'User role not found. Ensure this middleware runs after the protect middleware.'
				)
			);
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(
				new ApiError(
					403,
					'Forbidden: You do not have permission to perform this action.'
				)
			);
		}

		next();
	};
};

export { authorize, protect };
