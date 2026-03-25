-- Migration 030: Ingestion Start Date — YouTube & X Feed (SRC-011)
--
-- Adds an optional `ingestion_start_date` column to youtube_sources and
-- x_feed_sources. When set, the ingester ignores content published before
-- this date — useful when adding a retroactive source with years of history.

ALTER TABLE public.youtube_sources
  ADD COLUMN IF NOT EXISTS ingestion_start_date timestamptz;

ALTER TABLE public.x_feed_sources
  ADD COLUMN IF NOT EXISTS ingestion_start_date timestamptz;
