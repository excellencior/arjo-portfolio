-- migration/alter_academics_schema.sql
-- Run this in the Supabase SQL Editor to update the academics table structure.

-- 1. Add new columns
ALTER TABLE public.academics ADD COLUMN start_year INTEGER;
ALTER TABLE public.academics ADD COLUMN end_year INTEGER;

-- 2. Drop the old columns
-- WARNING: This will delete existing data.
ALTER TABLE public.academics DROP COLUMN duration;
ALTER TABLE public.academics DROP COLUMN category;
