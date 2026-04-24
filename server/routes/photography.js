const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Public: Get all photos (Supabase metadata + Cloudinary URLs)
router.get('/images', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('photography')
      .select('*')
      .eq('visible', true)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const photos = (data || []).map(p => ({
      id: p.id,
      src: p.cloudinary_url,
      width: p.width,
      height: p.height,
      title: p.title,
      intent: p.intent,
      category: p.category,
    }));

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Admin: Get all photos with full metadata
router.get('/admin/list', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('photography')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Admin: Toggle photo visibility
router.put('/visibility/:id', authenticate, async (req, res) => {
  try {
    const { visible } = req.body;
    const { data, error } = await supabase
      .from('photography')
      .update({ visible, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

// Admin: Bulk delete photos
router.post('/bulk-delete', authenticate, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No IDs provided' });
  }

  try {
    // Get cloudinary IDs first
    const { data: photos, error: fetchError } = await supabase
      .from('photography')
      .select('cloudinary_public_id')
      .in('id', ids);

    if (fetchError) return res.status(500).json({ error: fetchError.message });

    // Delete from Cloudinary
    const cloudinary = require('../config/cloudinary').cloudinary;
    for (const photo of (photos || [])) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinary_public_id);
      } catch (e) {
        console.warn('Cloudinary delete warning:', e.message);
      }
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('photography')
      .delete()
      .in('id', ids);

    if (deleteError) return res.status(500).json({ error: deleteError.message });
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// Admin: Upload image to Cloudinary (Base64) + save metadata to Supabase
router.post('/upload', authenticate, async (req, res) => {
  console.log('Received base64 upload request');
  
  try {
    const { image, title, intent, category, sort_order } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    console.log('Uploading to Cloudinary...');
    
    // Upload base64 to Cloudinary
    // image should be in format "data:image/jpeg;base64,..."
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: 'portfolio-gallery',
      resource_type: 'auto'
    });

    console.log('Cloudinary upload success:', uploadRes.public_id);

    const { data, error } = await supabase
      .from('photography')
      .insert({
        title: title || '',
        intent: intent || '',
        category: category || '',
        cloudinary_url: uploadRes.secure_url,
        cloudinary_public_id: uploadRes.public_id,
        width: uploadRes.width || 0,
        height: uploadRes.height || 0,
        sort_order: parseInt(sort_order) || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase photography insert error:', error);
      // Optional: clean up Cloudinary if DB save fails
      await cloudinary.uploader.destroy(uploadRes.public_id);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    console.log('Successfully saved to database');
    res.json(data);
  } catch (err) {
    console.error('Upload processing exception:', err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Admin: Update photo metadata
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, intent, category } = req.body;

    const { data, error } = await supabase
      .from('photography')
      .update({
        title,
        intent,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Admin: Reorder photos
router.put('/reorder/bulk', authenticate, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, sort_order }]

    for (const item of items) {
      const { error } = await supabase
        .from('photography')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      
      if (error) {
        console.error('Reorder error:', error);
        return res.status(500).json({ error: 'Failed to reorder' });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder photos' });
  }
});

// Admin: Delete photo from Cloudinary + Supabase
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the cloudinary_public_id first
    const { data: photo, error: fetchError } = await supabase
      .from('photography')
      .select('cloudinary_public_id')
      .eq('id', id)
      .single();

    if (fetchError || !photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(photo.cloudinary_public_id);
    } catch (cloudErr) {
      console.warn('Cloudinary delete warning:', cloudErr.message);
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('photography')
      .delete()
      .eq('id', id);

    if (deleteError) return res.status(500).json({ error: deleteError.message });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;
