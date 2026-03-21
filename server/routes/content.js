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
    const { data, error } = await supabase.from('home_content').select('*').limit(1);
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.json({ title: 'Welcome', subtitle: 'Bio coming soon...', links: [] });
    }
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/home', authenticate, async (req, res) => {
  const { error } = await supabase.from('home_content').update(cleanData(req.body)).eq('id', 1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Profile Image Upload
router.post('/home/image', authenticate, async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const buffer = Buffer.from(image, 'base64');
    const { error } = await supabase
      .from('home_content')
      .update({ 
        profile_image_blob: buffer,
        profile_image_mime_type: mimeType,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      return res.status(404).json({ error: 'Image not found' });
    }

    const buffer = Buffer.from(data.profile_image_blob, 'base64');
    res.setHeader('Content-Type', data.profile_image_mime_type || 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
