-- ============================================================
-- UNIFY-001: Unified news_site_sources + auto_flow on all sources
-- ============================================================
-- Creates news_site_sources table mirroring the other source tables,
-- backfills data from legacy news_sites, and adds auto_flow to
-- all source types.
-- ============================================================

-- 1. Create news_site_sources table
CREATE TABLE public.news_site_sources (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id             uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  site_name                text        NOT NULL,
  site_url                 text        NOT NULL,
  source_type              text        NOT NULL DEFAULT 'auto'
                             CHECK (source_type IN ('rss', 'html', 'auto')),
  feed_url                 text,
  scraping_config          jsonb,
  is_active                boolean     NOT NULL DEFAULT true,
  auto_flow                boolean     NOT NULL DEFAULT false,
  scraping_interval_hours  integer     NOT NULL DEFAULT 4
                             CHECK (scraping_interval_hours BETWEEN 1 AND 168),
  last_scraped_at          timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE (x_account_id, site_url)
);

CREATE INDEX idx_news_site_sources_account
  ON public.news_site_sources (x_account_id);

CREATE INDEX idx_news_site_sources_active
  ON public.news_site_sources (is_active)
  WHERE is_active;

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.news_site_sources
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- 2. Add auto_flow to existing source tables (if not already present)
ALTER TABLE public.youtube_sources
  ADD COLUMN IF NOT EXISTS auto_flow boolean NOT NULL DEFAULT false;

ALTER TABLE public.x_feed_sources
  ADD COLUMN IF NOT EXISTS auto_flow boolean NOT NULL DEFAULT false;

ALTER TABLE public.newsletter_sources
  ADD COLUMN IF NOT EXISTS auto_flow boolean NOT NULL DEFAULT false;

-- 3. Backfill: migrate news_sites → news_site_sources
INSERT INTO public.news_site_sources (
  x_account_id, site_name, site_url, source_type, feed_url,
  scraping_config, is_active, auto_flow, scraping_interval_hours,
  last_scraped_at, created_at
)
SELECT
  x_account_id, name, url, source_type, feed_url,
  scraping_config, is_active, auto_flow, scraping_interval_hours,
  last_scraped_at, created_at
FROM public.news_sites;

-- 4. RLS policies
ALTER TABLE public.news_site_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own news_site_sources"
  ON public.news_site_sources FOR ALL
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role bypass news_site_sources"
  ON public.news_site_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);
