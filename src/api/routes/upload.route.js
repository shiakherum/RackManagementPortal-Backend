import { authorize, protect } from '#middlewares/auth.middleware.js';
import upload from '#middlewares/upload.middleware.js';
import { Router } from 'express';

const router = Router();

// Apply authentication middleware
router.use(protect, authorize('Admin'));

// Upload topology diagram endpoint
router.post('/topology-diagram', upload.single('image'), (req, res, next) => {
	try {
		if (!req.file) {
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
