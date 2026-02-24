import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

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
};

export default timelineRoutes;
