import { ApiError } from '#utils/api-error.utils.js';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle request validation results.
 *
 * Checks for validation errors using express-validator. If any exist,
 * throws an `ApiError` with the first error message. Otherwise, proceeds to the next middleware.
 *
 * Should be used **after** express-validator rules in route definitions.
 *
 * @function validate
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} _res - Express response object (unused here).
 * @param {Function} next - Next middleware function.
 *
 * @throws {ApiError} 400 Bad Request if validation errors are present.
 *
 * @example
 * router.post('/register', registerValidator, validate, controller.registerUser);
 */
export const validate = (req, _res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}

	const extractedError = errors.array({ onlyFirstError: true })[0].msg;

	throw new ApiError(400, extractedError);
};
