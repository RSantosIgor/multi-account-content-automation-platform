/**
 * Editorial Routes (EDT-005, EDT-009)
 *
 * CRUD for editorial briefs. Briefs are generated automatically by BriefGenerator,
 * and EDT-009 auto-generates suggestions for each angle on brief creation.
 * Users can list, view, approve, dismiss briefs, and manually re-generate if needed.
 *
 * Routes:
 *   GET    /api/v1/accounts/:accountId/editorial/briefs
 *   GET    /api/v1/accounts/:accountId/editorial/briefs/:briefId
 *   PATCH  /api/v1/accounts/:accountId/editorial/briefs/:briefId
 *   POST   /api/v1/accounts/:accountId/editorial/briefs/:briefId/generate
 */

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { ContextualGeneratorService } from '../services/editorial/contextual-generator.js';
import { EditorialClusterer } from '../services/editorial/clusterer.js';
import { BriefGenerator } from '../services/editorial/brief-generator.js';
import { ContentTagger } from '../services/editorial/tagger.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function verifyAccountOwnership(userId: string, accountId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();
  return !error && !!data;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const accountParamsSchema = z.object({ accountId: z.string().uuid() });
const briefParamsSchema = z.object({
  accountId: z.string().uuid(),
  briefId: z.string().uuid(),
});

