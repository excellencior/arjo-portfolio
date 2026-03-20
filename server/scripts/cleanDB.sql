-- ============================================================
-- Arjo Portfolio — Clean DB Script
-- WARNING: This will PERMANENTLY DELETE all data and tables.
-- Run this before re-running schema.sql for a fresh start.
-- ============================================================

DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.home_content CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.academics CASCADE;
DROP TABLE IF EXISTS public.extra_activities CASCADE;
DROP TABLE IF EXISTS public.branding CASCADE;
DROP TABLE IF EXISTS public.branding_logos CASCADE;

-- Optional: Re-create the public schema if it was somehow modified (usually not needed)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO anon;
-- GRANT ALL ON SCHEMA public TO authenticated;
-- GRANT ALL ON SCHEMA public TO service_role;
