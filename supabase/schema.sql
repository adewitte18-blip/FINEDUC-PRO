-- ══════════════════════════════════════════════════════════════════
--  FinEduc Pro — Schéma Supabase
--  Tier gratuit compatible (Row Level Security activé)
-- ══════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
--  TABLE : profiles
--  Étend auth.users avec les infos métier
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email             TEXT,
  full_name         TEXT,
  avatar_url        TEXT,
  job_title         TEXT,
  region            TEXT,
  active_parcours   TEXT,
  positioning_done  BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Trigger : créer le profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leur propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilisateurs modifient leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Les profils sont publiquement lisibles pour le système de binômes (seulement nom/job/region)
CREATE POLICY "Profils publics pour binômes"
  ON public.profiles FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────
--  TABLE : user_progress
--  Progression par module et par utilisateur
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id        TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'not_started'
                     CHECK (status IN ('not_started', 'in_progress', 'completed')),
  quiz_score       INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  quiz_attempts    INTEGER DEFAULT 0,
  cours_completed  BOOLEAN DEFAULT FALSE,
  cas_completed    BOOLEAN DEFAULT FALSE,
  last_visited     TIMESTAMPTZ DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON public.user_progress (module_id);

-- ──────────────────────────────────────────────
--  TABLE : flashcard_reviews
--  Algorithme SRS (SM-2) par flashcard
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flashcard_id     TEXT NOT NULL,
  module_id        TEXT NOT NULL,
  next_review      TIMESTAMPTZ DEFAULT now(),
  ease_factor      FLOAT DEFAULT 2.5,
  interval_days    INTEGER DEFAULT 1,
  correct_streak   INTEGER DEFAULT 0,
  total_reviews    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, flashcard_id)
);

ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flashcard reviews"
  ON public.flashcard_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id ON public.flashcard_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_next_review ON public.flashcard_reviews (next_review);

-- ──────────────────────────────────────────────
--  TABLE : positionnement_results
--  Résultats du test de positionnement
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.positionnement_results (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  taken_at              TIMESTAMPTZ DEFAULT now(),
  scores                JSONB NOT NULL DEFAULT '{}',
  recommended_parcours  TEXT,
  total_score           INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.positionnement_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own positionnement"
  ON public.positionnement_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
--  TABLE : binomes
--  Système de binômes (paires d'apprenants)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.binomes (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'active', 'inactive')),
  shared_parcours  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  CHECK (user1_id <> user2_id)
);

ALTER TABLE public.binomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their binomes"
  ON public.binomes FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users create binome requests"
  ON public.binomes FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users update their binomes"
  ON public.binomes FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX IF NOT EXISTS idx_binomes_user1 ON public.binomes (user1_id);
CREATE INDEX IF NOT EXISTS idx_binomes_user2 ON public.binomes (user2_id);

-- ──────────────────────────────────────────────
--  FONCTION : updated_at trigger
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur les tables concernées
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_flashcard_reviews_updated_at
  BEFORE UPDATE ON public.flashcard_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  NOTES :
--  1. Coller ce script dans : Supabase > SQL Editor > New query
--  2. Cliquer "Run" pour créer toutes les tables
--  3. Authentication > Settings : activer email auth
--  4. Optionnel : désactiver email confirmation en dev
--     (Auth > Settings > Email Confirmations > OFF)
-- ══════════════════════════════════════════════════════════════════
