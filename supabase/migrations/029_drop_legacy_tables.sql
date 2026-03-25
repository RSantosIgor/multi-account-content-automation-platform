-- Migration 029: Drop legacy tables (UNIFY-009)
-- Removes: scraped_articles, scraping_runs, news_sites, bridge trigger
-- Prerequisite: All code references have been updated (UNIFY-002 through UNIFY-008)

-- 1. Remove bridge trigger (migration 023)
DROP TRIGGER IF EXISTS trg_bridge_article_to_content_item ON public.scraped_articles;
DROP FUNCTION IF EXISTS fn_bridge_article_to_content_item();

-- 2. Remove legacy FK columns from ai_suggestions
--    The actual column name in the DB is 'article_id' (generates constraint ai_suggestions_article_id_fkey)
ALTER TABLE public.ai_suggestions DROP COLUMN IF EXISTS article_id;
ALTER TABLE public.ai_suggestions DROP COLUMN IF EXISTS scraped_article_id;

-- 3. Drop legacy tables using CASCADE to handle any remaining FK dependencies
DROP TABLE IF EXISTS public.scraping_runs CASCADE;
DROP TABLE IF EXISTS public.scraped_articles CASCADE;
DROP TABLE IF EXISTS public.news_sites CASCADE;
