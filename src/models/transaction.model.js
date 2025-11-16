import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		tokenPack: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'TokenPack',
			required: true,
		},
		amount: {
			// Amount in smallest currency unit (e.g., cents for USD)
			// e.g., 1000 for $10.00
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['created', 'paid', 'failed'],
			default: 'created',
		},
		razorpayOrderId: {
			type: String,
			required: true,
		},
		razorpayPaymentId: {
			type: String,
		},
		razorpaySignature: {
			type: String,
		},
	},
	{
		timestamps: true,
		collection: 'transactions',
	}
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
