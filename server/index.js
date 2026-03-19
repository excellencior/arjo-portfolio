const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const crypto = require('crypto');

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
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

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
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  // Dev Mode Bypass
  if (process.env.DEV_MODE_ALLOWED === 'true' && token === process.env.DEV_TOKEN) {
    req.user = { email: process.env.ADMIN_EMAIL, dev: true };
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check session in Supabase
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token_hash', token)
      .single();
      
    if (error || !session) {
      return res.status(401).json({ error: 'Session expired due to inactivity' });
    }
    
    // Update last activity
    await supabase.from('admin_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('token_hash', token);
    
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

app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const stored = verificationCodes[email];

  if (stored && stored.code === code && stored.expires > Date.now()) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    
    // Register session in Supabase
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert([{ token_hash: token, last_activity: new Date().toISOString() }]);
      
    if (sessionError) console.error('Session record failed:', sessionError);

    delete verificationCodes[email];
    res.json({ token });
  } else {
    res.status(400).json({ error: 'Invalid or expired code' });
  }
});

// Background task: Purge sessions inactive for > 10 mins
cron.schedule('* * * * *', async () => {
  // Check if any active sessions exist first to avoid unnecessary overhead
  const { data: activeSessions, error: findError } = await supabase
    .from('admin_sessions')
    .select('id', { head: true, count: 'exact' });
    
  if (findError || !activeSessions || activeSessions.length === 0) return;

  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('admin_sessions')
    .delete()
    .lt('last_activity', tenMinsAgo);
    
  if (error) console.error('Cron purge error:', error);
});

