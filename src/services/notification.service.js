import logger from '#config/logger.config.js';

export const notifyUser = async (userId, message) => {
	// TODO: Build this
	// In a real application, you would add logic here to:
	// 1. Find the user's notification preferences (e.g., email, telegramId).
	// 2. Call the appropriate service (e.g., Telegram Bot API, SendGrid API).
	logger.info(`--- NOTIFICATION ---`);
	logger.info(`TO: User ${userId}`);
	logger.info(`MESSAGE: ${message}`);
	logger.info(`--------------------`);
	// For now, we just resolve successfully.
	return Promise.resolve();
};
