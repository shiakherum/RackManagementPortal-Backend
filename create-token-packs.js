import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TokenPack from './src/models/token-pack.model.js';

dotenv.config();

// Connect to database
await mongoose.connect(process.env.MONGODB_URI);

console.log('Connected to database');

// Sample token packs (prices in paise, minimum ₹1.00 = 100 paise for Razorpay)
const tokenPacks = [
  {
    name: "Starter Pack",
    description: "Perfect for quick testing and small experiments.",
    tokensGranted: 10,
    price: 100, // ₹1.00 in paise (minimum for Razorpay)
    currency: "INR",
    isActive: true
  },
  {
    name: "Developer Pack",
    description: "Ideal for development and small projects.",
    tokensGranted: 50,
    price: 500, // ₹5.00 in paise
    currency: "INR",
    isActive: true
  },
  {
    name: "Professional Pack",
    description: "Great for production testing and demos.",
    tokensGranted: 200,
    price: 1000, // ₹10.00 in paise
    currency: "INR",
    isActive: true
  }
];

try {
  // Clear existing token packs
  await TokenPack.deleteMany({});
  console.log('Cleared existing token packs');

  // Insert new token packs
  const created = await TokenPack.insertMany(tokenPacks);
  console.log('Created token packs:', created.map(tp => ({ id: tp._id, name: tp.name, price: tp.price })));

  console.log('Token packs created successfully!');
} catch (error) {
  console.error('Error creating token packs:', error);
} finally {
  await mongoose.disconnect();
  console.log('Database connection closed');
}