import cron from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import { NewsSiteIngester } from '../services/ingest/news-site-ingester.js';
import { YoutubeIngester } from '../services/ingest/youtube-ingester.js';
import { XFeedIngester } from '../services/ingest/x-feed-ingester.js';
import { NewsletterIngester } from '../services/ingest/newsletter-ingester.js';
import { ContentTagger } from '../services/editorial/tagger.js';
import { EditorialClusterer } from '../services/editorial/clusterer.js';
import { BriefGenerator } from '../services/editorial/brief-generator.js';
import { supabase } from '../lib/supabase.js';

/**
 * Cron Job Scheduler
 *
 * Registers periodic jobs inside the Fastify process using node-cron.
 * Called once at server startup, before fastify.listen().
 *
 * Schedule summary:
 *   0 * * * *    — News site ingestion   (every 1h)
 *   0 * * * *    — YouTube ingestion     (every 1h)
 *   0 * * * *    — X feed ingestion      (every 1h)
 *   0 * * * *    — Newsletter ingestion  (every 1h)
 *   0 * * * *    — Content tagging       (every 1h)
 *   *\/10 * * * * — Clustering + briefs   (every 10 min, guarded by new-tags check)
 */

/**
 * Returns true if any new content_tags were created in the last WINDOW_MINUTES.
 * Used as a cheap guard before running the clustering pipeline.
 */
async function hasNewTagsSince(windowMinutes: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count } = await supabase
    .from('content_tags')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', cutoff);
  return (count ?? 0) > 0;
}

/**
 * Register all cron jobs.
 *
 * @param logger - Fastify pino logger for structured logging
 */
export function registerJobs(logger: FastifyBaseLogger): void {
  // Every 1 hour — news site ingestion (unified pipeline)
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: starting news site ingestion run');
    try {
      const results = await NewsSiteIngester.runAll();
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: news site ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: news site ingestion failed');
    }
  });

  // Every 1 hour — YouTube channel ingestion (requires YOUTUBE_API_KEY)
  cron.schedule('0 * * * *', async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return; // skip silently when key not configured
    logger.info('Cron: starting YouTube ingestion run');
    try {
      const results = await YoutubeIngester.runAll(apiKey);
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: YouTube ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: YouTube ingestion failed');
    }
  });

  // Every 1 hour — X feed ingestion
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: starting X feed ingestion run');
    try {
      const results = await XFeedIngester.runAll();
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: X feed ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: X feed ingestion failed');
    }
  });

  // Every 1 hour — Newsletter/blog RSS ingestion
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: starting newsletter ingestion run');
    try {
      const results = await NewsletterIngester.runAll();
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: newsletter ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: newsletter ingestion failed');
    }
  });

  // Every 1 hour — tag untagged content_items across all active accounts
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: starting content tagging run');
    try {
      const { data: accounts } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('is_active', true);

      let total = 0;
      for (const account of accounts ?? []) {
        const count = await ContentTagger.tagUntaggedItems(account.id);
        total += count;
      }

      logger.info({ total }, 'Cron: content tagging completed');
    } catch (err) {
      logger.error(err, 'Cron: content tagging failed');
    }
  });

  // Every 10 minutes — detect editorial clusters + generate briefs + auto-suggestions (EDT-009)
  // Guard: skips the run if no new content_tags were created in the last 15 minutes,
  // avoiding expensive BFS clustering when there is no new content to process.
  cron.schedule('*/10 * * * *', async () => {
    try {
      const newContent = await hasNewTagsSince(15);
      if (!newContent) {
        logger.debug('Cron: no new tags in last 15 min — skipping clustering');
        return;
      }

      logger.info('Cron: starting editorial clustering run');

      const { data: accounts } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('is_active', true);

      let clustersCreated = 0;
      let briefsGenerated = 0;
      for (const account of accounts ?? []) {
        await EditorialClusterer.detectClusters(account.id);
        const briefs = await BriefGenerator.processDetectedClusters(account.id);
        briefsGenerated += briefs;
        clustersCreated++;
      }

      logger.info(
        { accounts: clustersCreated, briefs: briefsGenerated },
        'Cron: editorial clustering completed',
      );
    } catch (err) {
      logger.error(err, 'Cron: editorial clustering failed');
    }
  });

  logger.info('Cron jobs registered (4 ingesters + tagging + clustering/10min)');
}
