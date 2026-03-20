const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

module.exports = { authenticate, JWT_SECRET };
