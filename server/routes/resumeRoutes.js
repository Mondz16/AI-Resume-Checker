import express from 'express';
import { uploadFile } from '../controller/resumeController.js';
import { UPLOADS_DIR } from '../helper/resumeHelpers.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit'
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const MAX_FILE_SIZE_MB = 10;

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are accepted."));
    }
    cb(null, true);
  },
});

const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload requests. Please wait before trying again." },
});

router.post('/upload' ,heavyLimiter , upload.single("resume"), uploadFile);


export default router;