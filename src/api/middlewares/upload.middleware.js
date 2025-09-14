import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the backend root directory (parent of src)
const backendRoot = path.resolve(__dirname, '../../../');
const uploadsDir = path.join(backendRoot, 'uploads/topology-diagrams');

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		// Generate unique filename with timestamp
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, 'topology-' + uniqueSuffix + path.extname(file.originalname));
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only PNG and JPG images are allowed'), false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: fileFilter,
});

export default upload;
