import * as adminService from '#services/admin.service.js';
import { ApiError } from '#utils/api-error.utils.js';

const getAllUsers = async (req, res) => {
	try {
		const result = await adminService.getAllUsers(req.query);
		res.status(200).json({
			success: true,
			count: result.users.length,
			data: result.users,
			pagination: result.pagination,
		});
	} catch (error) {
		throw error;
	}
};

const getUserStats = async (req, res) => {
	try {
		const stats = await adminService.getUserStats();
		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		throw error;
	}
};

const getDashboardStats = async (req, res) => {
	try {
		const stats = await adminService.getDashboardStats();
		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		throw error;
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await adminService.getUserById(req.params.id);
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		throw error;
	}
};

const createUser = async (req, res) => {
	try {
		const newUser = await adminService.createUserByAdmin(req.body);
		res.status(201).json({ success: true, data: newUser });
	} catch (error) {
		throw error;
	}
};

const updateUser = async (req, res) => {
	try {
		const updatedUser = await adminService.updateUserByAdmin(
			req.params.id,
			req.body
		);
		res.status(200).json({ success: true, data: updatedUser });
	} catch (error) {
		throw error;
	}
};

const deleteUser = async (req, res) => {
	try {
		const result = await adminService.deleteUserByAdmin(req.params.id);
		res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		throw error;
	}
};

const deleteMultipleUsers = async (req, res) => {
	try {
		const { userIds } = req.body;
		const adminId = req.user.id;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			throw new ApiError(400, 'Please provide an array of user IDs to delete.');
		}

		const result = await adminService.deleteMultipleUsersByAdmin(
			userIds,
			adminId
		);
		res.status(200).json({ success: true, data: result });
	} catch (error) {
		throw error;
	}
};

const bulkUpdateUsers = async (req, res) => {
	try {
		const { userIds, updateData } = req.body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			throw new ApiError(400, 'Please provide an array of user IDs to update.');
		}

		if (!updateData || Object.keys(updateData).length === 0) {
			throw new ApiError(400, 'Please provide update data.');
		}

		const result = await adminService.bulkUpdateUsers(userIds, updateData);
		res.status(200).json({ success: true, data: result });
	} catch (error) {
		throw error;
	}
};

export {
	bulkUpdateUsers,
	createUser,
	deleteMultipleUsers,
	deleteUser,
	getAllUsers,
	getDashboardStats,
	getUserById,
	getUserStats,
	updateUser,
};
