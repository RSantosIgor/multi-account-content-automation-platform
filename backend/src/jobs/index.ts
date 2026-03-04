import cron from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import { ScraperRunner } from '../services/scraper/runner.js';
import { YoutubeIngester } from '../services/ingest/youtube-ingester.js';
import { XFeedIngester } from '../services/ingest/x-feed-ingester.js';
import { NewsletterIngester } from '../services/ingest/newsletter-ingester.js';

/**
 * Cron Job Scheduler (SCRAPER-005)
 *
 * Registers periodic jobs inside the Fastify process using node-cron.
 * Called once at server startup, before fastify.listen().
 */

/**
 * Register all cron jobs.
 *
 * @param logger - Fastify pino logger for structured logging
 */
export function registerJobs(logger: FastifyBaseLogger): void {
  // Every 4 hours — scrape all active news sites
  cron.schedule('0 */4 * * *', async () => {
    logger.info('Cron: starting scheduled scraping run');
    try {
      const results = await ScraperRunner.runAll();
      const successful = results.filter((r) => r.status === 'success').length;
      const failed = results.filter((r) => r.status === 'failed').length;
      const totalArticles = results.reduce((sum, r) => sum + r.articlesFound, 0);

      logger.info(
        { total: results.length, successful, failed, totalArticles },
        'Cron: scraping run completed',
      );
    } catch (err) {
      logger.error(err, 'Cron: scraping run failed with unexpected error');
    }
  });

  // Every 6 hours — YouTube channel ingestion (requires YOUTUBE_API_KEY)
  cron.schedule('0 */6 * * *', async () => {
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

  // Every 4 hours — X feed ingestion
  cron.schedule('30 */4 * * *', async () => {
    logger.info('Cron: starting X feed ingestion run');
    try {
      const results = await XFeedIngester.runAll();
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: X feed ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: X feed ingestion failed');
    }
  });

  // Every 12 hours — Newsletter/blog RSS ingestion
  cron.schedule('0 */12 * * *', async () => {
    logger.info('Cron: starting newsletter ingestion run');
    try {
      const results = await NewsletterIngester.runAll();
      const total = results.reduce((s, r) => s + r.itemsIngested, 0);
      logger.info({ sources: results.length, total }, 'Cron: newsletter ingestion completed');
    } catch (err) {
      logger.error(err, 'Cron: newsletter ingestion failed');
    }
  });

  logger.info('Cron jobs registered (scraping every 4 hours)');
}
