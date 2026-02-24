import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AiSuggestionService } from '../services/ai/suggest.js';

const suggestParamsSchema = z.object({
  articleId: z.string().uuid(),
});

const statusParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

async function ensureArticleBelongsToUser(articleId: string, userId: string): Promise<void> {
  const { data: article, error: articleError } = await supabase
    .from('scraped_articles')
    .select('id, news_site_id')
    .eq('id', articleId)
    .maybeSingle();

  if (articleError) {
    throw new Error(articleError.message);
  }

  if (!article) {
    throw new Error('Article not found');
  }

  const { data: site, error: siteError } = await supabase
    .from('news_sites')
    .select('id, x_account_id')
    .eq('id', article.news_site_id)
    .maybeSingle();

  if (siteError) {
    throw new Error(siteError.message);
  }

  if (!site) {
    throw new Error('Site not found');
  }

  const { data: account, error: accountError } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', site.x_account_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (accountError) {
    throw new Error(accountError.message);
  }

  if (!account) {
    throw new Error('Article not found');
  }
}

async function ensureSuggestionBelongsToUser(suggestionId: string, userId: string): Promise<void> {
  const { data: suggestion, error: suggestionError } = await supabase
    .from('ai_suggestions')
    .select('id, x_account_id')
    .eq('id', suggestionId)
    .maybeSingle();

  if (suggestionError) {
    throw new Error(suggestionError.message);
  }

  if (!suggestion) {
    throw new Error('Suggestion not found');
  }

  const { data: account, error: accountError } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', suggestion.x_account_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (accountError) {
    throw new Error(accountError.message);
  }

  if (!account) {
    throw new Error('Suggestion not found');
  }
}

const aiRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/api/v1/ai/suggest/:articleId',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = suggestParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid article id');
      }

      try {
        await ensureArticleBelongsToUser(paramsResult.data.articleId, request.user.id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw fastify.httpErrors.notFound(error.message);
        }
        throw fastify.httpErrors.internalServerError(
          error instanceof Error ? error.message : 'Failed to validate article ownership',
        );
      }

      try {
        const suggestion = await AiSuggestionService.suggestForArticle(paramsResult.data.articleId);
        return { data: suggestion };
      } catch (error) {
        throw fastify.httpErrors.internalServerError(
          error instanceof Error ? error.message : 'Failed to create suggestion',
        );
      }
    },
  );

  fastify.patch(
    '/api/v1/suggestions/:id/status',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = statusParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid suggestion id');
      }

      const bodyResult = updateStatusSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw fastify.httpErrors.badRequest(bodyResult.error.message);
      }

      try {
        await ensureSuggestionBelongsToUser(paramsResult.data.id, request.user.id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw fastify.httpErrors.notFound(error.message);
        }
        throw fastify.httpErrors.internalServerError(
          error instanceof Error ? error.message : 'Failed to validate suggestion ownership',
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from('ai_suggestions')
        .update({
          status: bodyResult.data.status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: request.user.id,
        })
        .eq('id', paramsResult.data.id)
        .select(
          'id, article_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at',
        )
        .single();

      if (updateError || !updated) {
        throw fastify.httpErrors.internalServerError(
          updateError?.message ?? 'Failed to update suggestion status',
        );
      }

      return {
        data: {
          id: updated.id,
          articleId: updated.article_id,
          xAccountId: updated.x_account_id,
          suggestionText: updated.suggestion_text,
          hashtags: updated.hashtags,
          status: updated.status,
          reviewedAt: updated.reviewed_at,
          reviewedBy: updated.reviewed_by,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        },
      };
    },
  );
};

export default aiRoutes;
