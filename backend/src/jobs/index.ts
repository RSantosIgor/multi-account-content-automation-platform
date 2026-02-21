import cron from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import { ScraperRunner } from '../services/scraper/runner.js';

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

  logger.info('Cron jobs registered (scraping every 4 hours)');
}
