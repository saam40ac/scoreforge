-- ═══════════════════════════════════════════════════════════
--  SCOREFORGE — Schema Database PostgreSQL
--  Incolla questo intero file nell'editor SQL di Supabase
--  Supabase Dashboard → SQL Editor → New Query → Incolla → Run
-- ═══════════════════════════════════════════════════════════

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
-- Estende gli utenti di Supabase Auth con dati profilo artista
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL DEFAULT '',
  professional_title  TEXT,
  city                TEXT,
  public_email        TEXT,
  website             TEXT,
  short_bio           TEXT,
  long_bio            TEXT,
  avatar_url          TEXT,
  skills              TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── PORTFOLIOS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolios (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','private')),
  theme               TEXT DEFAULT 'dark'  CHECK (theme  IN ('dark','ivory','neon')),
  accent_color        TEXT DEFAULT '#c8a45a',
  target              TEXT,
  description         TEXT,
  bio                 TEXT,
  video_url           TEXT,
  downloads_disabled  BOOLEAN DEFAULT TRUE,
  noindex             BOOLEAN DEFAULT FALSE,
  view_count          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(owner_id, slug)
);

-- ─── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id  UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  project_type  TEXT,
  emoji         TEXT DEFAULT '🎬',
  description   TEXT,
  cover_url     TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── TRACKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tracks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id    UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  genre           TEXT,
  duration_label  TEXT,
  file_url        TEXT,
  waveform_data   JSONB,
  sort_order      INTEGER DEFAULT 0,
  play_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── MEDIA FILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     INTEGER,
  mime_type     TEXT,
  media_type    TEXT CHECK (media_type IN ('audio','image','document')),
  storage_path  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files  ENABLE ROW LEVEL SECURITY;

-- PROFILES: solo il proprietario può leggere/modificare il proprio profilo
CREATE POLICY "profiles_owner" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- PORTFOLIOS: proprietario vede tutto, pubblico vede solo published
CREATE POLICY "portfolios_owner" ON public.portfolios
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "portfolios_public_read" ON public.portfolios
  FOR SELECT USING (status = 'published');

-- PROJECTS: accesso tramite portfolio (owner o pubblico se portfolio published)
CREATE POLICY "projects_owner" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.status = 'published')
  );

-- TRACKS: stessa logica dei projects
CREATE POLICY "tracks_owner" ON public.tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "tracks_public_read" ON public.tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.status = 'published')
  );

-- MEDIA FILES: solo il proprietario
CREATE POLICY "media_owner" ON public.media_files
  FOR ALL USING (auth.uid() = owner_id);

-- ─── TRIGGER: updated_at automatico ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── TRIGGER: crea profilo automaticamente dopo registrazione ─
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, public_email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── STORAGE BUCKET per i file audio/immagini ─────────────────
-- (eseguito separatamente se non già creato dalla dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('scoreforge-media', 'scoreforge-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'scoreforge-media');

CREATE POLICY "media_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scoreforge-media' AND auth.role() = 'authenticated');

CREATE POLICY "media_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'scoreforge-media' AND auth.uid()::text = (storage.foldername(name))[1]);
