const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// --- Branding Info ---
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding').select('id, updated_at, active_logo_id').eq('id', 1).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const { active_logo_id } = req.body;
    const updateData = { updated_at: new Date().toISOString() };

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
      .select('id, updated_at, active_logo_id')
      .single();

    if (error) {
      // If active_logo_id column is missing, try updating without selecting it
      if (error.message.includes('column "active_logo_id" does not exist')) {
        delete updateData.active_logo_id;
        const { data: retryData, error: retryErr } = await supabase
          .from('branding')
          .update(updateData)
          .eq('id', 1)
          .select('id, updated_at')
          .single();
        if (retryErr) return res.status(500).json({ error: retryErr.message });
        return res.json(retryData);
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Active Logo Serve ---
router.get('/logo', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding').select('logo_blob, logo_mime_type').eq('id', 1).single();
    if (error || !data || !data.logo_blob) return res.status(404).send('Logo not found');

    let buffer;
    const blob = data.logo_blob;
    if (typeof blob === 'string' && blob.startsWith('\\x')) {
      buffer = Buffer.from(Buffer.from(blob.slice(2), 'hex').toString('utf8'), 'base64');
    } else if (typeof blob === 'string') {
      buffer = Buffer.from(blob, 'base64');
    } else {
      buffer = Buffer.from(blob);
    }

    res.set('Content-Type', data.logo_mime_type || 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error serving logo');
  }
});

// --- Logo Gallery ---
router.get('/logos', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding_logos').select('id, name, logo_mime_type, created_at').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logos/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('branding_logos').select('logo_blob, logo_mime_type').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).send('Logo not found');
    
    let buffer;
    const blob = data.logo_blob;
    if (typeof blob === 'string' && blob.startsWith('\\x')) {
      buffer = Buffer.from(Buffer.from(blob.slice(2), 'hex').toString('utf8'), 'base64');
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

router.post('/logos', authenticate, async (req, res) => {
  try {
    const { logo_data, logo_mime_type, name } = req.body;
    if (!logo_data) return res.status(400).json({ error: 'No logo data' });

    const { data, error } = await supabase
      .from('branding_logos')
      .insert([{ logo_blob: logo_data, logo_mime_type, name: name || 'Untitled' }])
      .select('id, name, logo_mime_type, created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/logos/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase.from('branding_logos').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
