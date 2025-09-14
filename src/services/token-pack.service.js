import TokenPack from '#models/token-pack.model.js';
import * as tokenPackRepo from '#repositories/token-pack.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const createTokenPack = async (packData) => {
	return tokenPackRepo.create(packData);
};

const getAllTokenPacks = async (queryParams = {}) => {
	const {
		page = 1,
		limit = 10,
		search = '',
		status = '',
		sort = 'price',
	} = queryParams;

	let query = {};
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ description: { $regex: search, $options: 'i' } },
		];
	}
	if (status && status !== 'all') {
		query.isActive = status === 'active';
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

	const [tokenPacks, total] = await Promise.all([
		TokenPack.find(query).sort(sortObject).skip(skip).limit(limitNum),
		TokenPack.countDocuments(query),
	]);

	return {
		tokenPacks,
		pagination: {
			page: pageNum,
			limit: limitNum,
			total,
			totalPages: Math.ceil(total / limitNum),
		},
	};
};

const getTokenPackById = async (id) => {
	const pack = await tokenPackRepo.findById(id);
	if (!pack) {
		throw new ApiError(404, 'Token Pack not found.');
	}
	return pack;
};

const updateTokenPack = async (id, updateData) => {
	const pack = await tokenPackRepo.updateById(id, updateData);
	if (!pack) {
		throw new ApiError(404, 'Token Pack not found.');
	}
	return pack;
};

const deleteTokenPack = async (id) => {
	const pack = await tokenPackRepo.deleteById(id);
	if (!pack) {
		throw new ApiError(404, 'Token Pack not found.');
	}
	return { message: 'Token Pack deleted successfully.' };
};

const deleteMultipleTokenPacks = async (packIds) => {
	const result = await TokenPack.deleteMany({ _id: { $in: packIds } });
	if (result.deletedCount === 0) {
		throw new ApiError(404, 'No matching token packs found to delete.');
	}
	return {
		message: `Successfully deleted ${result.deletedCount} token pack(s).`,
	};
};

const bulkUpdateTokenPacks = async (packIds, updateData) => {
	const result = await TokenPack.updateMany(
		{ _id: { $in: packIds } },
		{ $set: updateData }
	);
	if (result.matchedCount === 0) {
		throw new ApiError(404, 'No matching token packs found to update.');
	}
	return {
		message: `Successfully updated ${result.modifiedCount} of ${result.matchedCount} matched token pack(s).`,
	};
};

export {
	bulkUpdateTokenPacks,
	createTokenPack,
	deleteMultipleTokenPacks,
	deleteTokenPack,
	getAllTokenPacks,
	getTokenPackById,
	updateTokenPack,
};
