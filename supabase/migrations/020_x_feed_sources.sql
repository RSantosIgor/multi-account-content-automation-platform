-- Migration 020: x_feed_sources — per-account X (Twitter) feed monitoring configuration
-- Part of SRC epic: multi-source ingestion layer

CREATE TABLE public.x_feed_sources (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id             uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  feed_username            text        NOT NULL,
  feed_user_id             text,
  is_active                boolean     NOT NULL DEFAULT true,
  scraping_interval_hours  integer     NOT NULL DEFAULT 4,
  last_scraped_at          timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE (x_account_id, feed_username)
);

CREATE INDEX idx_x_feed_sources_account
  ON public.x_feed_sources (x_account_id);
