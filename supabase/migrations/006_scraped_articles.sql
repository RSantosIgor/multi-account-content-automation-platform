-- ============================================================
-- DB-004 (part 2): Scraped Articles
-- ============================================================
-- Articles collected from news sites.
-- Only title + summary are stored (not the full body).
-- Deduplication: UNIQUE(news_site_id, url) + ON CONFLICT DO NOTHING.
-- is_processed flags whether an AI suggestion has been generated.
-- ============================================================

CREATE TABLE public.scraped_articles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  news_site_id UUID        NOT NULL REFERENCES public.news_sites(id) ON DELETE CASCADE,
  url          TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  summary      TEXT,          -- plain text, max ~500 chars (no HTML)
  published_at TIMESTAMPTZ,
  is_processed BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (news_site_id, url)
);

-- Indexes
CREATE INDEX idx_scraped_articles_news_site_id  ON public.scraped_articles(news_site_id);
CREATE INDEX idx_scraped_articles_is_processed  ON public.scraped_articles(is_processed)
  WHERE is_processed = false;  -- partial index for unprocessed articles

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.scraped_articles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.scraped_articles ENABLE ROW LEVEL SECURITY;
