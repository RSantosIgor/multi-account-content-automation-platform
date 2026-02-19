-- ============================================================
-- DB-004 (part 5): Scraping Runs
-- ============================================================
-- Execution log for every scraping run, per news site.
-- Created at run start (status='running'), updated on finish.
-- ============================================================

CREATE TABLE public.scraping_runs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  news_site_id   UUID        NOT NULL REFERENCES public.news_sites(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'running'
                   CHECK (status IN ('running', 'success', 'failed')),
  articles_found INTEGER     NOT NULL DEFAULT 0,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  error_message  TEXT,        -- populated when status = 'failed'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scraping_runs_news_site_id ON public.scraping_runs(news_site_id);
CREATE INDEX idx_scraping_runs_started_at   ON public.scraping_runs(started_at DESC);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.scraping_runs
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.scraping_runs ENABLE ROW LEVEL SECURITY;
