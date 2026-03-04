-- Migration 023: bridge scraped_articles → content_items
-- Creates a trigger so every INSERT/UPDATE on scraped_articles
-- is automatically reflected in content_items. Also backfills existing data.
-- Part of SRC-002.

-- 1. Reference column in legacy table
ALTER TABLE public.scraped_articles
  ADD COLUMN content_item_id uuid REFERENCES public.content_items(id);

-- 2. Trigger function
CREATE OR REPLACE FUNCTION public.bridge_article_to_content_item()
RETURNS TRIGGER AS $$
DECLARE
  ci_id      uuid;
  account_id uuid;
BEGIN
  -- Resolve x_account_id via news_site
  SELECT ns.x_account_id INTO account_id
  FROM public.news_sites ns
  WHERE ns.id = NEW.news_site_id;

  -- Upsert content_item (idempotent on source_type + x_account_id + url)
  INSERT INTO public.content_items (
    x_account_id,
    source_type,
    source_table,
    source_record_id,
    url,
    title,
    summary,
    full_content,
    is_processed,
    published_at,
    ingested_at
  ) VALUES (
    account_id,
    'news_article',
    'scraped_articles',
    NEW.id,
    NEW.url,
    NEW.title,
    NEW.summary,
    NEW.full_article_content,
    NEW.is_processed,
    NEW.published_at,
    COALESCE(NEW.created_at::timestamptz, now())
  )
  ON CONFLICT (source_type, x_account_id, url) DO UPDATE
    SET full_content  = EXCLUDED.full_content,
        is_processed  = EXCLUDED.is_processed,
        updated_at    = now()
  RETURNING id INTO ci_id;

  -- Write back the reference so the article row carries the FK
  NEW.content_item_id := ci_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger (BEFORE so NEW.content_item_id is set before the row lands)
CREATE TRIGGER trg_bridge_article
  BEFORE INSERT OR UPDATE ON public.scraped_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.bridge_article_to_content_item();

-- 4. Backfill: populate content_items for existing scraped_articles
INSERT INTO public.content_items (
  x_account_id,
  source_type,
  source_table,
  source_record_id,
  url,
  title,
  summary,
  full_content,
  is_processed,
  published_at,
  ingested_at
)
SELECT
  ns.x_account_id,
  'news_article',
  'scraped_articles',
  sa.id,
  sa.url,
  sa.title,
  sa.summary,
  sa.full_article_content,
  sa.is_processed,
  sa.published_at,
  sa.created_at
FROM public.scraped_articles sa
JOIN public.news_sites ns ON ns.id = sa.news_site_id
ON CONFLICT (source_type, x_account_id, url) DO NOTHING;

-- 5. Backfill: set content_item_id on existing scraped_articles rows
UPDATE public.scraped_articles sa
SET content_item_id = ci.id
FROM public.content_items ci
WHERE ci.source_type     = 'news_article'
  AND ci.source_record_id = sa.id
  AND sa.content_item_id  IS NULL;
