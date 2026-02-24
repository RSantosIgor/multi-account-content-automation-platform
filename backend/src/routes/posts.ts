import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { XApiClient } from '../services/x-api/client.js';

const paramsSchema = z.object({
  accountId: z.string().uuid(),
});

const createPostSchema = z.object({
  suggestion_id: z.string().uuid().optional(),
  content: z.string().min(1).max(280),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const postRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/v1/accounts/:accountId/posts — Publish to X
  fastify.post(
    '/api/v1/accounts/:accountId/posts',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid account ID');
      }

      const bodyResult = createPostSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw fastify.httpErrors.badRequest('Invalid request body');
      }

      const { accountId } = paramsResult.data;
      const { suggestion_id, content } = bodyResult.data;

      // Verify user owns the account
      const { data: account, error: accountError } = await supabase
        .from('x_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (accountError) {
        throw fastify.httpErrors.internalServerError(accountError.message);
      }
      if (!account) {
        throw fastify.httpErrors.notFound('Account not found');
      }

      // Create X API client and post tweet
      const xApiClient = new XApiClient(account);
      let tweetId: string;
      let tweetUrl: string;
      let errorMessage: string | null = null;

      try {
        const result = await xApiClient.postTweet(content);
        tweetId = result.tweetId;
        tweetUrl = result.tweetUrl;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        fastify.log.error({ error, accountId }, 'Failed to post tweet');

        // Save failed post to database
        const { data: failedPost, error: insertError } = await supabase
          .from('posts')
          .insert({
            x_account_id: accountId,
            ai_suggestion_id: suggestion_id ?? null,
            content,
            status: 'failed',
            error_message: errorMessage,
          })
          .select()
          .single();

        if (insertError) {
          throw fastify.httpErrors.internalServerError(
            `Failed to save post record: ${insertError.message}`,
          );
        }

        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: `Failed to post tweet: ${errorMessage}`,
          data: failedPost,
        });
      }

      // Save successful post to database
      const { data: post, error: insertError } = await supabase
        .from('posts')
        .insert({
          x_account_id: accountId,
          ai_suggestion_id: suggestion_id ?? null,
          content,
          status: 'published',
          x_post_id: tweetId,
          x_post_url: tweetUrl,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw fastify.httpErrors.internalServerError(
          `Failed to save post record: ${insertError.message}`,
        );
      }

      // Update suggestion status if provided
      if (suggestion_id) {
        const { error: updateError } = await supabase
          .from('ai_suggestions')
          .update({ status: 'posted' })
          .eq('id', suggestion_id);

        if (updateError) {
          fastify.log.error(
            { error: updateError, suggestion_id },
            'Failed to update suggestion status',
          );
        }
      }

      return post;
    },
  );

  // GET /api/v1/accounts/:accountId/posts — List post history
  fastify.get(
    '/api/v1/accounts/:accountId/posts',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = paramsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid account ID');
      }

      const queryResult = querySchema.safeParse(request.query);
      if (!queryResult.success) {
        throw fastify.httpErrors.badRequest('Invalid query parameters');
      }

      const { accountId } = paramsResult.data;
      const { page, limit } = queryResult.data;

      // Verify user owns the account
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

      // Fetch posts with pagination
      const offset = (page - 1) * limit;
      const {
        data: posts,
        error: postsError,
        count,
      } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('x_account_id', accountId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) {
        throw fastify.httpErrors.internalServerError(postsError.message);
      }

      return {
        data: posts ?? [],
        pagination: {
          page,
          limit,
          total: count ?? 0,
        },
      };
    },
  );
};

export default postRoutes;
