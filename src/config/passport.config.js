import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '#models/user.model.js';
import passport from 'passport';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

// Check if required environment variables are present
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	console.error('Missing Google OAuth environment variables:');
	console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
	console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
	console.warn('Google OAuth will be disabled. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
} else {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: process.env.NODE_ENV === 'production'
					? 'https://acirackrentals.com/api/v1/auth/google/callback'
					: '/api/v1/auth/google/callback',
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					let user = await User.findOne({ googleId: profile.id });

					if (user) {
						return done(null, user);
					}

					let existingUser = await User.findOne({ email: profile.emails[0].value });

					if (existingUser) {
						existingUser.googleId = profile.id;
						await existingUser.save();
						return done(null, existingUser);
					}

					// Generate a username that fits the 20-character limit
					const emailPrefix = profile.emails[0].value.split('@')[0];
					const shortPrefix = emailPrefix.length > 12 ? emailPrefix.substring(0, 12) : emailPrefix;
					const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 chars max
					const username = shortPrefix + '_' + randomSuffix; // Max 12 + 1 + 6 = 19 chars

					const newUser = await User.create({
						googleId: profile.id,
						firstName: profile.name.givenName || '',
						lastName: profile.name.familyName || '',
						username: username,
						email: profile.emails[0].value,
						password: Math.random().toString(36).substring(2, 15),
						isEmailVerified: true,
					});

					return done(null, newUser);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (error) {
			done(error, null);
		}
	});
}

export default passport;