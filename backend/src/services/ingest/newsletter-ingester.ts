/**
 * Newsletter / Blog RSS Ingester (SRC-005)
 *
 * Ingests content from newsletter and blog RSS feeds, inserting directly into
 * content_items (bypassing scraped_articles). Reuses the existing scrapeRss()
 * parser without modification.
 *
 * Difference from news_sites: newsletter_sources represent opinionated, curated,
 * single-author content. Keeping them separate allows the editorial pipeline
 * (EDT) to weight them differently from factual news articles.
 */

import { supabase } from '../../lib/supabase.js';
import { scrapeRss } from '../scraper/rss.js';

export interface NewsletterIngesterResult {
  sourceId: string;
  sourceName: string;
  itemsIngested: number;
  itemsSkipped: number;
  errors: number;
}

export class NewsletterIngester {
  /**
   * Run ingestion for all active newsletter_sources that have a feed_url.
   */
  static async runAll(): Promise<NewsletterIngesterResult[]> {
    const { data: sources, error } = await supabase
      .from('newsletter_sources')
      .select('*')
      .eq('is_active', true)
      .not('feed_url', 'is', null);

    if (error || !sources) {
      console.error('[Newsletter] Failed to fetch sources:', error?.message);
      return [];
    }

    const results: NewsletterIngesterResult[] = [];

    for (const source of sources) {
      // Respect per-source interval (default 24h)
      if (source.last_scraped_at) {
        // newsletter_sources doesn't have scraping_interval_hours — use 24h default
        const nextRun = new Date(source.last_scraped_at);
        nextRun.setHours(nextRun.getHours() + 24);
        if (new Date() < nextRun) continue;
      }

      try {
        const result = await NewsletterIngester.runSource(source.id);
        results.push(result);
      } catch (err) {
        console.error('[Newsletter] runSource failed for', source.id, err);
      }
    }

    return results;
  }

  /**
   * Run ingestion for a single newsletter_source.
   */
  static async runSource(sourceId: string): Promise<NewsletterIngesterResult> {
    const { data: source, error: sourceError } = await supabase
      .from('newsletter_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`Newsletter source not found: ${sourceId}`);
    }

    const result: NewsletterIngesterResult = {
      sourceId,
      sourceName: source.name,
      itemsIngested: 0,
      itemsSkipped: 0,
      errors: 0,
    };

    if (!source.feed_url) {
      console.warn('[Newsletter] Source has no feed_url, skipping:', sourceId);
      return result;
    }

    // Reuse existing RSS parser (no changes to rss.ts required)
    const items = await scrapeRss(source.feed_url);

    if (items.length === 0) {
      await supabase
        .from('newsletter_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);
      return result;
    }

    for (const item of items) {
      const metadata = {
        feedName: source.name,
        senderEmail: source.sender_email,
      };

      const { error: insertError } = await supabase.from('content_items').upsert(
        {
          x_account_id: source.x_account_id,
          source_type: 'newsletter',
          source_table: 'newsletter_sources',
          source_record_id: sourceId,
          url: item.url,
          title: item.title,
          summary: item.summary,
          full_content: null, // fetched on-demand at approval (same pattern as news_article)
          is_processed: false,
          published_at: item.published_at,
          ingested_at: new Date().toISOString(),
          metadata,
        },
        { onConflict: 'source_type,x_account_id,url', ignoreDuplicates: true },
      );

      if (insertError) {
        console.error('[Newsletter] Insert failed for', item.url, insertError.message);
        result.errors++;
      } else {
        result.itemsIngested++;
      }
    }

    await supabase
      .from('newsletter_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sourceId);

    return result;
  }
}
