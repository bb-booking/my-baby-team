-- Migration: Family linking + inclusivity fields
-- Run this in Supabase Dashboard → SQL Editor
-- Required for partner sync and invite code system

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_partner boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS family_id text,
  ADD COLUMN IF NOT EXISTS invite_code text,
  ADD COLUMN IF NOT EXISTS partner_user_id uuid;

-- Unique index on invite_code so lookups are fast and codes don't collide
CREATE UNIQUE INDEX IF NOT EXISTS profiles_invite_code_idx ON profiles (invite_code)
  WHERE invite_code IS NOT NULL;

-- Allow a user to read a partner's profile if they share the same family_id
-- (used for partner data display: mood, needs, tasks)
CREATE POLICY IF NOT EXISTS "Partners can read each other's profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      family_id IS NOT NULL
      AND family_id IN (
        SELECT family_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Allow looking up a profile by invite_code (for join flow)
CREATE POLICY IF NOT EXISTS "Anyone can look up profile by invite_code"
  ON profiles FOR SELECT
  USING (invite_code IS NOT NULL);

-- Tasks: allow reading partner's tasks when in same family
-- (requires tasks table to have family_id OR we query by partner_user_id)
-- For now, partners can read each other's tasks via partner_user_id lookup
CREATE POLICY IF NOT EXISTS "Partners can read each other tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );

-- Check-ins: same pattern
CREATE POLICY IF NOT EXISTS "Partners can read each other check_ins"
  ON check_ins FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT partner_user_id FROM profiles WHERE user_id = auth.uid() AND partner_user_id IS NOT NULL
    )
  );
