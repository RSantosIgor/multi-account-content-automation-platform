-- ============================================================
-- DB-004 (part 4): Posts
-- ============================================================
-- Published posts history. Each row represents one attempt to
-- post to X (Twitter). On failure, status='failed' and
-- error_message is populated.
-- ai_suggestion_id is nullable (manual posts without an AI suggestion).
-- ============================================================

CREATE TABLE public.posts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id     UUID        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  ai_suggestion_id UUID        REFERENCES public.ai_suggestions(id) ON DELETE SET NULL,
  content          TEXT        NOT NULL,   -- final text that was posted (≤ 280 chars)
  x_post_id        TEXT,                   -- X post ID returned by the API
  x_post_url       TEXT,                   -- full URL to the post on X
  status           TEXT        NOT NULL
                     CHECK (status IN ('published', 'failed')),
  error_message    TEXT,                   -- populated when status = 'failed'
  published_at     TIMESTAMPTZ,            -- when the post was successfully published
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_x_account_id     ON public.posts(x_account_id);
CREATE INDEX idx_posts_ai_suggestion_id ON public.posts(ai_suggestion_id);
CREATE INDEX idx_posts_status           ON public.posts(status);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
