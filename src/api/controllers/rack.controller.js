import * as rackService from '#services/rack.service.js';

const createRack = async (req, res) => {
	const rack = await rackService.createRack(req.body);
	res.status(201).json({ success: true, data: rack });
};

const getPublicRacks = async (req, res) => {
	const result = await rackService.getPublicRacks(req.query);
	res.status(200).json({
		success: true,
		data: result.racks,
		pagination: result.pagination,
	});
};

const getPublicRackByDeviceId = async (req, res) => {
	const rack = await rackService.getPublicRackByDeviceId(req.params.deviceId);
	res.status(200).json({ success: true, data: rack });
};

const getAllRacks = async (req, res) => {
	const result = await rackService.getAllRacks(req.query);
	res.status(200).json({
		success: true,
		data: result.racks,
		pagination: result.pagination,
	});
};

const getRackById = async (req, res) => {
	const rack = await rackService.getRackById(req.params.id);
	res.status(200).json({ success: true, data: rack });
};

const updateRack = async (req, res) => {
	const rack = await rackService.updateRack(req.params.id, req.body);
	res.status(200).json({ success: true, data: rack });
};

const deleteRack = async (req, res) => {
	const result = await rackService.deleteRack(req.params.id);
	res.status(200).json({ success: true, data: result });
};

const deleteMultipleRacks = async (req, res) => {
	const { rackIds } = req.body;
	if (!rackIds || !Array.isArray(rackIds) || rackIds.length === 0) {
		throw new ApiError(400, 'Please provide an array of rack IDs.');
	}
	const result = await rackService.deleteMultipleRacks(rackIds);
	res.status(200).json({ success: true, data: result });
};

const bulkUpdateRacks = async (req, res) => {
	const { rackIds, updateData } = req.body;
	if (!rackIds || !Array.isArray(rackIds) || rackIds.length === 0) {
		throw new ApiError(400, 'Please provide an array of rack IDs.');
	}
	if (!updateData || Object.keys(updateData).length === 0) {
		throw new ApiError(400, 'Please provide update data.');
	}
	const result = await rackService.bulkUpdateRacks(rackIds, updateData);
	res.status(200).json({ success: true, data: result });
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
