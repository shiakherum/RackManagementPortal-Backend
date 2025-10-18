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
}, (req, res, next) => {
	const multerUpload = upload.single('image');
	multerUpload(req, res, (err) => {
		console.log('=== After multer middleware ===');
		console.log('Multer error:', err);
		console.log('Body (after multer):', req.body);
		console.log('File:', req.file);
		console.log('Files:', req.files);

		if (err) {
			console.log('ERROR: Multer error occurred:', err);
			return res.status(400).json({
				success: false,
				message: err.message || 'File upload error',
			});
		}

		next();
	});
}, (req, res, next) => {
	try {
		if (!req.file) {
			console.log('ERROR: No file in request after multer');
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
