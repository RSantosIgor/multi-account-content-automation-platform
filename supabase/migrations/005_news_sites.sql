-- ============================================================
-- DB-004 (part 1): News Sites
-- ============================================================
-- Sites to scrape, associated with a specific X account.
-- source_type drives which scraper is used:
--   'rss'  → use feed_url with rss-parser
--   'html' → use url + scraping_config with cheerio
--   'auto' → try RSS first, fall back to HTML
-- ============================================================

CREATE TABLE public.news_sites (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id            UUID        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  name                    TEXT        NOT NULL,
  url                     TEXT        NOT NULL,
  source_type             TEXT        NOT NULL DEFAULT 'auto'
                            CHECK (source_type IN ('rss', 'html', 'auto')),
  feed_url                TEXT,                 -- populated when RSS is detected
  scraping_config         JSONB,                -- { article_selector, title_selector, summary_selector, link_selector }
  scraping_interval_hours INTEGER     NOT NULL DEFAULT 4
                            CHECK (scraping_interval_hours BETWEEN 1 AND 168),
  is_active               BOOLEAN     NOT NULL DEFAULT true,
  last_scraped_at         TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_news_sites_x_account_id ON public.news_sites(x_account_id);
CREATE INDEX idx_news_sites_is_active    ON public.news_sites(is_active);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.news_sites
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Row Level Security (policies applied in 011_rls_policies.sql)
ALTER TABLE public.news_sites ENABLE ROW LEVEL SECURITY;
