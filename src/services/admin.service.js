import { sendVerificationEmail } from '#services/email.service.js';
import * as bookingService from '#services/booking.service.js';
import Booking from '#models/booking.model.js';
import Rack from '#models/rack.model.js';
import Transaction from '#models/transaction.model.js';
import User from '#models/user.model.js';
import * as userRepo from '#repositories/user.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const getAllUsers = async (queryParams = {}) => {
	try {
		const {
			page = 1,
			limit = 10,
			search = '',
			role = '',
			sort = '-createdAt',
			status = '',
		} = queryParams;

		// Build query object
		let query = {};

		// Search functionality
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			];
		}

		// Role filter
		if (role && role !== 'all') {
			query.role = role;
		}

		// Status filter
		if (status && status !== 'all') {
			query.isActive = status === 'active';
		}

		// Calculate pagination
		const pageNum = parseInt(page);
		const limitNum = parseInt(limit);
		const skip = (pageNum - 1) * limitNum;

		// Parse sort parameter
		let sortObject = {};
		if (sort.startsWith('-')) {
			sortObject[sort.substring(1)] = -1;
		} else {
			sortObject[sort] = 1;
		}

		// Execute query with pagination
		const [users, total] = await Promise.all([
			User.find(query)
				.select('-password')
				.sort(sortObject)
				.skip(skip)
				.limit(limitNum),
			User.countDocuments(query),
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(total / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		return {
			users,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				totalPages,
				hasNextPage,
				hasPrevPage,
			},
		};
	} catch (error) {
		throw new ApiError(500, 'Failed to fetch users', false, error.stack);
	}
};

const getUserStats = async () => {
	try {
		const [
			totalUsers,
			adminCount,
			powerUserCount,
			standardUserCount,
			activeUsers,
			inactiveUsers,
			recentUsers,
		] = await Promise.all([
			User.countDocuments(),
			User.countDocuments({ role: 'Admin' }),
			User.countDocuments({ role: 'Power User' }),
			User.countDocuments({ role: 'Standard User' }),
			User.countDocuments({ isActive: true }),
			User.countDocuments({ isActive: false }),
			User.countDocuments({
				createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
			}),
		]);

		return {
			totalUsers,
			roleBreakdown: {
				admin: adminCount,
				powerUser: powerUserCount,
				standardUser: standardUserCount,
			},
			statusBreakdown: {
				active: activeUsers,
				inactive: inactiveUsers,
			},
			recentUsers, // Users created in last 30 days
		};
	} catch (error) {
		throw new ApiError(
			500,
			'Failed to fetch user statistics',
			false,
			error.stack
		);
	}
};

const getDashboardStats = async () => {
	try {
		const [
			totalUsers,
			totalRacks,
			totalBookings,
			revenueResult,
			upcomingBookings,
		] = await Promise.all([
			User.countDocuments(),
			Rack.countDocuments(),
			Booking.countDocuments(),
			Transaction.aggregate([
				{ $match: { status: 'paid' } },
				{ $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
			]),
			Booking.find({ startTime: { $gte: new Date() } })
				.sort('startTime')
				.limit(5)
				.populate('user', 'name email')
				.populate('rack', 'name'),
		]);

		const totalRevenue =
			revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

		return {
			totalUsers,
			totalRacks,
			totalBookings,
			totalRevenue, // This will be in the smallest currency unit, e.g., paise
			upcomingBookings,
		};
	} catch (error) {
		throw new ApiError(
			500,
			'Failed to fetch dashboard statistics.',
			false,
			error.stack
		);
	}
};

const getUserById = async (userId) => {
	const user = await userRepo.findById(userId);
	if (!user) {
		throw new ApiError(404, 'User not found.');
	}
	return user;
};

const createUserByAdmin = async (userData) => {
	const { email, username } = userData;
	const userExists = await userRepo.findUserByEmailOrUsername(email, username);
	if (userExists) {
		throw new ApiError(409, 'A user with this email or username already exists.');
	}

	// Create the user
	const newUser = await userRepo.createUser(userData);

	// Generate verification token
	const verificationToken = newUser.generateEmailVerificationToken();
	await newUser.save();

	// Send verification email
	try {
		await sendVerificationEmail(newUser, verificationToken);
	} catch (error) {
		// If email fails, we might want to roll back user creation or handle it somehow
		// For now, we'll log the error and the user will exist without a verification email.
		console.error('Failed to send verification email:', error);
		// Optionally, you could delete the user here:
		// await User.findByIdAndDelete(newUser._id);
		// throw new ApiError(500, 'Failed to send verification email. User not created.');
	}


	newUser.password = undefined;
	return newUser;
};

const updateUserByAdmin = async (userId, updateData) => {
	const { rackId, bookingHours } = updateData;

	// Don't allow password updates through this method
	if (updateData.password) {
		delete updateData.password;
	}

	// If rackId and bookingHours are provided, create a booking
	if (rackId && bookingHours) {
		const bookingDetails = {
			rackId,
			startTime: new Date(),
			endTime: new Date(new Date().getTime() + bookingHours * 60 * 60 * 1000),
		};
		await bookingService.createBooking(userId, bookingDetails);
	}

	const user = await userRepo.updateUserById(userId, updateData);
	if (!user) {
		throw new ApiError(404, 'User not found.');
	}
	return user;
};

const deleteUserByAdmin = async (userId) => {
	const user = await userRepo.deleteById(userId);
	if (!user) {
		throw new ApiError(404, 'User not found.');
	}
	// TODO: Handle what happens to the deleted user's associated bookings or transactions.
	// For now, we perform a hard delete of the user document.
	return { message: 'User deleted successfully.' };
};

const deleteMultipleUsersByAdmin = async (userIds, adminId) => {
	// Filter out the admin's own ID to prevent self-deletion
	const filteredUserIds = userIds.filter(
		(id) => id.toString() !== adminId.toString()
	);

	if (filteredUserIds.length === 0 && userIds.length > 0) {
		throw new ApiError(400, 'Admin cannot delete their own account.');
	}

	const deletedCount = await User.deleteMany({ _id: { $in: filteredUserIds } });

	if (filteredUserIds.length < userIds.length) {
		return {
			message: `Successfully deleted ${deletedCount.deletedCount} user(s). Admin account was not deleted.`,
			deletedCount: deletedCount.deletedCount,
		};
	}

	return {
		message: `Successfully deleted ${deletedCount.deletedCount} user(s).`,
		deletedCount: deletedCount.deletedCount,
	};
};

const bulkUpdateUsers = async (userIds, updateData) => {
	try {
		// Don't allow password updates through bulk operations
		if (updateData.password) {
			delete updateData.password;
		}

		const result = await User.updateMany(
			{ _id: { $in: userIds } },
			{ $set: updateData }
		);

		return {
			message: `Successfully updated ${result.modifiedCount} user(s).`,
			modifiedCount: result.modifiedCount,
		};
	} catch (error) {
		throw new ApiError(500, 'Failed to bulk update users', false, error.stack);
	}
};

export {
	bulkUpdateUsers,
	createUserByAdmin,
	deleteMultipleUsersByAdmin,
	deleteUserByAdmin,
	getAllUsers,
	getDashboardStats,
	getUserById,
	getUserStats,
	updateUserByAdmin,
};
