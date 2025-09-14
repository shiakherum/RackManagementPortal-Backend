import { body } from 'express-validator';

export const registerValidator = [
	body('email')
		.notEmpty()
		.withMessage('Email is required.')
		.isEmail()
		.withMessage('Please provide a valid email address.')
		.normalizeEmail(),

	body('firstName')
		.notEmpty()
		.withMessage('First name is required.')
		.trim()
		.isLength({ min: 2 })
		.withMessage('First name must be at least 2 characters long.'),

	body('lastName')
		.notEmpty()
		.withMessage('Last name is required.')
		.trim()
		.isLength({ min: 2 })
		.withMessage('Last name must be at least 2 characters long.'),

	body('username')
		.notEmpty()
		.withMessage('Username is required.')
		.trim()
		.isLength({ min: 5, max: 20 })
		.withMessage('Username must be between 5 and 20 characters long.')
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage('Username can only contain letters, numbers, and underscores.')
		.toLowerCase(),

	body('password')
		.notEmpty()
		.withMessage('Password is required.')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long.')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
		.withMessage(
			'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
		),
];

export const loginValidator = [
	body('email').notEmpty().withMessage('Email or username is required.'),

	body('password').notEmpty().withMessage('Password is required.'),
];
