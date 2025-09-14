import logger from '#config/logger.config.js';
import { ApiError } from '#utils/api-error.utils.js';

/**
 * Centralized error-handling middleware.
 *
 * - Wraps unstructured or unexpected errors into standardized `ApiError` instances.
 * - Dynamically logs errors at appropriate log levels (`warn` for 4xx, `error` for 5xx).
 * - Returns a consistent JSON response structure to clients.
 * - Includes stack traces in development mode, but omits them in production.
 *
 * This should be registered as the last middleware in the Express app.
 *
 * @function errorHandler
 * @param {Error} err - The error thrown or passed via `next(err)`.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware (not used, required for signature compliance).
 *
 * @example
 * app.use(errorHandler); // Place after all route handlers
 */
export const errorHandler = (err, req, res, next) => {
	let error = err;

	if (!(error instanceof ApiError)) {
		const statusCode = error.statusCode || 500;
		const message = error.message || 'Something went wrong on our end.';
		error = new ApiError(statusCode, message, false, err.stack);
	}

	const statusCode = error.statusCode || 500;

	const logLevel = statusCode >= 500 ? 'error' : 'warn';
	logger[logLevel](
		`${statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
	);
	if (error.stack) {
		logger.error(error.stack);
	}

	res.status(statusCode).json({
		success: false,
		message: error.message,
		stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
	});
};

export default errorHandler;
