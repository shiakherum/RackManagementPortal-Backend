import * as waitlistRepo from '#repositories/wait-list.repository.js';
import { ApiError } from '#utils/api-error.utils.js';

const getAllWaitlistEntries = async (filter, options) => {
	return waitlistRepo.findAll(filter, options);
};

const deleteWaitlistEntry = async (id) => {
	const entry = await waitlistRepo.deleteById(id);
	if (!entry) {
		throw new ApiError(404, 'Waitlist entry not found.');
	}
	return { message: 'Waitlist entry deleted successfully.' };
};

export { deleteWaitlistEntry, getAllWaitlistEntries };
