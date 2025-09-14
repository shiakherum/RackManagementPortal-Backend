import * as waitlistService from '#services/wait-list.service.js';

const joinWaitlist = async (req, res) => {
	const newWaitlistEntry = await waitlistService.joinWaitlist(
		req.user.id,
		req.body
	);
	res.status(201).json({
		success: true,
		message: 'You have been successfully added to the waitlist.',
		data: newWaitlistEntry,
	});
};

export { joinWaitlist };
