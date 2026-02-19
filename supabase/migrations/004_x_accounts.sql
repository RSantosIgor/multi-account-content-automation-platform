-- ============================================================
-- DB-003 (part 1): X Accounts
-- ============================================================
-- Stores registered X (Twitter) accounts per user.
-- OAuth tokens are stored encrypted (AES-256-GCM, as hex TEXT).
-- Tokens are NEVER returned by any API response.
-- ============================================================

CREATE TABLE public.x_accounts (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  x_user_id               TEXT        NOT NULL,
  x_username              TEXT        NOT NULL,
  x_display_name          TEXT,
  x_profile_image_url     TEXT,
  oauth_access_token_enc  TEXT        NOT NULL,  -- AES-256-GCM encrypted, stored as hex
  oauth_refresh_token_enc TEXT        NOT NULL,  -- AES-256-GCM encrypted, stored as hex
  token_expires_at        TIMESTAMPTZ,
  is_active               BOOLEAN     NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, x_user_id)
);

-- Indexes
CREATE INDEX idx_x_accounts_user_id ON public.x_accounts(user_id);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.x_accounts
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.x_accounts ENABLE ROW LEVEL SECURITY;
