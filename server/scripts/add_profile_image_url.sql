-- Migration: Add profile_image_url to home_content table and drop blob columns
-- Run this in the Supabase SQL Editor

ALTER TABLE public.home_content ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.home_content DROP COLUMN IF EXISTS profile_image_blob;
ALTER TABLE public.home_content DROP COLUMN IF EXISTS profile_image_mime_type;
