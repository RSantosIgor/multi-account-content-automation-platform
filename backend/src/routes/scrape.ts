import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { config } from '../config.js';
import { authorize } from '../plugins/authorize.js';
import { ScraperRunner } from '../services/scraper/runner.js';

/**
 * Scraping Routes (SCRAPER-004)
 *
 * POST /api/v1/scrape/run              — run all active sites (admin or cron secret)
 * POST /api/v1/scrape/run/:siteId      — run specific site (owner auth)
 * GET  /api/v1/accounts/:accountId/sites/:siteId/runs — list run history
 */

const siteIdParamSchema = z.object({
  siteId: z.string().uuid(),
});

const runHistoryParamsSchema = z.object({
  accountId: z.string().uuid(),
  siteId: z.string().uuid(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const scrapeRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/scrape/run
   * Run all active sites. Protected by admin role OR cron secret header.
   */
  fastify.post('/api/v1/scrape/run', async (request, reply) => {
    // Check cron secret header first
    const cronSecret = request.headers['x-cron-secret'];
    if (cronSecret === config.CRON_SECRET) {
      // Authorized via cron secret — proceed without JWT
      const results = await ScraperRunner.runAll();
      return reply.status(200).send({
        data: results,
        message: `Scraping completed for ${results.length} sites`,
      });
    }

    // Otherwise, require JWT + admin role
    await fastify.authenticate(request, reply);
    await authorize('admin')(request, reply);

    const results = await ScraperRunner.runAll();
    return reply.status(200).send({
      data: results,
      message: `Scraping completed for ${results.length} sites`,
    });
  });

  /**
   * POST /api/v1/scrape/run/:siteId
   * Run scraping for a specific site. Requires owner auth.
   */
  fastify.post(
    '/api/v1/scrape/run/:siteId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = siteIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid site ID');
      }

      const { siteId } = paramsResult.data;

      // Verify user owns this site (via x_account ownership chain)
      const { data: site, error: siteError } = await supabase
        .from('news_sites')
        .select('id, x_account_id')
        .eq('id', siteId)
        .single();

      if (siteError || !site) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      const { data: account, error: accountError } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('id', site.x_account_id)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (accountError) {
        throw fastify.httpErrors.internalServerError(accountError.message);
      }

      if (!account) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      const result = await ScraperRunner.runSite(siteId);

      return {
        data: result,
      };
    },
  );

  /**
   * GET /api/v1/accounts/:accountId/sites/:siteId/runs
   * List scraping run history for a site. Requires owner auth.
   */
  fastify.get(
    '/api/v1/accounts/:accountId/sites/:siteId/runs',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = runHistoryParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid parameters');
      }

      const queryResult = paginationSchema.safeParse(request.query);
      if (!queryResult.success) {
        throw fastify.httpErrors.badRequest('Invalid pagination parameters');
      }

      const { accountId, siteId } = paramsResult.data;
      const { page, limit } = queryResult.data;

      // Verify ownership
      const { data: account, error: accountError } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (accountError) {
        throw fastify.httpErrors.internalServerError(accountError.message);
      }

      if (!account) {
        throw fastify.httpErrors.notFound('Account not found');
      }

      // Verify site belongs to account
      const { data: site, error: siteError } = await supabase
        .from('news_sites')
        .select('id')
        .eq('id', siteId)
        .eq('x_account_id', accountId)
        .maybeSingle();

      if (siteError) {
        throw fastify.httpErrors.internalServerError(siteError.message);
      }

      if (!site) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      // Count total runs
      const { count, error: countError } = await supabase
        .from('scraping_runs')
        .select('id', { count: 'exact', head: true })
        .eq('news_site_id', siteId);

      if (countError) {
        throw fastify.httpErrors.internalServerError(countError.message);
      }

      // Fetch paginated runs
      const offset = (page - 1) * limit;
      const { data: runs, error: runsError } = await supabase
        .from('scraping_runs')
        .select('*')
        .eq('news_site_id', siteId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (runsError) {
        throw fastify.httpErrors.internalServerError(runsError.message);
      }

      return {
        data: (runs ?? []).map((run) => ({
          id: run.id,
          newsSiteId: run.news_site_id,
          status: run.status,
          articlesFound: run.articles_found,
          startedAt: run.started_at,
          finishedAt: run.finished_at,
          errorMessage: run.error_message,
          createdAt: run.created_at,
        })),
        pagination: {
          page,
          limit,
          total: count ?? 0,
        },
      };
    },
  );
};

export default scrapeRoutes;
