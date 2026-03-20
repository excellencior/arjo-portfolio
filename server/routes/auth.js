const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const supabase = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
let verificationCodes = {};

// Send Code
router.post('/send-code', async (req, res) => {
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
      pass: process.env.GMAIL_PASS,
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

// Verify Code
router.post('/verify-code', async (req, res) => {
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

// Purge sessions cron job
cron.schedule('* * * * *', async () => {
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

module.exports = router;
