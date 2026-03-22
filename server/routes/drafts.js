const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Get all draft keys (Metadata)
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('drafts').select('key, updated_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single draft
router.get('/:key', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('key', req.params.key)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      return res.status(500).json({ error: error.message });
    }
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert draft
router.put('/', authenticate, async (req, res) => {
  const { key, content } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required' });

  try {
    const { data, error } = await supabase
      .from('drafts')
      .upsert({ key, content, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single draft
router.delete('/:key', authenticate, async (req, res) => {
  try {
    const { error } = await supabase.from('drafts').delete().eq('key', req.params.key);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete drafts by prefix
router.delete('/prefix/:prefix', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .like('key', `${req.params.prefix}%`);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
