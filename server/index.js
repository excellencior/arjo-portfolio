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

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content/blog', blogRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/photography', photographyRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Portfolio API is running (Modular)...');
});

// Contact Endpoint (Simple)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received message from ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Message received!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
