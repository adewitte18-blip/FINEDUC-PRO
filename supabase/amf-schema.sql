-- ══════════════════════════════════════════════════════════════════
--  FinEduc Pro — Module AMF : schéma Supabase additionnel
--  Coller dans Supabase > SQL Editor après avoir exécuté schema.sql
-- ══════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
--  TABLE : amf_questions
--  Banque de questions (source de vérité côté Supabase)
--  Importée via le script scripts/seed-amf.ts
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.amf_questions (
  id               TEXT PRIMARY KEY,          -- ex: amf-gen-t03-q017
  exam             TEXT NOT NULL
                     CHECK (exam IN ('generaliste', 'durable')),
  theme_id         INTEGER NOT NULL,
  category         TEXT NOT NULL
                     CHECK (category IN ('A', 'C')),
  difficulty       INTEGER NOT NULL DEFAULT 2
                     CHECK (difficulty BETWEEN 1 AND 3),
  question         TEXT NOT NULL,
  options          JSONB NOT NULL,            -- tableau de 4 chaînes
  correct_index    INTEGER NOT NULL
                     CHECK (correct_index BETWEEN 0 AND 3),
  explication      TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'validated')),
  version          INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Questions en lecture publique (côté client, pas de secret)
ALTER TABLE public.amf_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AMF questions readable by authenticated users"
  ON public.amf_questions FOR SELECT
  TO authenticated
  USING (true);

-- Seuls les admins peuvent insérer/modifier (via service_role dans le seed)
-- Les utilisateurs non authentifiés n'accèdent pas
CREATE POLICY "AMF questions readable by anon for app"
  ON public.amf_questions FOR SELECT
  TO anon
  USING (status = 'validated');

CREATE INDEX IF NOT EXISTS idx_amf_questions_exam ON public.amf_questions (exam);
CREATE INDEX IF NOT EXISTS idx_amf_questions_theme ON public.amf_questions (exam, theme_id);
CREATE INDEX IF NOT EXISTS idx_amf_questions_status ON public.amf_questions (status);
CREATE INDEX IF NOT EXISTS idx_amf_questions_category ON public.amf_questions (exam, category, status);

CREATE TRIGGER set_amf_questions_updated_at
  BEFORE UPDATE ON public.amf_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────
--  TABLE : amf_exam_attempts
--  Une ligne par tentative d'examen blanc
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.amf_exam_attempts (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam             TEXT NOT NULL
                     CHECK (exam IN ('generaliste', 'durable')),
  status           TEXT NOT NULL DEFAULT 'in_progress'
                     CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at      TIMESTAMPTZ,
  duration_s       INTEGER,
  score_global     INTEGER CHECK (score_global BETWEEN 0 AND 100),
  score_a          INTEGER CHECK (score_a BETWEEN 0 AND 100),
  score_c          INTEGER CHECK (score_c BETWEEN 0 AND 100),
  passed           BOOLEAN,
  config_snapshot  JSONB NOT NULL DEFAULT '{}',
  question_ids     JSONB NOT NULL DEFAULT '[]',  -- ordre du tirage
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.amf_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AMF attempts"
  ON public.amf_exam_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_amf_attempts_user ON public.amf_exam_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_amf_attempts_exam ON public.amf_exam_attempts (user_id, exam);
CREATE INDEX IF NOT EXISTS idx_amf_attempts_status ON public.amf_exam_attempts (user_id, status);

CREATE TRIGGER set_amf_attempts_updated_at
  BEFORE UPDATE ON public.amf_exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────
--  TABLE : amf_attempt_answers
--  Une ligne par question répondue dans une tentative
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.amf_attempt_answers (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id       UUID REFERENCES public.amf_exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id      TEXT REFERENCES public.amf_questions(id) NOT NULL,
  position         INTEGER NOT NULL,           -- 0-based, ordre dans l'examen
  selected_index   INTEGER                     -- null = pas répondu
                     CHECK (selected_index BETWEEN 0 AND 3),
  is_correct       BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.amf_attempt_answers ENABLE ROW LEVEL SECURITY;

-- Lecture/écriture via l'attempt (vérif indirecte du user_id)
CREATE POLICY "Users manage own AMF answers"
  ON public.amf_attempt_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.amf_exam_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.amf_exam_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_amf_answers_attempt ON public.amf_attempt_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_amf_answers_question ON public.amf_attempt_answers (question_id);

-- ──────────────────────────────────────────────
--  TABLE : amf_user_question_stats
--  Statistiques par utilisateur et par question
--  Alimentée après chaque tentative terminée
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.amf_user_question_stats (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id      TEXT REFERENCES public.amf_questions(id) NOT NULL,
  times_seen       INTEGER NOT NULL DEFAULT 0,
  times_wrong      INTEGER NOT NULL DEFAULT 0,
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE public.amf_user_question_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AMF question stats"
  ON public.amf_user_question_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_amf_stats_user ON public.amf_user_question_stats (user_id);
CREATE INDEX IF NOT EXISTS idx_amf_stats_question ON public.amf_user_question_stats (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_amf_stats_wrong ON public.amf_user_question_stats (user_id, times_wrong DESC);

CREATE TRIGGER set_amf_stats_updated_at
  BEFORE UPDATE ON public.amf_user_question_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  NOTES :
--  1. Exécuter ce script APRÈS schema.sql (dépend de set_updated_at())
--  2. Le seed des questions se fait via scripts/seed-amf.ts
--     (utilise la clé service_role pour bypasser RLS en écriture)
--  3. Les questions sont en lecture seule côté client (via RLS)
-- ══════════════════════════════════════════════════════════════════
