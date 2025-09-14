import Rack from '#models/rack.model.js';

const create = async (rackData) => {
	return Rack.create(rackData);
};

const findAll = async (filter = {}, options = {}) => {
	const { limit, skip, sort } = options;
	const dataQuery = Rack.find(filter).sort(sort).skip(skip).limit(limit);
	const totalQuery = Rack.countDocuments(filter);
	const [data, total] = await Promise.all([
		dataQuery.exec(),
		totalQuery.exec(),
	]);
	return { data, total };
};

const findById = async (id) => {
	return Rack.findById(id);
};

const updateById = async (id, updateData) => {
	return Rack.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true,
	});
};

const deleteById = async (id) => {
	return Rack.findByIdAndDelete(id);
};

export { create, deleteById, findAll, findById, updateById };
