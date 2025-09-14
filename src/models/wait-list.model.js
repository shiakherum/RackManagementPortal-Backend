import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
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
		desiredStartTime: {
			type: Date,
			required: true,
		},
		desiredEndTime: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ['waiting', 'notified', 'expired'],
			default: 'waiting',
		},
	},
	{
		collection: 'waitlists',
		timestamps: true,
	}
);

/**
 * Compound index to ensure a user can't be added multiple times
 * to the waitlist for the same rack and time slot.
 */
waitlistSchema.index(
	{ user: 1, rack: 1, desiredStartTime: 1 },
	{ unique: true }
);

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
