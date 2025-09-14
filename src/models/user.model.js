import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'Please provide your first name'],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, 'Please provide your last name'],
			trim: true,
		},
		username: {
			type: String,
			required: [true, 'Please provide a username'],
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
			minlength: [5, 'Username must be at least 5 characters long'],
			maxlength: [20, 'Username must be no more than 20 characters long'],
			match: [
				/^[a-zA-Z0-9_]+$/,
				'Username can only contain letters, numbers, and underscores',
			],
		},
		email: {
			type: String,
			required: [true, 'Please provide an email'],
			unique: true,
			lowercase: true,
			trim: true,
			// Updated regex to be more permissive and support domains like ethereal.email
			match: [
				/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
				'Please provide a valid email address',
			],
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: 8,
			select: false,
		},
		googleId: {
			type: String,
		},
		role: {
			type: String,
			enum: ['Standard User', 'Power User', 'Admin'],
			default: 'Standard User',
		},
		tokens: {
			type: Number,
			default: 0,
			min: 0,
		},
		telegramId: {
			type: String,
			sparse: true, // Allows multiple nulls, but unique if a value exists
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: String,
		emailVerificationExpires: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		bookings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Booking',
			},
		],
	},
	{
		timestamps: true,
		collection: 'users',
		// Add virtual for full name
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual for full name (backward compatibility)
userSchema.virtual('name').get(function () {
	return `${this.firstName} ${this.lastName}`.trim();
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			id: this._id,
			role: this.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRATION }
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
	);
};

userSchema.methods.generateEmailVerificationToken = function () {
	const verificationToken = crypto.randomBytes(32).toString('hex');

	this.emailVerificationToken = crypto
		.createHash('sha256')
		.update(verificationToken)
		.digest('hex');

	this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

	return verificationToken;
};

const User = mongoose.model('User', userSchema);

export default User;
