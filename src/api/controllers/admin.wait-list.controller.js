import * as adminWaitlistService from '#services/admin.waitlist.service.js';

const getAllWaitlistEntries = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;
	const sort = req.query.sort || '-createdAt';

	const { data: entries, total } =
		await adminWaitlistService.getAllWaitlistEntries({}, { limit, skip, sort });

	res.status(200).json({
		success: true,
		pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
		data: entries,
	});
};

const deleteWaitlistEntry = async (req, res) => {
	await adminWaitlistService.deleteWaitlistEntry(req.params.id);
	res
		.status(200)
		.json({ success: true, message: 'Waitlist entry deleted successfully.' });
};

export { deleteWaitlistEntry, getAllWaitlistEntries };
