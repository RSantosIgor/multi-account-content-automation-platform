import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { createSiteSchema, updateSiteSchema } from '../schemas/sites.schema.js';
import { detectRssFeed } from '../services/scraper/rss-detector.js';
import type { Database } from '../types/database.js';

type NewsSiteRow = Database['public']['Tables']['news_sites']['Row'];

const accountParamsSchema = z.object({
  accountId: z.string().uuid(),
});

const siteParamsSchema = z.object({
  accountId: z.string().uuid(),
  siteId: z.string().uuid(),
});

/**
 * Verify that the x_account belongs to the authenticated user
 */
async function verifyAccountOwnership(
  fastify: FastifyInstance,
  userId: string,
  accountId: string,
): Promise<void> {
  const { data: account, error } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw fastify.httpErrors.internalServerError(error.message);
  }

  if (!account) {
    throw fastify.httpErrors.notFound('X Account not found');
  }
}

/**
 * Convert database row to public API response
 */
function toPublicSite(site: NewsSiteRow) {
  return {
    id: site.id,
    xAccountId: site.x_account_id,
    name: site.name,
    url: site.url,
    sourceType: site.source_type,
    feedUrl: site.feed_url,
    scrapingConfig: site.scraping_config,
    scrapingIntervalHours: site.scraping_interval_hours,
    isActive: site.is_active,
    lastScrapedAt: site.last_scraped_at,
    createdAt: site.created_at,
    updatedAt: site.updated_at,
  };
}

const sitesRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/accounts/:accountId/sites
   * List all news sites for an X account
   */
  fastify.get(
    '/api/v1/accounts/:accountId/sites',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const parsed = accountParamsSchema.safeParse(request.params);
      if (!parsed.success) {
        throw fastify.httpErrors.badRequest('Invalid account id');
      }

      await verifyAccountOwnership(fastify, request.user.id, parsed.data.accountId);

      const { data: sites, error } = await supabase
        .from('news_sites')
        .select('*')
        .eq('x_account_id', parsed.data.accountId)
        .order('created_at', { ascending: false });

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return {
        data: (sites ?? []).map(toPublicSite),
      };
    },
  );

  /**
   * POST /api/v1/accounts/:accountId/sites
   * Create a new news site with automatic RSS detection
   */
  fastify.post(
    '/api/v1/accounts/:accountId/sites',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = accountParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid account id');
      }

      const bodyResult = createSiteSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw fastify.httpErrors.badRequest(bodyResult.error.message);
      }

      await verifyAccountOwnership(fastify, request.user.id, paramsResult.data.accountId);

      const { name, url, scraping_interval_hours, scraping_config } = bodyResult.data;

      // Attempt RSS auto-detection
      request.log.info({ url }, 'Attempting RSS auto-detection');
      const { feedUrl } = await detectRssFeed(url);

      let sourceType: 'rss' | 'html' | 'auto';
      let finalFeedUrl: string | null = null;

      if (feedUrl) {
        // RSS feed found
        sourceType = 'rss';
        finalFeedUrl = feedUrl;
        request.log.info({ feedUrl }, 'RSS feed detected');
      } else if (scraping_config) {
        // No RSS, but user provided HTML config
        sourceType = 'html';
        request.log.info('No RSS found, using HTML scraping config');
      } else {
        // No RSS and no config → set to auto (will try RSS then HTML)
        sourceType = 'auto';
        request.log.info('No RSS found and no config provided, set to auto mode');
      }

      const { data: site, error } = await supabase
        .from('news_sites')
        .insert({
          x_account_id: paramsResult.data.accountId,
          name,
          url,
          source_type: sourceType,
          feed_url: finalFeedUrl,
          scraping_config: scraping_config ?? null,
          scraping_interval_hours,
        })
        .select()
        .single();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return {
        data: toPublicSite(site),
        message: feedUrl ? 'Site created successfully with RSS feed' : 'Site created successfully',
      };
    },
  );

  /**
   * PUT /api/v1/accounts/:accountId/sites/:siteId
   * Update a news site
   */
  fastify.put(
    '/api/v1/accounts/:accountId/sites/:siteId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = siteParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid parameters');
      }

      const bodyResult = updateSiteSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw fastify.httpErrors.badRequest(bodyResult.error.message);
      }

      await verifyAccountOwnership(fastify, request.user.id, paramsResult.data.accountId);

      // Verify site exists and belongs to the account
      const { data: existingSite, error: fetchError } = await supabase
        .from('news_sites')
        .select('id')
        .eq('id', paramsResult.data.siteId)
        .eq('x_account_id', paramsResult.data.accountId)
        .maybeSingle();

      if (fetchError) {
        throw fastify.httpErrors.internalServerError(fetchError.message);
      }

      if (!existingSite) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      const updates: Database['public']['Tables']['news_sites']['Update'] = {};

      if (bodyResult.data.name !== undefined) updates.name = bodyResult.data.name;
      if (bodyResult.data.url !== undefined) updates.url = bodyResult.data.url;
      if (bodyResult.data.scraping_interval_hours !== undefined) {
        updates.scraping_interval_hours = bodyResult.data.scraping_interval_hours;
      }
      if (bodyResult.data.scraping_config !== undefined) {
        updates.scraping_config = bodyResult.data.scraping_config;
      }
      if (bodyResult.data.is_active !== undefined) {
        updates.is_active = bodyResult.data.is_active;
      }

      const { data: site, error } = await supabase
        .from('news_sites')
        .update(updates)
        .eq('id', paramsResult.data.siteId)
        .eq('x_account_id', paramsResult.data.accountId)
        .select()
        .single();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return {
        data: toPublicSite(site),
      };
    },
  );

  /**
   * DELETE /api/v1/accounts/:accountId/sites/:siteId
   * Delete a news site
   */
  fastify.delete(
    '/api/v1/accounts/:accountId/sites/:siteId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = siteParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid parameters');
      }

      await verifyAccountOwnership(fastify, request.user.id, paramsResult.data.accountId);

      // Verify site exists
      const { data: site, error: fetchError } = await supabase
        .from('news_sites')
        .select('id')
        .eq('id', paramsResult.data.siteId)
        .eq('x_account_id', paramsResult.data.accountId)
        .maybeSingle();

      if (fetchError) {
        throw fastify.httpErrors.internalServerError(fetchError.message);
      }

      if (!site) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      const { error } = await supabase
        .from('news_sites')
        .delete()
        .eq('id', paramsResult.data.siteId)
        .eq('x_account_id', paramsResult.data.accountId);

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return reply.status(204).send();
    },
  );

  /**
   * POST /api/v1/accounts/:accountId/sites/:siteId/test
   * Test scraper and return preview (up to 5 articles)
   * Note: Full implementation requires SCRAPER-001 and SCRAPER-002
   */
  fastify.post(
    '/api/v1/accounts/:accountId/sites/:siteId/test',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = siteParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid parameters');
      }

      await verifyAccountOwnership(fastify, request.user.id, paramsResult.data.accountId);

      // Fetch site details
      const { data: site, error } = await supabase
        .from('news_sites')
        .select('*')
        .eq('id', paramsResult.data.siteId)
        .eq('x_account_id', paramsResult.data.accountId)
        .maybeSingle();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      if (!site) {
        throw fastify.httpErrors.notFound('Site not found');
      }

      // TODO: Implement scraper preview when SCRAPER-001 and SCRAPER-002 are done
      // For now, return a basic validation response
      if (site.source_type === 'rss' && site.feed_url) {
        return {
          data: {
            message: 'RSS feed URL found',
            feedUrl: site.feed_url,
            preview: [],
            note: 'Full scraper preview will be available after SCRAPER-001 implementation',
          },
        };
      }

      if (site.source_type === 'html' && site.scraping_config) {
        return {
          data: {
            message: 'HTML scraping config found',
            config: site.scraping_config,
            preview: [],
            note: 'Full scraper preview will be available after SCRAPER-002 implementation',
          },
        };
      }

      return {
        data: {
          message: 'Site configuration incomplete',
          preview: [],
        },
      };
    },
  );
};

export default sitesRoutes;
