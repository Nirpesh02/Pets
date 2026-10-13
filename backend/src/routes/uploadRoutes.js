import express from 'express';
import { uploadMedia } from '../middlewares/uploadMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

// @desc    Upload single image (e.g. for Banner or Product single upload)
// @route   POST /api/v1/upload/single
router.post('/single', (req, res) => {
  uploadMedia.single('image')(req, res, (err) => {
    if (err) {
      return sendError(res, err.message || 'Image upload failed', 400);
    }
    if (!req.file) {
      return sendError(res, 'Please provide an image file to upload.', 400);
    }
    const url = `/uploads/media/${req.file.filename}`;
    return sendSuccess(res, { url }, 'Image uploaded successfully');
  });
});

// @desc    Upload multiple images (e.g. for Product gallery)
// @route   POST /api/v1/upload/multiple
router.post('/multiple', (req, res) => {
  uploadMedia.array('images', 12)(req, res, (err) => {
    if (err) {
      return sendError(res, err.message || 'Images upload failed', 400);
    }
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'Please provide image files to upload.', 400);
    }
    const urls = req.files.map((f) => `/uploads/media/${f.filename}`);
    return sendSuccess(res, { urls }, `${urls.length} images uploaded successfully`);
  });
});

export default router;
