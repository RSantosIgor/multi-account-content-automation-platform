-- Migration 024: SRC-006 + SRC-005 schema additions
-- 1. Add content_item_id to ai_suggestions (nullable for backward compat)
-- 2. Add feed_url + last_scraped_at to newsletter_sources (required for RSS ingestion)

-- 1. ai_suggestions: content_item_id
ALTER TABLE public.ai_suggestions
  ADD COLUMN content_item_id uuid REFERENCES public.content_items(id);

CREATE INDEX idx_ai_suggestions_content_item
  ON public.ai_suggestions (content_item_id);

-- Backfill: link existing suggestions to their content_items via scraped_articles
UPDATE public.ai_suggestions s
SET content_item_id = sa.content_item_id
FROM public.scraped_articles sa
WHERE sa.id = s.article_id
  AND sa.content_item_id IS NOT NULL
  AND s.content_item_id IS NULL;

-- 2. newsletter_sources: feed_url (RSS URL) and tracking timestamp
ALTER TABLE public.newsletter_sources
  ADD COLUMN feed_url text,
  ADD COLUMN last_scraped_at timestamptz;
