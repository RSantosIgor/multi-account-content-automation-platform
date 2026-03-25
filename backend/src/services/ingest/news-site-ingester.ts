/**
 * News Site Ingester (UNIFY-002)
 *
 * Scrapes RSS/HTML news sites and ingests articles directly into content_items.
 * Replaces the legacy ScraperRunner + scraped_articles flow.
 *
 * Reuses existing scraper utilities: rss.ts, html.ts, rss-detector.ts
 */

import { supabase } from '../../lib/supabase.js';
import { scrapeRss } from '../scraper/rss.js';
import { scrapeHtml, type ScrapingConfig } from '../scraper/html.js';
import { AiSuggestionService } from '../ai/suggest.js';
import { ContentTagger } from '../editorial/tagger.js';

export interface NewsSiteIngesterResult {
  sourceId: string;
  siteName: string;
  itemsIngested: number;
  itemsSkipped: number;
  errors: number;
}

interface NewsSiteSourceRow {
  id: string;
  x_account_id: string;
  site_name: string;
  site_url: string;
  source_type: string;
  feed_url: string | null;
  scraping_config: ScrapingConfig | null;
  is_active: boolean;
  scraping_interval_hours: number;
  last_scraped_at: string | null;
}

async function scrapeSite(
  source: NewsSiteSourceRow,
): Promise<{ url: string; title: string; summary: string | null; published_at: string | null }[]> {
  switch (source.source_type) {
    case 'rss': {
      if (!source.feed_url) return [];
      return scrapeRss(source.feed_url);
    }
    case 'html': {
      if (!source.scraping_config) return [];
      return scrapeHtml(source.site_url, source.scraping_config);
    }
    case 'auto': {
      if (source.feed_url) {
        const rssArticles = await scrapeRss(source.feed_url);
        if (rssArticles.length > 0) return rssArticles;
      }
      if (source.scraping_config) {
        return scrapeHtml(source.site_url, source.scraping_config);
      }
      return [];
    }
    default:
      return [];
  }
}

export class NewsSiteIngester {
  /**
   * Run ingestion for all active news_site_sources.
   */
  static async runAll(): Promise<NewsSiteIngesterResult[]> {
    const { data: sources, error } = await supabase
      .from('news_site_sources')
      .select('*')
      .eq('is_active', true);

    if (error || !sources) {
      console.error('[NewsSite] Failed to fetch sources:', error?.message);
      return [];
    }

    const results: NewsSiteIngesterResult[] = [];

    for (const source of sources) {
      // Respect per-source interval
      if (source.last_scraped_at) {
        const nextRun = new Date(source.last_scraped_at);
        nextRun.setHours(nextRun.getHours() + source.scraping_interval_hours);
        if (new Date() < nextRun) continue;
      }

      try {
        const result = await NewsSiteIngester.runSource(source.id);
        results.push(result);
      } catch (err) {
        console.error('[NewsSite] runSource failed for', source.id, err);
      }
    }

    return results;
  }

  /**
   * Run ingestion for a single news_site_source.
   */
  static async runSource(sourceId: string): Promise<NewsSiteIngesterResult> {
    const { data: source, error: sourceError } = await supabase
      .from('news_site_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`News site source not found: ${sourceId}`);
    }

    const result: NewsSiteIngesterResult = {
      sourceId,
      siteName: source.site_name,
      itemsIngested: 0,
      itemsSkipped: 0,
      errors: 0,
    };

    const articles = await scrapeSite(source as NewsSiteSourceRow);

    if (articles.length === 0) {
      await supabase
        .from('news_site_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);
      return result;
    }

    for (const article of articles) {
      const { data: inserted, error: insertError } = await supabase
        .from('content_items')
        .upsert(
          {
            x_account_id: source.x_account_id,
            source_type: 'news_article',
            source_table: 'news_site_sources',
            source_record_id: sourceId,
            url: article.url,
            title: article.title.trim(),
            summary: article.summary,
            full_content: null,
            is_processed: false,
            published_at: article.published_at,
            ingested_at: new Date().toISOString(),
            metadata: {
              siteName: source.site_name,
              siteUrl: source.site_url,
            },
          },
          { onConflict: 'source_type,x_account_id,url', ignoreDuplicates: true },
        )
        .select('id');

      if (insertError) {
        console.error('[NewsSite] Insert failed for', article.url, insertError.message);
        result.errors++;
      } else if (inserted && inserted.length > 0) {
        // Newly inserted item — tag it immediately
        await ContentTagger.tagContentItem(inserted[0].id);
        result.itemsIngested++;
      } else {
        result.itemsSkipped++;
      }
    }

    // Update last_scraped_at
    await supabase
      .from('news_site_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sourceId);

    // Run AI analysis on new content items
    await AiSuggestionService.processNewContentItems(source.x_account_id);

    return result;
  }

  /**
   * Preview scraping results without saving (for test endpoint).
   */
  static async previewSource(
    sourceId: string,
    maxArticles: number = 5,
  ): Promise<
    { url: string; title: string; summary: string | null; published_at: string | null }[]
  > {
    const { data: source, error } = await supabase
      .from('news_site_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (error || !source) {
      throw new Error(`News site source not found: ${sourceId}`);
    }

    const s = source as NewsSiteSourceRow;

    switch (s.source_type) {
      case 'rss': {
        if (!s.feed_url) return [];
        return scrapeRss(s.feed_url, maxArticles);
      }
      case 'html': {
        if (!s.scraping_config) return [];
        return scrapeHtml(s.site_url, s.scraping_config, maxArticles);
      }
      case 'auto': {
        if (s.feed_url) {
          const rssArticles = await scrapeRss(s.feed_url, maxArticles);
          if (rssArticles.length > 0) return rssArticles;
        }
        if (s.scraping_config) {
          return scrapeHtml(s.site_url, s.scraping_config, maxArticles);
        }
        return [];
      }
      default:
        return [];
    }
  }
}
