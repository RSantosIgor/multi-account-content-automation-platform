-- ============================================================
-- DB-004 (part 3): AI Suggestions
-- ============================================================
-- AI-generated post suggestions, one per scraped article.
-- Lifecycle: pending → approved → posted
--                    ↘ rejected
-- ============================================================

CREATE TABLE public.ai_suggestions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id       UUID        NOT NULL REFERENCES public.scraped_articles(id) ON DELETE CASCADE,
  x_account_id     UUID        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  suggestion_text  TEXT        NOT NULL,   -- ≤ 280 characters
  hashtags         TEXT[]      NOT NULL DEFAULT '{}',
  status           TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'posted')),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID        REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_suggestions_x_account_id ON public.ai_suggestions(x_account_id);
CREATE INDEX idx_ai_suggestions_article_id   ON public.ai_suggestions(article_id);
CREATE INDEX idx_ai_suggestions_status       ON public.ai_suggestions(status);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ai_suggestions
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
