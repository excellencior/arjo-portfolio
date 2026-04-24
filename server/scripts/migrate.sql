-- ============================================
-- Arjo Portfolio — Full Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Photography Table
CREATE TABLE IF NOT EXISTS public.photography (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT '',
  intent TEXT DEFAULT '',
  category TEXT DEFAULT '',
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photography ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photography' AND policyname = 'Allow anonymous read access') THEN
    CREATE POLICY "Allow anonymous read access" ON public.photography FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photography' AND policyname = 'Allow authenticated full access') THEN
    CREATE POLICY "Allow authenticated full access" ON public.photography FOR ALL USING (true);
  END IF;
END $$;

-- Done
SELECT 'Migration complete — photography table ready.' AS status;
