const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');

// Upload Image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get Images (Cloudinary Search)
router.get('/images', async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:portfolio-gallery')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();
    
    const photos = resources.map(res => ({
      src: res.secure_url,
      width: res.width,
      height: res.height,
    }));
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Fetching images failed' });
  }
});

module.exports = router;
