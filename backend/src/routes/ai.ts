import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AiSuggestionService } from '../services/ai/suggest.js';
import { fetchArticleContent } from '../services/scraper/article-fetcher.js';
import { generateArticleSummary } from '../services/ai/summarizer.js';
import { createAiProvider } from '../services/ai/provider.js';
import type { Json } from '../types/database.js';

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

      // Update suggestion status
      const { data: updated, error: updateError } = await supabase
        .from('ai_suggestions')
        .update({
          status: bodyResult.data.status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: request.user.id,
        })
        .eq('id', paramsResult.data.id)
        .select(
          'id, article_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at, article_summary',
        )
        .single();

      if (updateError || !updated) {
        throw fastify.httpErrors.internalServerError(
          updateError?.message ?? 'Failed to update suggestion status',
        );
      }

      // If approved and no article_summary yet, generate it
      if (bodyResult.data.status === 'approved' && !updated.article_summary) {
        try {
          // Fetch article details
          const { data: article, error: articleError } = await supabase
            .from('scraped_articles')
            .select('id, url, title, full_article_content')
            .eq('id', updated.article_id)
            .single();

          if (!articleError && article) {
            let content = article.full_article_content;

            // If no cached content, fetch it
            if (!content) {
              try {
                const fetched = await fetchArticleContent(article.url);
                content = fetched.content;

                // Cache the full content
                await supabase
                  .from('scraped_articles')
                  .update({ full_article_content: content })
                  .eq('id', article.id);
              } catch (fetchError) {
                console.error('[AI Routes] Failed to fetch article content:', fetchError);
                // Continue with title as fallback
                content = article.title;
              }
            }

            // Generate summary
            const aiProvider = createAiProvider();
            const summary = await generateArticleSummary(aiProvider, article.title, content);

            // Update suggestion with summary (cast to Json type for Supabase)
            await supabase
              .from('ai_suggestions')
              .update({ article_summary: summary as unknown as Json })
              .eq('id', updated.id);

            // Add summary to response
            (updated as typeof updated & { article_summary: Json | null }).article_summary =
              summary as unknown as Json;
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error('[AI Routes] Failed to generate article summary:', error);
        }
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
          articleSummary: updated.article_summary,
        },
      };
    },
  );
};

export default aiRoutes;
