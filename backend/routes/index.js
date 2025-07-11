import { Router } from 'express';
import multer from 'multer';
import extractRoute from './extract.js';
import processRoute from './process.js';
import exportRoute, { exportDocxRoute } from './export.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/extract', upload.single('file'), extractRoute);
router.post('/process', processRoute);
router.post('/export/pdf', exportRoute);
router.post('/export/docx', exportDocxRoute);

export default router;
