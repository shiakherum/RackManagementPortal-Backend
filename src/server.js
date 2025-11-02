import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from '#config/db.config.js';
import logger from '#config/logger.config.js';
import passport from '#config/passport.config.js';
import errorHandler from '#middlewares/error.middleware.js';
import adminBookingRoutes from '#routes/admin.booking.route.js';
import adminRoutes from '#routes/admin.route.js';
import authRoutes from '#routes/auth.route.js';
import bookingRoutes from '#routes/booking.route.js';
import feedbackRoutes from '#routes/feedback.route.js';
import orderRoutes from '#routes/order.route.js';
import publicRackRoutes from '#routes/public.rack.route.js';
import rackRoutes from '#routes/rack.route.js';
import rackAccessRoutes from '#routes/rack-access.route.js';
import tokenPackRoutes from '#routes/token-pack.route.js';
import transactionRoutes from '#routes/transaction.route.js';
import uploadRoutes from '#routes/upload.route.js';
import waitlistRoutes from '#routes/wait-list.route.js';
import adminTransactionRoutes from './api/routes/admin.transaction.route.js';
import adminWaitlistRoutes from './api/routes/admin.wait-list.route.js';
import { startCleanupScheduler } from './services/rack-access.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createUploadDirs = () => {
	const backendRoot = path.resolve(__dirname, '..');
	const dirs = [
		path.join(backendRoot, 'uploads'),
		path.join(backendRoot, 'uploads/topology-diagrams'),
	];

	dirs.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`Created directory: ${dir}`);
		}
	});
};

const setupSSL = () => {
	try {
		const sslPath = path.resolve(__dirname, '..');

		console.log('Loading SSL certificates from:', sslPath);

		const privateKeyPath = path.join(sslPath, 'private_key_unencrypted.txt');
		const certificatePath = path.join(sslPath, 'certificate.txt');
		const certificateChainPath = path.join(sslPath, 'certificate_chain.txt');

		if (
			!fs.existsSync(privateKeyPath) ||
			!fs.existsSync(certificatePath) ||
			!fs.existsSync(certificateChainPath)
		) {
			logger.warn('SSL certificate files not found. Skipping HTTPS setup.');
			return null;
		}

		let privateKey = fs.readFileSync(privateKeyPath, 'utf8');
		let certificate = fs.readFileSync(certificatePath, 'utf8');
		let certificateChain = fs.readFileSync(certificateChainPath, 'utf8');

		privateKey = privateKey.trim();
		certificate = certificate.trim();
		certificateChain = certificateChain.trim();

		console.log('Private key starts with:', privateKey.substring(0, 50));
		console.log('Certificate starts with:', certificate.substring(0, 50));

		if (!privateKey.includes('-----BEGIN')) {
			throw new Error('Private key does not appear to be in PEM format');
		}

		if (!certificate.includes('-----BEGIN CERTIFICATE-----')) {
			throw new Error('Certificate does not appear to be in PEM format');
		}

		const fullCertificate = certificate + '\n' + certificateChain;

		return {
			key: privateKey,
			cert: fullCertificate,
		};
	} catch (error) {
		logger.error('Error reading SSL certificates:', error.message);
		console.error('Full error:', error);
		throw new Error('Failed to load SSL certificates: ' + error.message);
	}
};

createUploadDirs();
connectDB();

// Start VNC connection cleanup scheduler
startCleanupScheduler();

const app = express();

// Custom CORS middleware for better debugging and control
const allowedOrigins = new Set([
	'https://acirackrentals.com',
	'https://www.acirackrentals.com',
	// Development origins (remove in production)
	...(process.env.NODE_ENV !== 'production' ? [
		'http://localhost:3000',
		'https://localhost:3000',
		'https://acirackrentals.com:3000',
		'https://acirackrentals.com:5443'
	] : [])
]);

app.use((req, res, next) => {
	const origin = req.headers.origin;

	// Always log to verify preflights hit Node
	console.log(`[CORS] ${req.method} ${req.url} | Origin: ${origin}`);

	if (origin && allowedOrigins.has(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin'); // important for proxies/caches
		res.setHeader('Access-Control-Allow-Credentials', 'true');
	}

	// Methods
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,POST,PUT,PATCH,DELETE,OPTIONS'
	);

	// Mirror whatever headers browser plans to send (safer than a fixed list)
	const reqHeaders = req.headers['access-control-request-headers'];
	res.setHeader(
		'Access-Control-Allow-Headers',
		reqHeaders || 'Content-Type, Authorization, X-Requested-With'
	);

	// Optional: cache preflight for 10 minutes
	res.setHeader('Access-Control-Max-Age', '600');

	if (req.method === 'OPTIONS') {
		return res.status(204).end(); // no content
	}

	next();
});

app.use(cookieParser());
app.use(passport.initialize());

const backendRoot = path.resolve(__dirname, '..');
console.log(backendRoot);
app.use('/uploads', express.static(path.join(backendRoot, 'uploads')));

// IMPORTANT: Upload routes must come BEFORE body parsers to handle multipart data
app.use('/api/v1/upload', uploadRoutes);

// Body parsers - these will NOT run for upload routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Other routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/token-packs', tokenPackRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/public/racks', publicRackRoutes);
app.use('/api/v1/racks', rackRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/rack-access', rackAccessRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/admin/bookings', adminBookingRoutes);
app.use('/api/v1/admin/transactions', adminTransactionRoutes);
app.use('/api/v1/admin/waitlist', adminWaitlistRoutes);

app.get('/', (_req, res) => {
	res.send('Rack Management Portal API is running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

const useSSL =
	process.env.USE_SSL === 'true' || process.env.NODE_ENV === 'production';

if (useSSL) {
	const sslOptions = setupSSL();
	if (sslOptions) {
		const httpsServer = https.createServer(sslOptions, app);
		httpsServer.listen(HTTPS_PORT, () => {
			logger.info(
				`HTTPS Server running in ${process.env.NODE_ENV} mode on port ${HTTPS_PORT}`
			);
		});
	} else {
		app.listen(PORT, () => {
			logger.warn(
				`HTTPS setup failed, falling back to HTTP server on port ${PORT}`
			);
		});
	}
} else {
	app.listen(PORT, () => {
		logger.info(
			`HTTP Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
		);
	});
}
