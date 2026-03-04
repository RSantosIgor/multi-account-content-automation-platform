-- Migration 019: youtube_sources — per-account YouTube channel configuration
-- Part of SRC epic: multi-source ingestion layer

CREATE TABLE public.youtube_sources (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id             uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  channel_id               text        NOT NULL,
  channel_name             text        NOT NULL,
  channel_url              text        NOT NULL,
  is_active                boolean     NOT NULL DEFAULT true,
  scraping_interval_hours  integer     NOT NULL DEFAULT 6,
  last_scraped_at          timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE (x_account_id, channel_id)
);

CREATE INDEX idx_youtube_sources_account
  ON public.youtube_sources (x_account_id);
