import Rack from '#models/rack.model.js';
import * as rackRepo from '#repositories/rack.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const createRack = async (rackData) => {
	return rackRepo.create(rackData);
};

const getAllRacks = async (queryParams = {}) => {
	const {
		page = 1,
		limit = 10,
		search = '',
		status = '',
		sort = 'name',
	} = queryParams;

	let query = {};
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ deviceId: { $regex: search, $options: 'i' } },
			{ description: { $regex: search, $options: 'i' } },
		];
	}
	if (status && status !== 'all') {
		query.status = status;
	}

	const pageNum = parseInt(page);
	const limitNum = parseInt(limit);
	const skip = (pageNum - 1) * limitNum;

	let sortObject = {};
	if (sort.startsWith('-')) {
		sortObject[sort.substring(1)] = -1;
	} else {
		sortObject[sort] = 1;
	}

	const [racks, total] = await Promise.all([
		Rack.find(query).sort(sortObject).skip(skip).limit(limitNum),
		Rack.countDocuments(query),
	]);

	return {
		racks,
		pagination: {
			page: pageNum,
			limit: limitNum,
			total,
			totalPages: Math.ceil(total / limitNum),
		},
	};
};

const getRackById = async (id) => {
	const rack = await rackRepo.findById(id);
	if (!rack) {
		throw new ApiError(404, 'Rack not found.');
	}
	return rack;
};

const updateRack = async (id, updateData) => {
	const rack = await rackRepo.updateById(id, updateData);
	if (!rack) {
		throw new ApiError(404, 'Rack not found.');
	}
	return rack;
};

const deleteRack = async (id) => {
	await rackRepo.deleteById(id);
	// TODO: Optional: Also delete associated bookings or handle as needed
	return { message: 'Rack deleted successfully.' };
};

const deleteMultipleRacks = async (rackIds) => {
	const result = await Rack.deleteMany({ _id: { $in: rackIds } });
	if (result.deletedCount === 0) {
		throw new ApiError(404, 'No matching racks found to delete.');
	}
	return { message: `Successfully deleted ${result.deletedCount} rack(s).` };
};

const bulkUpdateRacks = async (rackIds, updateData) => {
	const result = await Rack.updateMany(
		{ _id: { $in: rackIds } },
		{ $set: updateData }
	);
	if (result.matchedCount === 0) {
		throw new ApiError(404, 'No matching racks found to update.');
	}
	return {
		message: `Successfully updated ${result.modifiedCount} of ${result.matchedCount} matched rack(s).`,
	};
};

export {
	bulkUpdateRacks,
	createRack,
	deleteMultipleRacks,
	deleteRack,
	getAllRacks,
	getRackById,
	updateRack,
};
