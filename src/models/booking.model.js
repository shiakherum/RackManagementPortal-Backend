import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		rack: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Rack',
			required: true,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
		tokenCost: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ['confirmed', 'completed', 'cancelled', 'provisioning'],
			default: 'confirmed',
		},
		selectedAciVersion: {
			type: String,
		},
		selectedPreConfigs: {
			type: [String],
		},
		isProvisioned: {
			type: Boolean,
			default: false,
		},
		provisioningLog: {
			// For storing logs from the Python provisioning script
			type: String,
		},
	},
	{
		collection: 'bookings',
		timestamps: true,
	}
);

/**
 * Unique compound index to prevent a single rack from being booked
 * for the same time slot by multiple users.
 *
 * NOTE: This does not prevent **overlapping** time ranges — only exact duplicates.
 */
bookingSchema.index({ rack: 1, startTime: 1, endTime: 1 }, { unique: true });

// Virtual field to check if booking is expired/completed
bookingSchema.virtual('isExpired').get(function() {
	return this.endTime < new Date() && this.status === 'confirmed';
});

// Auto-mark bookings as completed when they expire
bookingSchema.pre('save', function(next) {
	if (this.endTime < new Date() && this.status === 'confirmed') {
		this.status = 'completed';
	}
	next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
