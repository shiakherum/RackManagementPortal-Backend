import Joi from 'joi';

const createRack = {
	body: Joi.object().keys({
		name: Joi.string().required(),
		description: Joi.string().required(),
		location: Joi.string(),
		status: Joi.string().valid('available', 'not available'),
		powerStatus: Joi.string().valid('on', 'off', 'unknown'),
		deviceId: Joi.string().required(),
		availableAciVersions: Joi.array().items(Joi.string()),
		preConfigOptions: Joi.array().items(Joi.string()),
		topologyDiagram: Joi.string(),
		topologyHtmlMap: Joi.string(),
		titleFeature: Joi.string(),
		specifications: Joi.array().items(
			Joi.object({
				specName: Joi.string(),
				specValue: Joi.string(),
			})
		),
		featuresList: Joi.array().items(Joi.string()),
		ctaFinalLine: Joi.string(),
		tokenCostPerHour: Joi.number(),
	}),
};

const updateRack = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
	body: Joi.object()
		.keys({
			name: Joi.string(),
			description: Joi.string(),
			location: Joi.string(),
			status: Joi.string().valid('available', 'not available'),
			powerStatus: Joi.string().valid('on', 'off', 'unknown'),
			deviceId: Joi.string(),
			availableAciVersions: Joi.array().items(Joi.string()),
			preConfigOptions: Joi.array().items(Joi.string()),
			topologyDiagram: Joi.string(),
			topologyHtmlMap: Joi.string(),
			titleFeature: Joi.string(),
			specifications: Joi.array().items(
				Joi.object({
					specName: Joi.string(),
					specValue: Joi.string(),
				})
			),
			featuresList: Joi.array().items(Joi.string()),
			ctaFinalLine: Joi.string(),
			tokenCostPerHour: Joi.number(),
		})
		.min(1),
};

export { createRack, updateRack };
