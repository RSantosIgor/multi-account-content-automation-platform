import { supabase } from '../../lib/supabase.js';
import type { Database } from '../../types/database.js';
import { scrapeRss } from './rss.js';
import { scrapeHtml, type ScrapingConfig } from './html.js';
import type { ScrapedArticleInput } from './rss.js';

/**
 * Scraper Runner & Orchestrator (SCRAPER-003)
 *
 * Coordinates scraping across all active news sites:
 * 1. Queries active news_sites (or a single site)
 * 2. Calls the appropriate scraper (RSS or HTML)
 * 3. Inserts articles with ON CONFLICT DO NOTHING
 * 4. Logs execution in scraping_runs
 */

type NewsSiteRow = Database['public']['Tables']['news_sites']['Row'];

export interface ScrapingRunResult {
  siteId: string;
  siteName: string;
  status: 'success' | 'failed';
  articlesFound: number;
  errorMessage?: string;
}

/**
 * Scrape a single site using the appropriate strategy based on source_type.
 */
async function scrapeSite(site: NewsSiteRow): Promise<ScrapedArticleInput[]> {
  const config = site.scraping_config as ScrapingConfig | null;

  switch (site.source_type) {
    case 'rss': {
      if (!site.feed_url) return [];
      return scrapeRss(site.feed_url);
    }
    case 'html': {
      if (!config) return [];
      return scrapeHtml(site.url, config);
    }
    case 'auto': {
      // Try RSS first, then fall back to HTML
      if (site.feed_url) {
        const rssArticles = await scrapeRss(site.feed_url);
        if (rssArticles.length > 0) return rssArticles;
      }
      // Fall back to HTML if config exists
      if (config) {
        return scrapeHtml(site.url, config);
      }
      return [];
    }
    default:
      return [];
  }
}

export class ScraperRunner {
  /**
   * Run scraping for all active news sites.
   * Failures on one site do not stop processing of others.
   */
  static async runAll(): Promise<ScrapingRunResult[]> {
    const { data: sites, error } = await supabase
      .from('news_sites')
      .select('*')
      .eq('is_active', true);

    if (error || !sites) {
      return [];
    }

    const results: ScrapingRunResult[] = [];

    for (const site of sites) {
      const result = await ScraperRunner.runSite(site.id);
      results.push(result);
    }

    return results;
  }

  /**
   * Run scraping for a single site by ID.
   * Creates a scraping_runs record to track execution.
   */
  static async runSite(siteId: string): Promise<ScrapingRunResult> {
    // Fetch the site
    const { data: site, error: siteError } = await supabase
      .from('news_sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return {
        siteId,
        siteName: 'Unknown',
        status: 'failed',
        articlesFound: 0,
        errorMessage: siteError?.message ?? 'Site not found',
      };
    }

    // Create a scraping_runs record
    const { data: run, error: runError } = await supabase
      .from('scraping_runs')
      .insert({
        news_site_id: siteId,
        status: 'running',
        articles_found: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !run) {
      return {
        siteId,
        siteName: site.name,
        status: 'failed',
        articlesFound: 0,
        errorMessage: runError?.message ?? 'Failed to create scraping run',
      };
    }

    try {
      // Scrape the site
      const articles = await scrapeSite(site);

      // Insert articles with ON CONFLICT DO NOTHING (deduplication)
      let articlesInserted = 0;
      if (articles.length > 0) {
        const rows = articles.map((article) => ({
          news_site_id: siteId,
          url: article.url,
          title: article.title,
          summary: article.summary,
          published_at: article.published_at,
          is_processed: false,
        }));

        // Supabase upsert with ignoreDuplicates for ON CONFLICT DO NOTHING
        const { data: inserted, error: insertError } = await supabase
          .from('scraped_articles')
          .upsert(rows, { onConflict: 'news_site_id,url', ignoreDuplicates: true })
          .select('id');

        if (insertError) {
          throw new Error(`Failed to insert articles: ${insertError.message}`);
        }

        articlesInserted = inserted?.length ?? 0;
      }

      // Update last_scraped_at on the site
      await supabase
        .from('news_sites')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', siteId);

      // Update the scraping run as success
      await supabase
        .from('scraping_runs')
        .update({
          status: 'success',
          articles_found: articlesInserted,
          finished_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      return {
        siteId,
        siteName: site.name,
        status: 'success',
        articlesFound: articlesInserted,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown scraping error';

      // Update the scraping run as failed
      await supabase
        .from('scraping_runs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          finished_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      return {
        siteId,
        siteName: site.name,
        status: 'failed',
        articlesFound: 0,
        errorMessage,
      };
    }
  }

  /**
   * Run a single site and return article previews (no DB save).
   * Used by the test/preview endpoint in sites routes.
   */
  static async previewSite(
    site: NewsSiteRow,
    maxArticles: number = 5,
  ): Promise<ScrapedArticleInput[]> {
    const config = site.scraping_config as ScrapingConfig | null;

    switch (site.source_type) {
      case 'rss': {
        if (!site.feed_url) return [];
        return scrapeRss(site.feed_url, maxArticles);
      }
      case 'html': {
        if (!config) return [];
        return scrapeHtml(site.url, config, maxArticles);
      }
      case 'auto': {
        if (site.feed_url) {
          const rssArticles = await scrapeRss(site.feed_url, maxArticles);
          if (rssArticles.length > 0) return rssArticles;
        }
        if (config) {
          return scrapeHtml(site.url, config, maxArticles);
        }
        return [];
      }
      default:
        return [];
    }
  }
}
