-- ═══════════════════════════════════════════════════════════
--  SCOREFORGE — Migrazione v6: Super Admin
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════

-- 1. Colonne ruolo e stato sull'utente
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role        TEXT    DEFAULT 'user'  CHECK (role IN ('user','admin','super_admin')),
  ADD COLUMN IF NOT EXISTS status      TEXT    DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  ADD COLUMN IF NOT EXISTS plan        TEXT    DEFAULT 'free'   CHECK (plan IN ('free','pro','studio','enterprise')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes       TEXT;   -- note interne dell'admin

-- 2. Tabella audit log (immutabile — nessun UPDATE/DELETE permesso)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,   -- es. 'user.suspend', 'portfolio.hide', 'plan.assign'
  target_type TEXT NOT NULL,   -- 'user' | 'portfolio' | 'track' | 'plan'
  target_id   UUID,
  details     JSONB,           -- payload completo dell'azione
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Tabella piani abbonamento
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,  -- 'free', 'pro', 'studio', 'enterprise'
  label       TEXT NOT NULL,         -- 'Free', 'Pro', 'Studio', 'Enterprise'
  price_eur   NUMERIC(8,2) DEFAULT 0,
  price_eur_annual NUMERIC(8,2) DEFAULT 0,
  max_portfolios   INTEGER DEFAULT 1,
  max_tracks       INTEGER DEFAULT 10,
  max_storage_mb   INTEGER DEFAULT 500,
  features    JSONB DEFAULT '[]',    -- array di feature label
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inserisci piani di default
INSERT INTO public.subscription_plans (name, label, price_eur, price_eur_annual, max_portfolios, max_tracks, max_storage_mb, features, sort_order)
VALUES
  ('free',       'Free',       0,     0,     1,   10,  500,  '["1 portfolio","10 tracce","500 MB storage","Analytics base"]', 0),
  ('pro',        'Pro',        12,    99,    5,   100, 5000, '["5 portfolio","100 tracce","5 GB storage","Analytics avanzate","Link tracciabili","Rimozione branding"]', 1),
  ('studio',     'Studio',     29,    249,   20,  500, 20000,'["20 portfolio","500 tracce","20 GB storage","Multi-artista","White label","Priorità supporto"]', 2),
  ('enterprise', 'Enterprise', 0,     0,     999, 9999,99999,'["Portfolio illimitati","Storage illimitato","API access","SLA dedicato","Account manager"]', 3)
ON CONFLICT (name) DO NOTHING;

-- 5. RLS — solo super_admin può leggere e scrivere
ALTER TABLE public.admin_audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_audit_log" ON public.admin_audit_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "superadmin_plans_manage" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

CREATE POLICY "plans_public_read" ON public.subscription_plans
  FOR SELECT USING (active = TRUE);

-- 6. Imposta il tuo account come super_admin (sostituisci con la tua email)
-- UPDATE public.profiles SET role = 'super_admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'tua@email.com'
-- );
-- DECOMMENTA E ESEGUI SEPARATAMENTE dopo aver trovato il tuo UUID in auth.users

SELECT 'Migrazione v6 Super Admin completata!' AS status;