const listQuerySchema = z.object({
  status: z.enum(['draft', 'approved', 'used', 'dismissed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const patchBriefSchema = z.object({
  status: z.enum(['approved', 'dismissed']).optional(),
  selected_angle: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const editorialRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /briefs ─────────────────────────────────────────────────────────
  fastify.get(
    '/api/v1/accounts/:accountId/editorial/briefs',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = accountParamsSchema.safeParse(request.params);
      if (!params.success) return reply.badRequest('Invalid account ID');

      const query = listQuerySchema.safeParse(request.query);
      if (!query.success) return reply.badRequest('Invalid query parameters');

      const { accountId } = params.data;
      const { status, page, limit } = query.data;

      if (!(await verifyAccountOwnership(request.user.id, accountId))) {
        return reply.notFound('Account not found');
      }

      let q = supabase
        .from('editorial_briefs')
        .select(
          `
          id,
          brief_text,
          suggested_angles,
          selected_angle,
          status,
          created_at,
          updated_at,
          editorial_clusters (
            id,
            topic,
            tags,
            trend_score,
            item_count,
            source_type_count,
            time_window_start,
            time_window_end
          ),
          ai_suggestions (
            id,
            suggestion_text,
            hashtags,
            status
          )
        `,
          { count: 'exact' },
        )
        .eq('x_account_id', accountId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) q = q.eq('status', status);

      const { data, error, count } = await q;
      if (error) return reply.internalServerError(error.message);

      return {
        data,
        pagination: { page, limit, total: count ?? 0 },
      };
    },
  );

  // ── GET /briefs/:briefId ─────────────────────────────────────────────────
  fastify.get(
    '/api/v1/accounts/:accountId/editorial/briefs/:briefId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = briefParamsSchema.safeParse(request.params);
      if (!params.success) return reply.badRequest('Invalid parameters');

      const { accountId, briefId } = params.data;

      if (!(await verifyAccountOwnership(request.user.id, accountId))) {
        return reply.notFound('Account not found');
      }

      const { data: brief, error } = await supabase
        .from('editorial_briefs')
        .select(
          `
          id,
          brief_text,
          suggested_angles,
          selected_angle,
          status,
          created_at,
          updated_at,
          editorial_clusters (
            id,
            topic,
            tags,
            trend_score,
            item_count,
            source_type_count,
            time_window_start,
            time_window_end,
            cluster_items (
              content_item_id,
              relevance_score,
              content_items (
                id,
                title,
                summary,
                source_type,
                url,
                published_at
              )
            )
          ),
          ai_suggestions (
            id,
            suggestion_text,
            hashtags,
            status,
            article_summary,
            created_at
          )
        `,
        )
        .eq('id', briefId)
        .eq('x_account_id', accountId)
        .maybeSingle();

      if (error) return reply.internalServerError(error.message);
      if (!brief) return reply.notFound('Brief not found');

      return { data: brief };
    },
  );

  // ── PATCH /briefs/:briefId ───────────────────────────────────────────────
  fastify.patch(
    '/api/v1/accounts/:accountId/editorial/briefs/:briefId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = briefParamsSchema.safeParse(request.params);
      if (!params.success) return reply.badRequest('Invalid parameters');

      const body = patchBriefSchema.safeParse(request.body);
      if (!body.success) return reply.badRequest('Invalid body');

      const { accountId, briefId } = params.data;

      if (!(await verifyAccountOwnership(request.user.id, accountId))) {
        return reply.notFound('Account not found');
      }

      // Build update payload
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.data.status) updates.status = body.data.status;
      if (body.data.selected_angle) updates.selected_angle = body.data.selected_angle;

      const { data, error } = await supabase
        .from('editorial_briefs')
        .update(updates)
        .eq('id', briefId)
        .eq('x_account_id', accountId)
        .select()
        .maybeSingle();

      if (error) return reply.internalServerError(error.message);
      if (!data) return reply.notFound('Brief not found');

      return { data };
    },
  );

  // ── POST /briefs/:briefId/generate ──────────────────────────────────────
  // Manual re-generation endpoint. EDT-009 auto-generates on brief creation,
  // but this endpoint remains for manually re-generating a specific angle.
  fastify.post(
    '/api/v1/accounts/:accountId/editorial/briefs/:briefId/generate',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = briefParamsSchema.safeParse(request.params);
      if (!params.success) return reply.badRequest('Invalid parameters');

      const bodySchema = z.object({ angle: z.string().min(1).optional() });
      const body = bodySchema.safeParse(request.body ?? {});

      const { accountId, briefId } = params.data;

      if (!(await verifyAccountOwnership(request.user.id, accountId))) {
        return reply.notFound('Account not found');
      }

      // Fetch brief to determine the selected angle
      const { data: brief, error: briefError } = await supabase
        .from('editorial_briefs')
        .select('selected_angle, suggested_angles, status')
        .eq('id', briefId)
        .eq('x_account_id', accountId)
        .maybeSingle();

      if (briefError) return reply.internalServerError(briefError.message);
      if (!brief) return reply.notFound('Brief not found');

      // Determine angle: body.angle → selected_angle → first suggested angle
      const selectedAngle =
        body.data?.angle ||
        brief.selected_angle ||
        (() => {
          const angles = brief.suggested_angles as { angle: string; rationale: string }[];
          return angles?.[0]?.angle ?? '';
        })();

      try {
        const suggestion = await ContextualGeneratorService.generateFromBrief(
          briefId,
          selectedAngle,
          accountId,
        );
        return { data: suggestion };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Generation failed';
        return reply.internalServerError(msg);
      }
    },
  );
  // ── POST /run ────────────────────────────────────────────────────────────
  // Manually triggers the full clustering → brief → suggestion pipeline for an account.
  fastify.post(
    '/api/v1/accounts/:accountId/editorial/run',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = accountParamsSchema.safeParse(request.params);
      if (!params.success) return reply.badRequest('Invalid account ID');

      const { accountId } = params.data;

      if (!(await verifyAccountOwnership(request.user.id, accountId))) {
        return reply.notFound('Account not found');
      }

      // Step 1: tag untagged items within the clustering window only (48h, max 30 per run)
      const itemsTagged = await ContentTagger.tagUntaggedItems(accountId, {
        windowHours: EditorialClusterer.WINDOW_HOURS,
        batchSize: 30,
      });

      // Step 2: detect clusters from tagged items
      await EditorialClusterer.detectClusters(accountId);

      // Step 3: generate briefs + suggestions for new clusters
      const briefsGenerated = await BriefGenerator.processDetectedClusters(accountId);

      return { data: { itemsTagged, briefsGenerated } };
    },
  );
};

export default editorialRoutes;
