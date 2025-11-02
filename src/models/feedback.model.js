import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Booking',
			required: true,
		},
		rack: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Rack',
			required: true,
		},
		// Overall rating (1-5 stars)
		overallRating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		// Specific ratings
		hardwareQuality: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		connectionStability: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		easeOfUse: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		valueForMoney: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		// Questions
		whatDidYouLike: {
			type: String,
			trim: true,
		},
		whatCanBeImproved: {
			type: String,
			trim: true,
		},
		wouldRecommend: {
			type: Boolean,
			required: true,
		},
		additionalComments: {
			type: String,
			trim: true,
		},
		// Metadata
		submittedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		collection: 'feedbacks',
		timestamps: true,
	}
);

// Ensure one feedback per booking
feedbackSchema.index({ booking: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
