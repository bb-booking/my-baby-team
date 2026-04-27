-- Migration: Diary cross-device sync + partner RLS + features
-- Run in Supabase Dashboard → SQL Editor

-- ── 1. Add missing columns to nursing_logs ──────────────────────────────────
ALTER TABLE nursing_logs
  ADD COLUMN IF NOT EXISTS ml integer,
  ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}';

-- ── 2. Add reactions to diaper_logs ─────────────────────────────────────────
ALTER TABLE diaper_logs
  ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}';

-- ── 3. Add reactions to sleep_logs ──────────────────────────────────────────
ALTER TABLE sleep_logs
  ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}';

-- ── 4. Enable Row Level Security on diary tables (if not already) ────────────
ALTER TABLE nursing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_shifts ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS: own full access + partner read access for diary tables ───────────

-- nursing_logs
DROP POLICY IF EXISTS "Users can manage own nursing logs" ON nursing_logs;
CREATE POLICY "Users can manage own nursing logs"
  ON nursing_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can read nursing logs" ON nursing_logs;
CREATE POLICY "Partners can read nursing logs"
  ON nursing_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles
      WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );

-- diaper_logs
DROP POLICY IF EXISTS "Users can manage own diaper logs" ON diaper_logs;
CREATE POLICY "Users can manage own diaper logs"
  ON diaper_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can read diaper logs" ON diaper_logs;
CREATE POLICY "Partners can read diaper logs"
  ON diaper_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles
      WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );

-- sleep_logs
DROP POLICY IF EXISTS "Users can manage own sleep logs" ON sleep_logs;
CREATE POLICY "Users can manage own sleep logs"
  ON sleep_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can read sleep logs" ON sleep_logs;
CREATE POLICY "Partners can read sleep logs"
  ON sleep_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles
      WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );

-- night_shifts
DROP POLICY IF EXISTS "Users can manage own night shifts" ON night_shifts;
CREATE POLICY "Users can manage own night shifts"
  ON night_shifts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can read night shifts" ON night_shifts;
CREATE POLICY "Partners can read night shifts"
  ON night_shifts FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles
      WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );

-- ── 6. Enable Realtime on diary tables ──────────────────────────────────────
-- Run these only if the tables aren't already in the publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'nursing_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE nursing_logs;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'diaper_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE diaper_logs;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'sleep_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sleep_logs;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'night_shifts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE night_shifts;
  END IF;
END $$;

-- ── 7. Daily questions table (Dagens spørgsmål) ─────────────────────────────
CREATE TABLE IF NOT EXISTS daily_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     text NOT NULL,
  date          date NOT NULL,
  question_index integer NOT NULL,
  mor_answer    text,
  far_answer    text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (family_id, date)
);

ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family can manage daily questions" ON daily_questions;
CREATE POLICY "Family can manage daily questions"
  ON daily_questions FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE user_id = auth.uid() AND family_id IS NOT NULL
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE user_id = auth.uid() AND family_id IS NOT NULL
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_questions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE daily_questions;
  END IF;
END $$;

-- ── 8. Weekly ritual table (Ugens ritual) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_rituals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   text NOT NULL,
  week_start  date NOT NULL, -- Monday of the ISO week
  mor_good    text,
  mor_hard    text,
  mor_next    text,
  far_good    text,
  far_hard    text,
  far_next    text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (family_id, week_start)
);

ALTER TABLE weekly_rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family can manage weekly rituals" ON weekly_rituals;
CREATE POLICY "Family can manage weekly rituals"
  ON weekly_rituals FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE user_id = auth.uid() AND family_id IS NOT NULL
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE user_id = auth.uid() AND family_id IS NOT NULL
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'weekly_rituals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE weekly_rituals;
  END IF;
END $$;
