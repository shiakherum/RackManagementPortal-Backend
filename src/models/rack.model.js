import mongoose from 'mongoose';

const rackSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		location: {
			// e.g., 'Data Center A, Row 5' (optional)
			type: String,
		},
		status: {
			type: String,
			enum: ['available', 'not available'],
			default: 'available',
		},
		powerStatus: {
			type: String,
			enum: ['on', 'off', 'unknown'],
			default: 'unknown',
		},
		deviceId: {
			// A unique ID for the hardware/IoT controller
			type: String,
			required: true,
			unique: true,
		},
		availableAciVersions: {
			// e.g., ['5.2(1g)', '6.0(2h)', '6.0(3c)']
			type: [String],
			default: [],
		},
		preConfigOptions: {
			// e.g., ['Register switches in advance', 'Pre-install APIC']
			type: [String],
			default: [],
		},
		topologyDiagram: {
			// URL or path to the topology diagram image
			type: String,
			default: '',
		},
		topologyHtmlMap: {
			// HTML image map for interactive topology
			type: String,
			default: '',
		},
		titleFeature: {
			type: String,
			trim: true,
		},
		specifications: [
			{
				specName: String,
				specValue: String,
			},
		],
		featuresList: {
			type: [String],
			default: [],
		},
		ctaFinalLine: {
			type: String,
			trim: true,
		},
		tokenCostPerHour: {
			type: Number,
			default: 0,
		},
		vncConnection: {
			host: {
				type: String,
				trim: true,
				// e.g., '122.179.154.82'
			},
			port: {
				type: Number,
				// e.g., 2000
			},
			password: {
				type: String,
				// VNC password
			},
		},
	},
	{
		collection: 'racks',
		timestamps: true,
	}
);

const Rack = mongoose.model('Rack', rackSchema);

export default Rack;
