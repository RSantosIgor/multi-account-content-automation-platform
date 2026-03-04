/**
 * Sources Routes (SRC-003, SRC-004, SRC-005)
 *
 * CRUD endpoints for the three new ingest source types:
 *   GET/POST   /api/v1/accounts/:accountId/sources/youtube
 *   PUT/DELETE /api/v1/accounts/:accountId/sources/youtube/:sourceId
 *
 *   GET/POST   /api/v1/accounts/:accountId/sources/x-feeds
 *   PUT/DELETE /api/v1/accounts/:accountId/sources/x-feeds/:sourceId
 *
 *   GET/POST   /api/v1/accounts/:accountId/sources/newsletters
 *   PUT/DELETE /api/v1/accounts/:accountId/sources/newsletters/:sourceId
 */

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import {
  createYoutubeSourceSchema,
  updateYoutubeSourceSchema,
  createXFeedSourceSchema,
  updateXFeedSourceSchema,
  createNewsletterSourceSchema,
  updateNewsletterSourceSchema,
} from '../schemas/sources.schema.js';

const accountParamsSchema = z.object({
  accountId: z.string().uuid(),
});

const sourceParamsSchema = z.object({
  accountId: z.string().uuid(),
  sourceId: z.string().uuid(),
});

/** Verify user owns the account. Throws httpErrors on failure. */
async function ensureAccountOwner(
  fastify: Parameters<FastifyPluginAsync>[0],
  accountId: string,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw fastify.httpErrors.internalServerError(error.message);
  if (!data) throw fastify.httpErrors.notFound('Account not found');
}

const sourcesRoutes: FastifyPluginAsync = async (fastify) => {
  // ── YouTube sources ──────────────────────────────────────────────────────

  fastify.get(
    '/api/v1/accounts/:accountId/sources/youtube',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { data, error } = await supabase
        .from('youtube_sources')
        .select('*')
        .eq('x_account_id', p.data.accountId)
        .order('created_at', { ascending: false });

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data: data ?? [] };
    },
  );

  fastify.post(
    '/api/v1/accounts/:accountId/sources/youtube',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = createYoutubeSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('youtube_sources')
        .insert({ ...b.data, x_account_id: p.data.accountId })
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data };
    },
  );

  fastify.put(
    '/api/v1/accounts/:accountId/sources/youtube/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = updateYoutubeSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('youtube_sources')
        .update({ ...b.data, updated_at: new Date().toISOString() })
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId)
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      if (!data) throw fastify.httpErrors.notFound('YouTube source not found');
      return { data };
    },
  );

  fastify.delete(
    '/api/v1/accounts/:accountId/sources/youtube/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { error } = await supabase
        .from('youtube_sources')
        .delete()
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId);

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { success: true };
    },
  );

  // ── X feed sources ───────────────────────────────────────────────────────

  fastify.get(
    '/api/v1/accounts/:accountId/sources/x-feeds',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { data, error } = await supabase
        .from('x_feed_sources')
        .select('*')
        .eq('x_account_id', p.data.accountId)
        .order('created_at', { ascending: false });

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data: data ?? [] };
    },
  );

  fastify.post(
    '/api/v1/accounts/:accountId/sources/x-feeds',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = createXFeedSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('x_feed_sources')
        .insert({ ...b.data, x_account_id: p.data.accountId })
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data };
    },
  );

  fastify.put(
    '/api/v1/accounts/:accountId/sources/x-feeds/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = updateXFeedSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('x_feed_sources')
        .update({ ...b.data, updated_at: new Date().toISOString() })
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId)
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      if (!data) throw fastify.httpErrors.notFound('X feed source not found');
      return { data };
    },
  );

  fastify.delete(
    '/api/v1/accounts/:accountId/sources/x-feeds/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { error } = await supabase
        .from('x_feed_sources')
        .delete()
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId);

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { success: true };
    },
  );

  // ── Newsletter sources ───────────────────────────────────────────────────

  fastify.get(
    '/api/v1/accounts/:accountId/sources/newsletters',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { data, error } = await supabase
        .from('newsletter_sources')
        .select('*')
        .eq('x_account_id', p.data.accountId)
        .order('created_at', { ascending: false });

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data: data ?? [] };
    },
  );

  fastify.post(
    '/api/v1/accounts/:accountId/sources/newsletters',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = accountParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid account id');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = createNewsletterSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('newsletter_sources')
        .insert({ ...b.data, x_account_id: p.data.accountId })
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { data };
    },
  );

  fastify.put(
    '/api/v1/accounts/:accountId/sources/newsletters/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const b = updateNewsletterSourceSchema.safeParse(request.body);
      if (!b.success) throw fastify.httpErrors.badRequest(b.error.message);

      const { data, error } = await supabase
        .from('newsletter_sources')
        .update({ ...b.data, updated_at: new Date().toISOString() })
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId)
        .select()
        .single();

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      if (!data) throw fastify.httpErrors.notFound('Newsletter source not found');
      return { data };
    },
  );

  fastify.delete(
    '/api/v1/accounts/:accountId/sources/newsletters/:sourceId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const p = sourceParamsSchema.safeParse(request.params);
      if (!p.success) throw fastify.httpErrors.badRequest('Invalid params');
      await ensureAccountOwner(fastify, p.data.accountId, request.user.id);

      const { error } = await supabase
        .from('newsletter_sources')
        .delete()
        .eq('id', p.data.sourceId)
        .eq('x_account_id', p.data.accountId);

      if (error) throw fastify.httpErrors.internalServerError(error.message);
      return { success: true };
    },
  );
};

export default sourcesRoutes;
