import User from '#models/user.model.js';

const findUserByEmailOrUsername = async (email, username) => {
	return User.findOne({ $or: [{ email }, { username }] });
};

const createUser = async (userData) => {
	return User.create(userData);
};

const findUserByEmailOrUsernameWithPassword = async (login) => {
	return User.findOne({
		$or: [{ email: login }, { username: login }],
	}).select('+password +isEmailVerified');
};

const findAllUsers = async () => {
	return User.find().select('-password');
};

const updateUserById = async (id, updateData, options = {}) => {
	return User.findByIdAndUpdate(id, updateData, { new: true, ...options });
};

const findById = async (id) => {
	return User.findById(id).select('-password');
};

const deleteById = async (id) => {
	return User.findByIdAndDelete(id);
};

export {
	createUser,
	deleteById,
	findAllUsers,
	findById,
	findUserByEmailOrUsername,
	findUserByEmailOrUsernameWithPassword,
	updateUserById,
};