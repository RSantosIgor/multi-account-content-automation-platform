import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/accounts/:accountId/stats
  fastify.get<{
    Params: { accountId: string };
    Querystring: { from?: string; to?: string };
  }>('/api/v1/accounts/:accountId/stats', async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { accountId } = request.params;

    // Verify ownership
    const { data: account, error: accountError } = await supabase
      .from('x_accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return reply.code(404).send({ error: 'Account not found' });
    }

    // Validate query params
    const queryResult = querySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply
        .code(400)
        .send({ error: 'Invalid query parameters', details: queryResult.error });
    }

    const { from, to } = queryResult.data;

    // Build date filter for published posts
    let query = supabase
      .from('posts')
      .select('published_at, status')
      .eq('x_account_id', accountId)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: true });

    if (from) {
      query = query.gte('published_at', from);
    }

    if (to) {
      query = query.lte('published_at', to);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      fastify.log.error(postsError);
      return reply.code(500).send({ error: 'Failed to fetch posts' });
    }

    // Group posts by date (YYYY-MM-DD)
    const dailyCounts = new Map<string, number>();

    for (const post of posts) {
      if (!post.published_at) continue;

      const date = new Date(post.published_at).toISOString().split('T')[0]; // YYYY-MM-DD
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    }

    // Convert to array and sort by date
    const dailyPosts = Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate metrics
    const totalPosts = posts.length;

    let avgPerDay = 0;
    let avgPerWeek = 0;
    let avgPerMonth = 0;

    if (totalPosts > 0 && posts.length > 0) {
      const firstDate = new Date(posts[0].published_at!);
      const lastDate = new Date(posts[posts.length - 1].published_at!);
      const daysDiff = Math.max(
        1,
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      avgPerDay = totalPosts / daysDiff;
      avgPerWeek = avgPerDay * 7;
      avgPerMonth = avgPerDay * 30;
    }

    return reply.send({
      data: {
        dailyPosts,
        metrics: {
          totalPosts,
          avgPerDay: Number(avgPerDay.toFixed(2)),
          avgPerWeek: Number(avgPerWeek.toFixed(2)),
          avgPerMonth: Number(avgPerMonth.toFixed(2)),
        },
      },
    });
  });
};
