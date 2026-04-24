-- ============================================
-- Add visibility toggle + bulk delete support
-- Run this in Supabase SQL Editor
-- ============================================

-- Add visible column (defaults to true so existing photos stay visible)
ALTER TABLE public.photography 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
