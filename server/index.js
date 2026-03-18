const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'placeholder'
);

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for verification codes
let verificationCodes = {};

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

// Helpers for Data Persistence
const getDataPath = (filename) => path.join(__dirname, 'data', filename);
const readData = (filename) => JSON.parse(fs.readFileSync(getDataPath(filename), 'utf8'));
const writeData = (filename, data) => fs.writeFileSync(getDataPath(filename), JSON.stringify(data, null, 2));

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

// Auth Endpoints
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Unauthorized email' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, expires: Date.now() + 600000 }; // 10 mins

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // App Password
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Admin Verification Code',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
    });
    res.json({ success: true, message: 'Code sent!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  const stored = verificationCodes[email];

  if (stored && stored.code === code && stored.expires > Date.now()) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    delete verificationCodes[email];
    res.json({ token });
  } else {
    res.status(400).json({ error: 'Invalid or expired code' });
  }
});

// Content Management Endpoints
app.get('/api/content/home', async (req, res) => {
  const { data, error } = await supabase.from('home_content').select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/content/home', authenticate, async (req, res) => {
  const { error } = await supabase.from('home_content').update(req.body).eq('id', 1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/content/blog', async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/content/blog', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/content/blog/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/content/blog/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/content/academics', async (req, res) => {
  const { data, error } = await supabase.from('academics').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/content/academics', authenticate, async (req, res) => {
  // Replace all academics with the new list
  const { error: deleteError } = await supabase.from('academics').delete().neq('id', 0);
  if (deleteError) return res.status(500).json({ error: deleteError.message });
  
  const { error: insertError } = await supabase.from('academics').insert(req.body);
  if (insertError) return res.status(500).json({ error: insertError.message });
  
  res.json({ success: true });
});

app.get('/api/content/extra', async (req, res) => {
  const { data, error } = await supabase.from('extra_activities').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/content/extra', authenticate, async (req, res) => {
  // Replace all activities with the new list
  const { error: deleteError } = await supabase.from('extra_activities').delete().neq('id', 0);
  if (deleteError) return res.status(500).json({ error: deleteError.message });
  
  const { error: insertError } = await supabase.from('extra_activities').insert(req.body);
  if (insertError) return res.status(500).json({ error: insertError.message });
  
  res.json({ success: true });
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

// Old Contact Endpoint (keeping for now, but should use nodemailer in real scenario)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Message received!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
