-- ── Device tokens for push notifications ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS device_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text NOT NULL,
  platform    text NOT NULL DEFAULT 'ios',
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Own token: full access
CREATE POLICY "Users manage own device tokens"
  ON device_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Partner can read the token so the edge function can send notifications
-- (Edge function runs with service_role key, but this allows future direct queries)
CREATE POLICY "Partners can read device tokens"
  ON device_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.partner_user_id = device_tokens.user_id
    )
  );
