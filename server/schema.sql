-- ============================================================
-- Arjo Portfolio — Full Supabase Schema
-- Run this in the Supabase SQL Editor to set up everything.
-- Last updated: 2026-03-19
-- ============================================================

-- ========================
-- 1. ADMIN SESSIONS
-- Tracks active admin login sessions for 10-min inactivity logout.
-- The backend (server) reads, inserts, updates, and deletes rows.
-- ========================
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id BIGSERIAL PRIMARY KEY,
    token_hash TEXT NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- The backend uses the service/anon key; allow full access.
CREATE POLICY "Allow all for admin_sessions"
    ON public.admin_sessions FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- 2. HOME CONTENT
-- Single row (id=1) holding the home page title, subtitle, and CTA links.
-- Public: read. Admin: update.
-- ========================
CREATE TABLE IF NOT EXISTS public.home_content (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT 'Welcome',
    subtitle TEXT DEFAULT 'Bio coming soon...',
    links JSONB DEFAULT '[]'::JSONB
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read home_content"
    ON public.home_content FOR SELECT USING (true);
CREATE POLICY "Admin update home_content"
    ON public.home_content FOR UPDATE USING (true) WITH CHECK (true);

-- Seed default row
INSERT INTO public.home_content (id, title, subtitle, links)
VALUES (1, 'Arjo Portfolio', 'A minimalistic sanctuary showcasing photography, academics, and personal stories.', '[{"to":"/photography","text":"Explore Photography"},{"to":"/contact","text":"Start a Conversation"}]')
ON CONFLICT (id) DO NOTHING;

-- ========================
-- 3. BLOG POSTS
-- Each row is a blog post. Public: read. Admin: insert, update, delete.
-- ========================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    date TIMESTAMPTZ DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}'
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog_posts"
    ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin insert blog_posts"
    ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update blog_posts"
    ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete blog_posts"
    ON public.blog_posts FOR DELETE USING (true);

-- ========================
-- 4. ACADEMICS
-- Education entries. Public: read. Admin: insert, delete (bulk replace strategy).
-- ========================
CREATE TABLE IF NOT EXISTS public.academics (
    id BIGSERIAL PRIMARY KEY,
    institution TEXT DEFAULT '',
    degree TEXT DEFAULT '',
    year TEXT DEFAULT '',
    description TEXT DEFAULT ''
);

ALTER TABLE public.academics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read academics"
    ON public.academics FOR SELECT USING (true);
CREATE POLICY "Admin insert academics"
    ON public.academics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete academics"
    ON public.academics FOR DELETE USING (true);

-- ========================
-- 5. EXTRA ACTIVITIES
-- Extracurricular entries. Public: read. Admin: insert, delete (bulk replace strategy).
-- ========================
CREATE TABLE IF NOT EXISTS public.extra_activities (
    id BIGSERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    category TEXT DEFAULT ''
);

ALTER TABLE public.extra_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read extra_activities"
    ON public.extra_activities FOR SELECT USING (true);
CREATE POLICY "Admin insert extra_activities"
    ON public.extra_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete extra_activities"
    ON public.extra_activities FOR DELETE USING (true);

-- ========================
-- 6. BRANDING
-- Single row (id=1) holding the site logo (as binary blob).
-- logo_blob  : the image file stored as BYTEA (base64 in transit).
-- logo_mime_type : e.g. 'image/png', 'image/svg+xml'.
-- Public: read. Admin: update.
-- ========================
CREATE TABLE IF NOT EXISTS public.branding (
    id SERIAL PRIMARY KEY,
    logo_blob BYTEA,
    logo_mime_type TEXT DEFAULT 'image/png',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read branding"
    ON public.branding FOR SELECT USING (true);
CREATE POLICY "Admin update branding"
    ON public.branding FOR UPDATE USING (true) WITH CHECK (true);

-- Seed default row (logo_blob will be NULL until admin uploads one)
INSERT INTO public.branding (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ========================
-- 7. BRANDING LOGOS (Gallery)
-- Stores all uploaded logos. One is marked as active via branding.active_logo_id.
-- Public: read (to serve logo). Admin: insert, delete.
-- ========================
CREATE TABLE IF NOT EXISTS public.branding_logos (
    id BIGSERIAL PRIMARY KEY,
    logo_blob BYTEA NOT NULL,
    logo_mime_type TEXT DEFAULT 'image/png',
    name TEXT DEFAULT 'Untitled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.branding_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read branding_logos"
    ON public.branding_logos FOR SELECT USING (true);
CREATE POLICY "Admin insert branding_logos"
    ON public.branding_logos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete branding_logos"
    ON public.branding_logos FOR DELETE USING (true);
