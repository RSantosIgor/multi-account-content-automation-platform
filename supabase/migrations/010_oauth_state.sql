-- ============================================================
-- DB-003 (part 2): OAuth State
-- ============================================================
-- Temporary storage for PKCE code_verifier during the X OAuth flow.
-- Row is inserted in GET /oauth/start and deleted after GET /oauth/callback.
-- expires_at = now() + 10 minutes — backend rejects stale rows.
-- This table is accessed exclusively via the service_role key.
-- ============================================================

CREATE TABLE public.oauth_state (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_verifier TEXT        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL
);

-- Index for cleanup queries and expiry checks
CREATE INDEX idx_oauth_state_user_id    ON public.oauth_state(user_id);
CREATE INDEX idx_oauth_state_expires_at ON public.oauth_state(expires_at);

-- Row Level Security
-- No policies — this table is accessed only via the service_role key,
-- which bypasses RLS. Enabling RLS here blocks any accidental
-- anonymous or user-token access.
ALTER TABLE public.oauth_state ENABLE ROW LEVEL SECURITY;
