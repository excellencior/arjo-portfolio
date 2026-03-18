const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio-gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

// Photography Endpoints
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/images', async (req, res) => {
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

// Blog Endpoints (Mock for now)
app.get('/api/posts', (req, res) => {
  res.json([
    { id: '1', title: 'Starting my Journey', date: 'March 18, 2026', excerpt: 'Looking back at how it all started...' },
    { id: '2', title: 'Why Minimalism Matters', date: 'March 15, 2026', excerpt: 'Exploring the beauty of simple design...' }
  ]);
});

// Contact Endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Message received!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
