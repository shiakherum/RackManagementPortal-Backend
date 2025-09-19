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

/**
 * Middleware factory to validate requests using Joi schemas.
 *
 * @function validateJoi
 * @param {Object} schema - Joi validation schema object with optional body, params, query keys.
 * @returns {Function} Express middleware function.
 *
 * @throws {ApiError} 400 Bad Request if validation errors are present.
 *
 * @example
 * router.post('/racks', validateJoi(createRackSchema), controller.createRack);
 */
export const validateJoi = (schema) => {
	return (req, res, next) => {
		const validationOptions = {
			abortEarly: false,
			allowUnknown: false,
			stripUnknown: false,
		};

		const { error } = schema.body
			? schema.body.validate(req.body, validationOptions)
			: { error: null };

		if (error) {
			const errorMessage = error.details
				.map((detail) => detail.message)
				.join('. ');
			throw new ApiError(400, errorMessage);
		}

		// Validate params if schema includes them
		if (schema.params) {
			const { error: paramsError } = schema.params.validate(req.params, validationOptions);
			if (paramsError) {
				const errorMessage = paramsError.details
					.map((detail) => detail.message)
					.join('. ');
				throw new ApiError(400, errorMessage);
			}
		}

		// Validate query if schema includes them
		if (schema.query) {
			const { error: queryError } = schema.query.validate(req.query, validationOptions);
			if (queryError) {
				const errorMessage = queryError.details
					.map((detail) => detail.message)
					.join('. ');
				throw new ApiError(400, errorMessage);
			}
		}

		next();
	};
};