// Content Management Endpoints
app.get('/api/content/home', async (req, res) => {
  try {
    const { data, error } = await supabase.from('home_content').select('*').limit(1);
    if (error) {
      console.error('Supabase Error (Home Content):', error.message);
      return res.status(500).json({ error: 'Failed to fetch home content' });
    }
    
    // Return the first item or a default object if empty
    if (!data || data.length === 0) {
      return res.json({ title: 'Welcome', subtitle: 'Bio coming soon...', links: [] });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Server Internal Error (Home Content):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.put('/api/content/home', authenticate, async (req, res) => {
  const { error } = await supabase.from('home_content').update(req.body).eq('id', 1);
  if (error) {
    console.error('Supabase Error (Home Update):', error.message);
    return res.status(500).json({ error: 'Failed to update home content' });
  }
  res.json({ success: true });
});

app.get('/api/content/blog', async (req, res) => {
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Supabase Error (Blog Posts):', error.message);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Blog Posts):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.get('/api/content/blog/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
    if (error) {
      console.error('Supabase Error (Single Blog Post):', error.message);
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Single Blog Post):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.post('/api/content/blog', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
  if (error) {
    console.error('Supabase Error (Blog Insert):', error.message);
    return res.status(500).json({ error: 'Failed to create blog post' });
  }
  res.json(data);
});

app.put('/api/content/blog/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
  if (error) {
    console.error('Supabase Error (Blog Update):', error.message);
    return res.status(500).json({ error: 'Failed to update blog post' });
  }
  res.json(data);
});

app.delete('/api/content/blog/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) {
    console.error('Supabase Error (Blog Delete):', error.message);
    return res.status(500).json({ error: 'Failed to delete blog post' });
  }
  res.json({ success: true });
});

app.get('/api/content/academics', async (req, res) => {
  try {
    const { data, error } = await supabase.from('academics').select('*');
    if (error) {
      console.error('Supabase Error (Academics):', error.message);
      return res.status(500).json({ error: 'Failed to fetch academics' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Academics):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.put('/api/content/academics', authenticate, async (req, res) => {
  // Replace all academics with the new list
  const { error: deleteError } = await supabase.from('academics').delete().neq('id', 0);
  if (deleteError) {
    console.error('Supabase Error (Academics Delete):', deleteError.message);
    return res.status(500).json({ error: 'Failed to update academics' });
  }
  
  const { error: insertError } = await supabase.from('academics').insert(req.body);
  if (insertError) {
    console.error('Supabase Error (Academics Insert):', insertError.message);
    return res.status(500).json({ error: 'Failed to update academics' });
  }
  
  res.json({ success: true });
});

app.get('/api/content/extra', async (req, res) => {
  try {
    const { data, error } = await supabase.from('extra_activities').select('*');
    if (error) {
      console.error('Supabase Error (Extra):', error.message);
      return res.status(500).json({ error: 'Failed to fetch background content' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Extra):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.put('/api/content/extra', authenticate, async (req, res) => {
  // Replace all activities with the new list
  const { error: deleteError } = await supabase.from('extra_activities').delete().neq('id', 0);
  if (deleteError) {
    console.error('Supabase Error (Extra Delete):', deleteError.message);
    return res.status(500).json({ error: 'Failed to update background content' });
  }
  
  const { error: insertError } = await supabase.from('extra_activities').insert(req.body);
  if (insertError) {
    console.error('Supabase Error (Extra Insert):', insertError.message);
    return res.status(500).json({ error: 'Failed to update background content' });
  }
  
  res.json({ success: true });
});

// Branding Endpoints
app.get('/api/branding', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding').select('id, updated_at, active_logo_id').eq('id', 1).single();
    if (error) {
      console.error('Supabase Error (Branding Get):', error.message);
      return res.status(500).json({ error: 'Failed to fetch branding info' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Branding Get):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.get('/api/branding/logo', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding').select('logo_blob, logo_mime_type').eq('id', 1).single();
    
    if (error || !data || !data.logo_blob) {
      return res.status(404).send('Logo not found');
    }

    let buffer;
    const blob = data.logo_blob;
    
    if (typeof blob === 'string' && blob.startsWith('\\x')) {
      // Supabase BYTEA hex format: \x followed by hex chars
      // The base64 string was stored as bytes, so we get hex of the base64 bytes
      const hexStr = blob.slice(2);
      const rawBytes = Buffer.from(hexStr, 'hex');
      // rawBytes is the original base64 string as bytes, decode it back
      const base64Str = rawBytes.toString('utf8');
      buffer = Buffer.from(base64Str, 'base64');
    } else if (typeof blob === 'string') {
      buffer = Buffer.from(blob, 'base64');
    } else {
      buffer = Buffer.from(blob);
    }

    res.set('Content-Type', data.logo_mime_type || 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    console.error('Logo serve error:', err);
    res.status(500).send('Error serving logo');
  }
});

app.put('/api/branding', authenticate, async (req, res) => {
  try {
    const { active_logo_id } = req.body;
    
    const updateData = { 
      updated_at: new Date().toISOString() 
    };

    // If setting an active logo, copy its blob into branding
    if (active_logo_id && active_logo_id !== -1) {
      const { data: logo, error: logoErr } = await supabase
        .from('branding_logos')
        .select('logo_blob, logo_mime_type')
        .eq('id', active_logo_id)
        .single();
      if (logoErr || !logo) return res.status(404).json({ error: 'Logo not found' });
      updateData.logo_blob = logo.logo_blob;
      updateData.logo_mime_type = logo.logo_mime_type;
      updateData.active_logo_id = active_logo_id;
    } else if (active_logo_id === -1) {
      updateData.logo_blob = null;
      updateData.active_logo_id = null;
    }

    const { data, error } = await supabase
      .from('branding')
      .update(updateData)
      .eq('id', 1)
      .select('id, updated_at')
      .single();

    if (error) {
      console.error('Supabase Error (Branding Update):', error.message);
      return res.status(500).json({ error: 'Failed to update branding' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Branding Update):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Logo Gallery Endpoints
app.get('/api/branding/logos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('branding_logos')
      .select('id, name, logo_mime_type, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase Error (Logos Get):', error.message);
      return res.status(500).json({ error: 'Failed to fetch logos' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Logos Get):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.get('/api/branding/logos/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('branding_logos')
      .select('logo_blob, logo_mime_type')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).send('Logo not found');
    
    let buffer;
    const blob = data.logo_blob;
    
    if (typeof blob === 'string' && blob.startsWith('\\x')) {
      const hexStr = blob.slice(2);
      const rawBytes = Buffer.from(hexStr, 'hex');
      const base64Str = rawBytes.toString('utf8');
      buffer = Buffer.from(base64Str, 'base64');
    } else if (typeof blob === 'string') {
      buffer = Buffer.from(blob, 'base64');
    } else {
      buffer = Buffer.from(blob);
    }
    
    res.set('Content-Type', data.logo_mime_type || 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error serving logo');
  }
});

app.post('/api/branding/logos', authenticate, async (req, res) => {
  try {
    const { logo_data, logo_mime_type, name } = req.body;
    if (!logo_data) return res.status(400).json({ error: 'No logo data' });

    const { data, error } = await supabase
      .from('branding_logos')
      .insert([{ logo_blob: logo_data, logo_mime_type, name: name || 'Untitled' }])
      .select('id, name, logo_mime_type, created_at')
      .single();
    if (error) {
      console.error('Supabase Error (Logo Upload):', error.message);
      return res.status(500).json({ error: 'Failed to upload logo' });
    }
    res.json(data);
  } catch (err) {
    console.error('Server Internal Error (Logo Upload):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.delete('/api/branding/logos/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('branding_logos')
      .delete()
      .eq('id', req.params.id);
    if (error) {
      console.error('Supabase Error (Logo Delete):', error.message);
      return res.status(500).json({ error: 'Failed to delete logo' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Server Internal Error (Logo Delete):', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
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

// Contact Endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  // In a real app, you'd send an email here.
  res.json({ success: true, message: 'Message received!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
