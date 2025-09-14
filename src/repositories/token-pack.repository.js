import TokenPack from '#models/token-pack.model.js';

const create = async (packData) => {
	return TokenPack.create(packData);
};

const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;

	const dataQuery = TokenPack.find(filter).sort(sort).skip(skip).limit(limit);
	const totalQuery = TokenPack.countDocuments(filter);

	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);

	return { data, total };
};

const findById = async (id) => {
	return TokenPack.findById(id);
};

const updateById = async (id, updateData) => {
	return TokenPack.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true,
	});
};

const deleteById = async (id) => {
	return TokenPack.findByIdAndDelete(id);
};

export { create, deleteById, findAll, findById, updateById };
