import mongoose from 'mongoose';

const tokenPackSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true, // e.g., "Starter Pack"
		},
		description: {
			type: String,
		},
		tokensGranted: {
			type: Number,
			required: true, // e.g., 100
		},
		price: {
			// Price in smallest currency unit (e.g., cents for USD)
			// e.g., 1000 for $10.00
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: 'USD',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		collection: 'tokenpacks',
	}
);

const TokenPack = mongoose.model('TokenPack', tokenPackSchema);

export default TokenPack;
