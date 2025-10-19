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

const getPublicRacks = async (queryParams = {}) => {
	const {
		page = 1,
		limit = 50,
		sort = 'name',
	} = queryParams;

	// Only show available racks for public view
	const query = { status: 'available' };

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
		Rack.find(query)
			.select('name description titleFeature tokenCostPerHour specifications featuresList ctaFinalLine topologyDiagram deviceId')
			.sort(sortObject)
			.skip(skip)
			.limit(limitNum),
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

const getPublicRackByDeviceId = async (deviceId) => {
	const rack = await Rack.findOne({ deviceId, status: 'available' })
		.select('name description titleFeature tokenCostPerHour specifications featuresList ctaFinalLine topologyDiagram deviceId availableAciVersions preConfigOptions');

	if (!rack) {
		throw new ApiError(404, 'Rack not found or not available.');
	}
	return rack;
};

const getRackById = async (id) => {
	const rack = await rackRepo.findById(id);
	if (!rack) {
		throw new ApiError(404, 'Rack not found.');
	}
	return rack;
};

const updateRack = async (id, updateData) => {
	const {
		name,
		description,
		location,
		status,
		powerStatus,
		deviceId,
		availableAciVersions,
		preConfigOptions,
		topologyDiagram,
		topologyHtmlMap,
		titleFeature,
		specifications,
		featuresList,
		ctaFinalLine,
		tokenCostPerHour,
		vncConnection,
	} = updateData;

	// Build the update object
	const updateObject = {};
	if (name !== undefined) updateObject.name = name;
	if (description !== undefined) updateObject.description = description;
	if (location !== undefined) updateObject.location = location;
	if (status !== undefined) updateObject.status = status;
	if (powerStatus !== undefined) updateObject.powerStatus = powerStatus;
	if (deviceId !== undefined) updateObject.deviceId = deviceId;
	if (availableAciVersions !== undefined)
		updateObject.availableAciVersions = availableAciVersions;
	if (preConfigOptions !== undefined) updateObject.preConfigOptions = preConfigOptions;
	if (topologyDiagram !== undefined) updateObject.topologyDiagram = topologyDiagram;
	if (topologyHtmlMap !== undefined) updateObject.topologyHtmlMap = topologyHtmlMap;
	if (titleFeature !== undefined) updateObject.titleFeature = titleFeature;
	if (specifications !== undefined) updateObject.specifications = specifications;
	if (featuresList !== undefined) updateObject.featuresList = featuresList;
	if (ctaFinalLine !== undefined) updateObject.ctaFinalLine = ctaFinalLine;
	if (tokenCostPerHour !== undefined) updateObject.tokenCostPerHour = tokenCostPerHour;
	if (vncConnection !== undefined) updateObject.vncConnection = vncConnection;

	const rack = await rackRepo.updateById(id, { $set: updateObject });
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
	getPublicRacks,
	getPublicRackByDeviceId,
	getRackById,
	updateRack,
};
