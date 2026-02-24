-- Add full article content to scraped_articles
-- This stores the full HTML/text content fetched from the article URL
ALTER TABLE public.scraped_articles
  ADD COLUMN IF NOT EXISTS full_article_content TEXT;

-- Add article summary to ai_suggestions
-- Stores bullet-point summaries as JSON array: { bullets: string[] }
ALTER TABLE public.ai_suggestions
  ADD COLUMN IF NOT EXISTS article_summary JSONB;

-- Add updated_at trigger for ai_suggestions if not already present
DROP TRIGGER IF EXISTS set_updated_at_ai_suggestions ON public.ai_suggestions;
CREATE TRIGGER set_updated_at_ai_suggestions
  BEFORE UPDATE ON public.ai_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
