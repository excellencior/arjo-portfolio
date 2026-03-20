const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Get All Posts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Post
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Post not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Post
router.post('/', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update Post
router.put('/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete Post
router.delete('/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
