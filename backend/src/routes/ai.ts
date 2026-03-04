import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AiSuggestionService } from '../services/ai/suggest.js';
import { fetchArticleContent } from '../services/scraper/article-fetcher.js';
import { generateArticleSummary } from '../services/ai/summarizer.js';
import { createAiProvider } from '../services/ai/provider.js';
import { buildPublicationPrompt } from '../services/ai/prompt-builder.js';
import {
  buildSystemPrompt,
  buildFullContentUserPrompt,
  parseAiSuggestionResponse,
} from '../services/ai/prompts.js';
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
          'id, article_id, content_item_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at, article_summary',
        )
        .single();

      if (updateError || !updated) {
        throw fastify.httpErrors.internalServerError(
          updateError?.message ?? 'Failed to update suggestion status',
        );
      }

      // SRC-006 / FLOW-004: On approval → fetch full content from content_items (or scraped_articles fallback)
      if (bodyResult.data.status === 'approved') {
        try {
          const { data: xAccount } = await supabase
            .from('x_accounts')
            .select('language')
            .eq('id', updated.x_account_id)
            .maybeSingle();
          const language = xAccount?.language ?? 'pt-BR';

          // Resolve content source: prefer content_items, fallback to scraped_articles
          let sourceTitle = '';
          let sourceSummary: string | null = null;
          let sourceUrl = '';
          let cachedContent: string | null = null;
          let articleId: string | null = updated.article_id;
          let contentItemId: string | null = updated.content_item_id;

          if (contentItemId) {
            const { data: ci } = await supabase
              .from('content_items')
              .select('id, url, title, summary, full_content')
              .eq('id', contentItemId)
              .maybeSingle();

            if (ci) {
              sourceTitle = ci.title;
              sourceSummary = ci.summary;
              sourceUrl = ci.url;
              cachedContent = ci.full_content;
            }
          }

          // Fallback to scraped_articles (backward compat for older suggestions)
          if (!sourceUrl && articleId) {
            const { data: article } = await supabase
              .from('scraped_articles')
              .select('id, url, title, summary, full_article_content')
              .eq('id', articleId)
              .maybeSingle();

            if (article) {
              sourceTitle = article.title;
              sourceSummary = article.summary;
              sourceUrl = article.url;
              cachedContent = article.full_article_content;
            }
          }

          if (!sourceUrl) throw new Error('Content source not found');

          // Step 1: Fetch full content (or reuse cache)
          let content = cachedContent;
          if (!content) {
            try {
              const fetched = await fetchArticleContent(sourceUrl);
              content = fetched.content;

              if (articleId) {
                await supabase
                  .from('scraped_articles')
                  .update({ full_article_content: content })
                  .eq('id', articleId);
              }
              if (contentItemId) {
                await supabase
                  .from('content_items')
                  .update({ full_content: content })
                  .eq('id', contentItemId);
              }
            } catch (fetchError) {
              console.error('[AI Routes] Failed to fetch content:', fetchError);
              content = sourceSummary ?? sourceTitle;
            }
          }

          const aiProvider = createAiProvider();

          // Step 2: Generate tweet
          const publicationPrompt = await buildPublicationPrompt(
            updated.x_account_id,
            buildSystemPrompt(language),
          );
          const rawTweet = await aiProvider.generateRaw(
            publicationPrompt,
            buildFullContentUserPrompt(sourceTitle, content, sourceSummary ?? undefined),
          );
          const tweetResult = parseAiSuggestionResponse(rawTweet);

          if (tweetResult.ok) {
            updated.suggestion_text = tweetResult.data.text;
            updated.hashtags = tweetResult.data.hashtags;
          }

          // Step 3: Generate content summary
          const summary = await generateArticleSummary(aiProvider, sourceTitle, content);
          updated.article_summary = summary as unknown as Json;

          // Step 4: Persist tweet + summary + mark processed
          await supabase
            .from('ai_suggestions')
            .update({
              suggestion_text: updated.suggestion_text,
              hashtags: updated.hashtags,
              article_summary: summary as unknown as Json,
            })
            .eq('id', updated.id);

          if (articleId) {
            await supabase
              .from('scraped_articles')
              .update({ is_processed: true })
              .eq('id', articleId);
          }
          if (contentItemId) {
            await supabase
              .from('content_items')
              .update({ is_processed: true })
              .eq('id', contentItemId);
          }
        } catch (error) {
          console.error('[AI Routes] Approval generation failed:', error);
        }
      }

      // On rejection, mark both sources as processed
      if (bodyResult.data.status === 'rejected') {
        if (updated.article_id) {
          await supabase
            .from('scraped_articles')
            .update({ is_processed: true })
            .eq('id', updated.article_id);
        }
        if (updated.content_item_id) {
          await supabase
            .from('content_items')
            .update({ is_processed: true })
            .eq('id', updated.content_item_id);
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
