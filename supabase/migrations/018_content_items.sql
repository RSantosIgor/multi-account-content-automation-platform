-- Migration 018: content_items — unified content table for all source types
-- Part of SRC epic: multi-source ingestion layer

CREATE TABLE public.content_items (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id     uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  source_type      text        NOT NULL CHECK (source_type IN ('news_article', 'youtube_video', 'x_post', 'newsletter')),
  source_table     text        NOT NULL,
  source_record_id uuid,
  url              text        NOT NULL,
  title            text        NOT NULL,
  summary          text,
  full_content     text,
  language         text,
  metadata         jsonb       NOT NULL DEFAULT '{}',
  is_processed     boolean     NOT NULL DEFAULT false,
  published_at     timestamptz,
  ingested_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  UNIQUE (source_type, x_account_id, url)
);

-- Index: fetch unprocessed items for a given account (hot path for AI pipeline)
CREATE INDEX idx_content_items_account
  ON public.content_items (x_account_id);

CREATE INDEX idx_content_items_unprocessed
  ON public.content_items (x_account_id, is_processed)
  WHERE NOT is_processed;

-- Index: look up items by source table + record
CREATE INDEX idx_content_items_source
  ON public.content_items (source_type, source_table);
