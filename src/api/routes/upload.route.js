import { authorize, protect } from '#middlewares/auth.middleware.js';
import upload from '#middlewares/upload.middleware.js';
import { Router } from 'express';

const router = Router();

// Apply authentication middleware
router.use(protect, authorize('Admin'));

// Upload topology diagram endpoint
router.post('/topology-diagram', (req, res, next) => {
	console.log('=== Upload endpoint hit ===');
	console.log('All Headers:', req.headers);
	console.log('Content-Type:', req.headers['content-type']);
	console.log('Authorization:', req.headers['authorization']);
	console.log('Body (before multer):', req.body);
	next();
}, upload.single('image'), (req, res, next) => {
	try {
		console.log('=== After multer middleware ===');
		console.log('Body (after multer):', req.body);
		console.log('File:', req.file);
		console.log('Files:', req.files);

		if (!req.file) {
			console.log('ERROR: No file in request');
			return res.status(400).json({
				success: false,
				message: 'No file uploaded',
			});
		}

		// Construct the URL path for the uploaded file
		const imageUrl = `/uploads/topology-diagrams/${req.file.filename}`;

		res.status(200).json({
			success: true,
			message: 'Image uploaded successfully',
			data: {
				imageUrl: imageUrl,
				filename: req.file.filename,
				originalName: req.file.originalname,
				size: req.file.size,
				mimetype: req.file.mimetype,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
