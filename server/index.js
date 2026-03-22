const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const blogRoutes = require('./routes/blog');
const brandingRoutes = require('./routes/branding');
const photographyRoutes = require('./routes/photography');
const draftsRoutes = require('./routes/drafts');

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content/blog', blogRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/photography', photographyRoutes);
app.use('/api/drafts', draftsRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Base Route
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

// Contact Endpoint (Simple)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Message received!' });
});

// Only listen if not on Vercel or if running directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
