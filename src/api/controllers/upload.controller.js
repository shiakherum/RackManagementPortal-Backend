import { ApiError } from '#utils/api-error.utils.js';

const uploadTopologyDiagram = async (req, res) => {
	try {
		if (!req.file) {
			throw new ApiError(400, 'No image file provided');
		}

		const imageUrl = `/uploads/topology-diagrams/${req.file.filename}`;

		res.status(200).json({
			success: true,
			data: {
				imageUrl,
				filename: req.file.filename,
				originalName: req.file.originalname,
				size: req.file.size,
			},
			message: 'Image uploaded successfully',
		});
	} catch (error) {
		throw error;
	}
};

export { uploadTopologyDiagram };
