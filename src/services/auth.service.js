import User from '#models/user.model.js';
import {
	createUser,
	findUserByEmailOrUsername,
	findUserByEmailOrUsernameWithPassword,
} from '#repositories/user.repository.js';
import { sendVerificationEmail } from '#services/email.service.js';
import { ApiError } from '#utils/api-error.utils.js';
import crypto from 'crypto';

const registerUser = async (userData) => {
	const { firstName, lastName, email, username, password } = userData;

	const userExists = await findUserByEmailOrUsername(email, username);
	if (userExists) {
		throw new ApiError(
			409,
			'A user with this email or username already exists.'
		);
	}

	const verificationToken = crypto.randomBytes(32).toString('hex');

	const user = await createUser({
		firstName,
		lastName,
		email,
		username,
		password,
		emailVerificationToken: verificationToken,
	});

	await sendVerificationEmail(user, verificationToken);

	const accessToken = user.generateAccessToken();
	const refreshToken = user.generateRefreshToken();

	const userResponse = {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		name: user.name, // Virtual field combining firstName + lastName
		username: user.username,
		email: user.email,
		role: user.role,
		tokens: user.tokens,
	};

	return { user: userResponse, accessToken, refreshToken };
};

const loginUser = async (loginData) => {
	const { email, password } = loginData; // Reverted back to email field

	const user = await findUserByEmailOrUsernameWithPassword(email);

	if (!user || !(await user.comparePassword(password))) {
		throw new ApiError(401, 'Invalid credentials.');
	}

	if (!user.isEmailVerified) {
		throw new ApiError(403, 'Please verify your email before logging in.');
	}

	const accessToken = user.generateAccessToken();
	const refreshToken = user.generateRefreshToken();

	const userResponse = {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		name: user.name, // Virtual field combining firstName + lastName
		username: user.username,
		email: user.email,
		role: user.role,
		tokens: user.tokens,
	};

	return { user: userResponse, accessToken, refreshToken };
};

const verifyEmail = async (token) => {
	// Hash the incoming token to match the one in the DB
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

	const user = await User.findOne({
		emailVerificationToken: hashedToken,
		emailVerificationExpires: { $gt: Date.now() }, // Check if token is not expired
	});

	if (!user) {
		throw new ApiError(400, 'Invalid or expired verification token.');
	}

	user.isEmailVerified = true;
	user.emailVerificationToken = undefined;
	user.emailVerificationExpires = undefined;
	await user.save();

	return { message: 'Email verified successfully.' };
};

export { loginUser, registerUser, verifyEmail };
