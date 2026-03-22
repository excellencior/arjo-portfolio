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

const nodemailer = require('nodemailer');

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

// Helper for email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Contact Endpoint (with Nodemailer)
app.post('/api/contact', async (req, res) => {
  let { name, email, message } = req.body;
  
  // Basic Sanitization
  name = name?.trim();
  email = email?.trim()?.toLowerCase();
  message = message?.trim();

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  console.log(`Sending email to ${process.env.ADMIN_EMAIL} from ${email} using ${process.env.GMAIL_USER}...`);
  
  // Create a transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #0f172a;">
        <h2 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">New Message!</h2>
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">From</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${name}</p>
          <a href="mailto:${email}" style="color: #0369a1; text-decoration: none; font-size: 15px;">${email}</a>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #cbd5e1;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase;">Message</p>
          <p style="margin: 0; color: #334155; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center;">
          <p>This message was sent from your portfolio's contact form.</p>
        </div>
      </div>
    `,
    replyTo: email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully from ${name} (${email})`);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// Only listen if not on Vercel or if running directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
