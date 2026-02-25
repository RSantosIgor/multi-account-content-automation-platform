import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import type { Json } from '../types/database.js';

const paramsSchema = z.object({
  accountId: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'approved', 'rejected', 'posted', 'published', 'failed']).optional(),
  site_id: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

type TimelineSuggestion = {
  id: string;
  type: 'suggestion';
  status: string;
  createdAt: string;
  articleTitle: string;
  siteId: string;
  siteName: string | null;
  suggestionText: string;
  hashtags: string[];
  articleSummary: Json | null;
};

type TimelinePost = {
  id: string;
  type: 'post';
  status: string;
  createdAt: string;
  publishedAt: string | null;
  content: string;
  xPostUrl: string | null;
  suggestionId: string | null;
  siteId: string | null;
  siteName: string | null;
};

type SuggestionWithRelations = {
  id: string;
  status: string;
  created_at: string;
  suggestion_text: string;
  hashtags: string[] | null;
  article_summary: Json | null;
  scraped_articles?: {
    title: string;
    news_site_id: string;
    news_sites: { name: string } | null;
  };
};

const timelineRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/api/v1/accounts/:accountId/timeline',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const paramsResult = paramsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid account id');
      }

      const queryResult = querySchema.safeParse(request.query);
      if (!queryResult.success) {
        throw fastify.httpErrors.badRequest('Invalid query parameters');
      }

      const { accountId } = paramsResult.data;
      const { page, limit, status, site_id, from, to } = queryResult.data;

      // Ownership check
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

      // Suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('ai_suggestions')
        .select(
          `
            id,
            status,
            created_at,
            suggestion_text,
            hashtags,
            article_summary,
            scraped_articles!ai_suggestions_article_id_fkey (
              title,
              news_site_id,
              news_sites!scraped_articles_news_site_id_fkey ( name )
            )
          `,
        )
        .eq('x_account_id', accountId)
        .order('created_at', { ascending: false });

      if (suggestionsError) {
        throw fastify.httpErrors.internalServerError(suggestionsError.message);
      }

      const suggestions: TimelineSuggestion[] =
        (suggestionsData as SuggestionWithRelations[] | null)?.flatMap((sug) => {
          const article = sug.scraped_articles;
          if (!article) return [];

          const siteName = article.news_sites?.name ?? null;

          return [
            {
              id: sug.id,
              type: 'suggestion',
              status: sug.status,
              createdAt: sug.created_at,
              articleTitle: article.title,
              siteId: article.news_site_id,
              siteName,
              suggestionText: sug.suggestion_text,
              hashtags: sug.hashtags ?? [],
              articleSummary: sug.article_summary,
            },
          ];
        }) ?? [];

      // Posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
            id,
            status,
            created_at,
            published_at,
            content,
            x_post_url,
            ai_suggestion_id
          `,
        )
        .eq('x_account_id', accountId)
        .order('created_at', { ascending: false });

      if (postsError) {
        throw fastify.httpErrors.internalServerError(postsError.message);
      }

      // Map posts to site via suggestion -> article
      let suggestionArticleMap = new Map<string, { siteId: string; siteName: string | null }>();
      for (const sug of suggestions) {
        suggestionArticleMap.set(sug.id, { siteId: sug.siteId, siteName: sug.siteName });
      }

      const posts: TimelinePost[] =
        postsData?.map((post) => {
          const siteInfo = post.ai_suggestion_id
            ? (suggestionArticleMap.get(post.ai_suggestion_id) ?? null)
            : null;

          return {
            id: post.id,
            type: 'post',
            status: post.status,
            createdAt: post.created_at,
            publishedAt: post.published_at,
            content: post.content,
            xPostUrl: post.x_post_url,
            suggestionId: post.ai_suggestion_id,
            siteId: siteInfo?.siteId ?? null,
            siteName: siteInfo?.siteName ?? null,
          };
        }) ?? [];

      // Apply filters
      const filteredSuggestions = suggestions.filter((item) => {
        if (status && item.status !== status) return false;
        if (site_id && item.siteId !== site_id) return false;
        if (from && item.createdAt < from) return false;
        if (to && item.createdAt > to) return false;
        return true;
      });

      const filteredPosts = posts.filter((item) => {
        if (status) {
          const mappedStatus = item.status === 'published' ? 'posted' : item.status; // align wording
          if (mappedStatus !== status) return false;
        }
        if (site_id && item.siteId !== site_id) return false;
        if (from && item.createdAt < from) return false;
        if (to && item.createdAt > to) return false;
        return true;
      });

      // Merge + sort
      const merged = [...filteredSuggestions, ...filteredPosts].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );

      const total = merged.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paged = merged.slice(start, end);

      return {
        data: paged,
        pagination: {
          page,
          limit,
          total,
        },
      };
    },
  );

  // Get timeline item detail (suggestion or post)
  fastify.get(
    '/api/v1/timeline/items/:id',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const itemIdSchema = z.object({
        id: z.string().uuid(),
      });

      const paramsResult = itemIdSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid item id');
      }

      const { id } = paramsResult.data;

      // Try to find as suggestion first
      const { data: suggestion, error: suggestionError } = await supabase
        .from('ai_suggestions')
        .select(
          `
          id,
          article_id,
          x_account_id,
          status,
          suggestion_text,
          hashtags,
          article_summary,
          created_at,
          reviewed_at,
          reviewed_by,
          scraped_articles!ai_suggestions_article_id_fkey (
            id,
            url,
            title,
            summary,
            published_at,
            full_article_content,
            news_site_id,
            news_sites!scraped_articles_news_site_id_fkey ( name, url )
          )
        `,
        )
        .eq('id', id)
        .maybeSingle();

      if (suggestionError) {
        throw fastify.httpErrors.internalServerError(suggestionError.message);
      }

      if (suggestion) {
        // Verify user owns this via account
        const { data: account, error: accountError } = await supabase
          .from('x_accounts')
          .select('id')
          .eq('id', suggestion.x_account_id)
          .eq('user_id', request.user.id)
          .maybeSingle();

        if (accountError || !account) {
          throw fastify.httpErrors.notFound('Item not found');
        }

        // Check if there's a related post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .select(
            'id, content, status, x_post_url, x_post_id, published_at, created_at, error_message',
          )
          .eq('ai_suggestion_id', id)
          .maybeSingle();

        if (postError && postError.code !== 'PGRST116') {
          throw fastify.httpErrors.internalServerError(postError.message);
        }

        return {
          data: {
            type: 'suggestion' as const,
            suggestion: {
              id: suggestion.id,
              articleId: suggestion.article_id,
              xAccountId: suggestion.x_account_id,
              status: suggestion.status,
              suggestionText: suggestion.suggestion_text,
              hashtags: suggestion.hashtags ?? [],
              articleSummary: suggestion.article_summary,
              createdAt: suggestion.created_at,
              reviewedAt: suggestion.reviewed_at,
              reviewedBy: suggestion.reviewed_by,
            },
            article: suggestion.scraped_articles
              ? {
                  id: suggestion.scraped_articles.id,
                  url: suggestion.scraped_articles.url,
                  title: suggestion.scraped_articles.title,
                  summary: suggestion.scraped_articles.summary,
                  publishedAt: suggestion.scraped_articles.published_at,
                  fullContent: suggestion.scraped_articles.full_article_content,
                  site: suggestion.scraped_articles.news_sites
                    ? {
                        id: suggestion.scraped_articles.news_site_id,
                        name: suggestion.scraped_articles.news_sites.name,
                        url: suggestion.scraped_articles.news_sites.url,
                      }
                    : null,
                }
              : null,
            post: post
              ? {
                  id: post.id,
                  content: post.content,
                  status: post.status,
                  xPostUrl: post.x_post_url,
                  xPostId: post.x_post_id,
                  publishedAt: post.published_at,
                  createdAt: post.created_at,
                  errorMessage: post.error_message,
                }
              : null,
          },
        };
      }

      // If not a suggestion, try as a post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(
          'id, content, status, x_post_url, x_post_id, published_at, created_at, error_message, x_account_id, ai_suggestion_id',
        )
        .eq('id', id)
        .maybeSingle();

      if (postError) {
        throw fastify.httpErrors.internalServerError(postError.message);
      }

      if (!post) {
        throw fastify.httpErrors.notFound('Item not found');
      }

      // Verify user owns this via account
      const { data: account, error: accountError } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('id', post.x_account_id)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (accountError || !account) {
        throw fastify.httpErrors.notFound('Item not found');
      }

      return {
        data: {
          type: 'post' as const,
          post: {
            id: post.id,
            content: post.content,
            status: post.status,
            xPostUrl: post.x_post_url,
            xPostId: post.x_post_id,
            publishedAt: post.published_at,
            createdAt: post.created_at,
            errorMessage: post.error_message,
            suggestionId: post.ai_suggestion_id,
          },
          suggestion: null,
          article: null,
        },
      };
    },
  );
};

export default timelineRoutes;
