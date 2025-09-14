import * as tokenPackService from '#services/token-pack.service.js';

const createTokenPack = async (req, res) => {
	const pack = await tokenPackService.createTokenPack(req.body);
	res.status(201).json({ success: true, data: pack });
};

const getAllTokenPacks = async (req, res) => {
	const result = await tokenPackService.getAllTokenPacks(req.query);
	res.status(200).json({
		success: true,
		data: result.tokenPacks,
		pagination: result.pagination,
	});
};

const getTokenPackById = async (req, res) => {
	const pack = await tokenPackService.getTokenPackById(req.params.id);
	res.status(200).json({ success: true, data: pack });
};

const updateTokenPack = async (req, res) => {
	const pack = await tokenPackService.updateTokenPack(req.params.id, req.body);
	res.status(200).json({ success: true, data: pack });
};

const deleteTokenPack = async (req, res) => {
	const result = await tokenPackService.deleteTokenPack(req.params.id);
	res.status(200).json({ success: true, data: result });
};

const deleteMultipleTokenPacks = async (req, res) => {
	const { packIds } = req.body;
	if (!packIds || !Array.isArray(packIds) || packIds.length === 0) {
		throw new ApiError(400, 'Please provide an array of token pack IDs.');
	}
	const result = await tokenPackService.deleteMultipleTokenPacks(packIds);
	res.status(200).json({ success: true, data: result });
};

const bulkUpdateTokenPacks = async (req, res) => {
	const { packIds, updateData } = req.body;
	if (!packIds || !Array.isArray(packIds) || packIds.length === 0) {
		throw new ApiError(400, 'Please provide an array of token pack IDs.');
	}
	if (!updateData || Object.keys(updateData).length === 0) {
		throw new ApiError(400, 'Please provide update data.');
	}
	const result = await tokenPackService.bulkUpdateTokenPacks(
		packIds,
		updateData
	);
	res.status(200).json({ success: true, data: result });
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
