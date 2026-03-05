-- Migration 027: EDT-005 — Make ai_suggestions.article_id nullable
-- Editorial suggestions (from clusters/briefs) do not originate from scraped_articles.
-- They use editorial_brief_id + source_content_ids instead for traceability.

ALTER TABLE public.ai_suggestions
  ALTER COLUMN article_id DROP NOT NULL;
