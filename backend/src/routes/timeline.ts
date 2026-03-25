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
  source_type: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

type TimelineSuggestion = {
  id: string;
  type: 'suggestion';
  status: string;
  createdAt: string;
  articleTitle: string;
  sourceType: string;
  sourceName: string | null;
  suggestionText: string | null;
  hashtags: string[];
  articleSummary: Json | null;
  editorialBriefId: string | null;
  sourceContentIds: string[];
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
  sourceName: string | null;
};

type SuggestionRow = {
  id: string;
  status: string;
  created_at: string;
  suggestion_text: string | null;
  hashtags: string[] | null;
  article_summary: Json | null;
  content_item_id: string | null;
  editorial_brief_id: string | null;
  source_content_ids: string[] | null;
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
      const { page, limit, status, source_type, from, to } = queryResult.data;

      // Ownership check
      const { data: account, error: accountError } = await supabase
        .from('x_accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (accountError) throw fastify.httpErrors.internalServerError(accountError.message);
      if (!account) throw fastify.httpErrors.notFound('Account not found');

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
          content_item_id,
          editorial_brief_id,
          source_content_ids
        `,
        )
        .eq('x_account_id', accountId)
        .order('created_at', { ascending: false });

      if (suggestionsError) {
        throw fastify.httpErrors.internalServerError(suggestionsError.message);
      }

      // Fetch content_items for all suggestions
      const contentItemIds =
        (suggestionsData as SuggestionRow[] | null)
          ?.map((s) => s.content_item_id)
          .filter((id): id is string => !!id) ?? [];

      const contentItemsMap = new Map<
        string,
        { title: string; source_type: string; metadata: Json }
      >();
      if (contentItemIds.length > 0) {
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('id, title, source_type, metadata')
          .in('id', contentItemIds);
        for (const ci of contentItems ?? []) {
          contentItemsMap.set(ci.id, {
            title: ci.title,
            source_type: ci.source_type,
            metadata: ci.metadata,
          });
        }
      }

      // Fetch editorial brief cluster topics
      const editorialBriefIds =
        (suggestionsData as SuggestionRow[] | null)
          ?.filter((s) => s.editorial_brief_id && !s.content_item_id)
          .map((s) => s.editorial_brief_id as string) ?? [];

      const editorialTopicMap = new Map<string, string>();
      if (editorialBriefIds.length > 0) {
        const { data: briefs } = await supabase
          .from('editorial_briefs')
          .select('id, editorial_clusters(topic)')
          .in('id', editorialBriefIds);
        for (const b of briefs ?? []) {
          const cluster = b.editorial_clusters as { topic: string } | null;
          if (cluster?.topic) editorialTopicMap.set(b.id, cluster.topic);
        }
      }

      const suggestions: TimelineSuggestion[] =
        (suggestionsData as SuggestionRow[] | null)?.flatMap((sug) => {
          const contentItem = sug.content_item_id
            ? (contentItemsMap.get(sug.content_item_id) ?? null)
            : null;
          const isEditorial = !!sug.editorial_brief_id;

          if (!contentItem && !isEditorial) return [];

          const title =
            contentItem?.title ??
            (isEditorial ? (editorialTopicMap.get(sug.editorial_brief_id!) ?? 'Editorial') : '');

          const sourceType = isEditorial
            ? 'editorial'
            : (contentItem?.source_type ?? 'news_article');

          // Extract source name from content_item metadata
          const metadata = contentItem?.metadata as Record<string, unknown> | null;
          const sourceName =
            (metadata?.siteName as string) ?? (metadata?.channelTitle as string) ?? null;

          return [
            {
              id: sug.id,
              type: 'suggestion',
              status: sug.status,
              createdAt: sug.created_at,
              articleTitle: title,
              sourceType,
              sourceName,
              suggestionText: sug.suggestion_text,
              hashtags: sug.hashtags ?? [],
              articleSummary: sug.article_summary,
              editorialBriefId: sug.editorial_brief_id ?? null,
              sourceContentIds: sug.source_content_ids ?? [],
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

      if (postsError) throw fastify.httpErrors.internalServerError(postsError.message);

      // Map posts to source via suggestion
      const suggestionSourceMap = new Map<string, { sourceName: string | null }>();
      for (const sug of suggestions) {
        suggestionSourceMap.set(sug.id, { sourceName: sug.sourceName });
      }

      const posts: TimelinePost[] =
        postsData?.map((post) => {
          const sourceInfo = post.ai_suggestion_id
            ? (suggestionSourceMap.get(post.ai_suggestion_id) ?? null)
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
            sourceName: sourceInfo?.sourceName ?? null,
          };
        }) ?? [];

      // Apply filters
      const filteredSuggestions = suggestions.filter((item) => {
        if (status && item.status !== status) return false;
        if (source_type && item.sourceType !== source_type) return false;
        if (from && item.createdAt < from) return false;
        if (to && item.createdAt > to) return false;
        return true;
      });

      const filteredPosts = posts.filter((item) => {
        if (status) {
          const mappedStatus = item.status === 'published' ? 'posted' : item.status;
          if (mappedStatus !== status) return false;
        }
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
        pagination: { page, limit, total },
      };
    },
  );

  // Get timeline item detail
  fastify.get(
    '/api/v1/timeline/items/:id',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const itemIdSchema = z.object({ id: z.string().uuid() });
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
          content_item_id,
          x_account_id,
          status,
          suggestion_text,
          hashtags,
          article_summary,
          created_at,
          reviewed_at,
          reviewed_by,
          editorial_brief_id,
          source_content_ids
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

        // Fetch content_item
        let contentItem: {
          id: string;
          url: string;
          title: string;
          summary: string | null;
          full_content: string | null;
          source_type: string;
          metadata: Json;
          published_at: string | null;
        } | null = null;

        if (suggestion.content_item_id) {
          const { data: ci } = await supabase
            .from('content_items')
            .select('id, url, title, summary, full_content, source_type, metadata, published_at')
            .eq('id', suggestion.content_item_id)
            .maybeSingle();
          contentItem = ci;
        }

        // Check for related post
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

        const metadata = contentItem?.metadata as Record<string, unknown> | null;

        return {
          data: {
            type: 'suggestion' as const,
            suggestion: {
              id: suggestion.id,
              contentItemId: suggestion.content_item_id,
              xAccountId: suggestion.x_account_id,
              status: suggestion.status,
              suggestionText: suggestion.suggestion_text,
              hashtags: suggestion.hashtags ?? [],
              articleSummary: suggestion.article_summary,
              sourceType: contentItem?.source_type ?? 'editorial',
              sourceMetadata: contentItem?.metadata ?? null,
              editorialBriefId: suggestion.editorial_brief_id ?? null,
              sourceContentIds: suggestion.source_content_ids ?? [],
              createdAt: suggestion.created_at,
              reviewedAt: suggestion.reviewed_at,
              reviewedBy: suggestion.reviewed_by,
            },
            article: contentItem
              ? {
                  id: contentItem.id,
                  url: contentItem.url,
                  title: contentItem.title,
                  summary: contentItem.summary,
                  publishedAt: contentItem.published_at,
                  fullContent: contentItem.full_content,
                  sourceName:
                    (metadata?.siteName as string) ?? (metadata?.channelTitle as string) ?? null,
                  sourceUrl: (metadata?.siteUrl as string) ?? null,
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

      if (postError) throw fastify.httpErrors.internalServerError(postError.message);
      if (!post) throw fastify.httpErrors.notFound('Item not found');

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
