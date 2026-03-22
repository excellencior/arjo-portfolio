const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Utility for cleaning Supabase metadata
const cleanData = (data) => {
  if (Array.isArray(data)) {
    return data.map(({ id, created_at, updated_at, ...rest }) => rest);
  }
  if (data && typeof data === 'object') {
    const { id, created_at, updated_at, ...rest } = data;
    return rest;
  }
  return data;
};

// --- Home Content ---
router.get('/home', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('home_content')
      .select('id, title, subtitle, links, quote, updated_at')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
    if (!data) {
      return res.json({ title: 'Welcome', subtitle: 'Bio coming soon...', links: [] });
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/home', authenticate, async (req, res) => {
  const { error } = await supabase
    .from('home_content')
    .upsert({ 
      id: 1, 
      ...cleanData(req.body),
      updated_at: new Date().toISOString() 
    });
  if (error) return res.status(500).json({ error: 'Failed to update bio content. Please verify database permissions.' });
  res.json({ success: true });
});

// Profile Image Upload
router.post('/home/image', authenticate, async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Server-side size check (7MB base64 limit for ~5MB binary)
    if (image.length > 7 * 1024 * 1024) { 
      return res.status(400).json({ error: 'Image size exceeds 5MB limit.' });
    }

    const { error } = await supabase
      .from('home_content')
      .upsert({ 
        id: 1,
        profile_image_blob: image, // Store base64 directly as branding does
        profile_image_mime_type: mimeType,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to save image. Please verify your database schema and permissions.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Upload catch:', err);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
});

// Serve Profile Image
router.get('/home/image', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('home_content')
      .select('profile_image_blob, profile_image_mime_type')
      .eq('id', 1)
      .single();

    if (error || !data || !data.profile_image_blob) {
      return res.status(404).send('Image not found');
    }

    let buffer;
    const blob = data.profile_image_blob;
    
    // Robust decoding matching branding.js logic
    if (typeof blob === 'string' && blob.startsWith('\\x')) {
      // Postgres hex format to base64 conversion if needed
      buffer = Buffer.from(Buffer.from(blob.slice(2), 'hex').toString('utf8'), 'base64');
    } else if (typeof blob === 'string') {
      buffer = Buffer.from(blob, 'base64');
    } else {
      buffer = Buffer.from(blob);
    }

    res.set('Content-Type', data.profile_image_mime_type || 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error serving image');
  }
});

// --- Academics ---
router.get('/academics', async (req, res) => {
  try {
    const { data, error } = await supabase.from('academics').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/academics', authenticate, async (req, res) => {
  // Bulk replace strategy
  const { error: deleteError } = await supabase.from('academics').delete().neq('id', 0);
  if (deleteError) return res.status(500).json({ error: deleteError.message });
  
  const itemsToInsert = cleanData(req.body);
  if (!itemsToInsert || itemsToInsert.length === 0) return res.json({ success: true });

  const { error: insertError } = await supabase.from('academics').insert(itemsToInsert);
  if (insertError) return res.status(500).json({ error: insertError.message });
  
  res.json({ success: true });
});

// --- Extra Activities ---
router.get('/extra', async (req, res) => {
  try {
    const { data, error } = await supabase.from('extra_activities').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/extra', authenticate, async (req, res) => {
  // Bulk replace strategy
  const { error: deleteError } = await supabase.from('extra_activities').delete().neq('id', 0);
  if (deleteError) return res.status(500).json({ error: deleteError.message });
  
  const itemsToInsert = cleanData(req.body);
  if (!itemsToInsert || itemsToInsert.length === 0) return res.json({ success: true });

  const { error: insertError } = await supabase.from('extra_activities').insert(itemsToInsert);
  if (insertError) return res.status(500).json({ error: insertError.message });
  
  res.json({ success: true });
});

module.exports = router;
