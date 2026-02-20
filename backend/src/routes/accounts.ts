import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { decrypt } from '../lib/crypto.js';
import { supabase } from '../lib/supabase.js';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type PublicXAccount = {
  id: string;
  xUserId: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  sitesCount: number;
  postsCount: number;
};

function toPublicAccount(
  account: {
    id: string;
    x_user_id: string;
    x_username: string;
    x_display_name: string | null;
    x_profile_image_url: string | null;
    is_active: boolean;
    token_expires_at: string | null;
    created_at: string;
    updated_at: string;
  },
  sitesCount: number,
  postsCount: number,
): PublicXAccount {
  return {
    id: account.id,
    xUserId: account.x_user_id,
    username: account.x_username,
    displayName: account.x_display_name,
    profileImageUrl: account.x_profile_image_url,
    isActive: account.is_active,
    tokenExpiresAt: account.token_expires_at,
    createdAt: account.created_at,
    updatedAt: account.updated_at,
    sitesCount,
    postsCount,
  };
}

function buildBasicAuthHeader(clientId: string, clientSecret: string): string {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${token}`;
}

async function revokeXAccessToken(accessToken: string): Promise<void> {
  const body = new URLSearchParams({
    token: accessToken,
    token_type_hint: 'access_token',
    client_id: config.X_CLIENT_ID,
  });

  const response = await fetch('https://api.x.com/2/oauth2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: buildBasicAuthHeader(config.X_CLIENT_ID, config.X_CLIENT_SECRET),
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to revoke X token: ${response.status}`);
  }
}

const accountsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/v1/accounts', { preHandler: [fastify.authenticate] }, async (request) => {
    const { data: accounts, error } = await supabase
      .from('x_accounts')
      .select(
        'id, x_user_id, x_username, x_display_name, x_profile_image_url, is_active, token_expires_at, created_at, updated_at',
      )
      .eq('user_id', request.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw fastify.httpErrors.internalServerError(error.message);
    }

    const accountIds = (accounts ?? []).map((account) => account.id);
    let siteCountByAccountId = new Map<string, number>();
    let postCountByAccountId = new Map<string, number>();

    if (accountIds.length > 0) {
      const [{ data: sites, error: sitesError }, { data: posts, error: postsError }] =
        await Promise.all([
          supabase.from('news_sites').select('x_account_id').in('x_account_id', accountIds),
          supabase.from('posts').select('x_account_id').in('x_account_id', accountIds),
        ]);

      if (sitesError || postsError) {
        throw fastify.httpErrors.internalServerError(
          sitesError?.message ?? postsError?.message ?? 'Failed to fetch account metrics',
        );
      }

      siteCountByAccountId = (sites ?? []).reduce((acc, site) => {
        const current = acc.get(site.x_account_id) ?? 0;
        acc.set(site.x_account_id, current + 1);
        return acc;
      }, new Map<string, number>());

      postCountByAccountId = (posts ?? []).reduce((acc, post) => {
        const current = acc.get(post.x_account_id) ?? 0;
        acc.set(post.x_account_id, current + 1);
        return acc;
      }, new Map<string, number>());
    }

    const data = (accounts ?? []).map((account) =>
      toPublicAccount(
        account,
        siteCountByAccountId.get(account.id) ?? 0,
        postCountByAccountId.get(account.id) ?? 0,
      ),
    );

    return { data };
  });

  fastify.get('/api/v1/accounts/:id', { preHandler: [fastify.authenticate] }, async (request) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      throw fastify.httpErrors.badRequest('Invalid account id');
    }

    const { data: account, error } = await supabase
      .from('x_accounts')
      .select(
        'id, x_user_id, x_username, x_display_name, x_profile_image_url, is_active, token_expires_at, created_at, updated_at',
      )
      .eq('id', parsed.data.id)
      .eq('user_id', request.user.id)
      .maybeSingle();

    if (error) {
      throw fastify.httpErrors.internalServerError(error.message);
    }

    if (!account) {
      throw fastify.httpErrors.notFound('Account not found');
    }

    const [
      { count: sitesCount, error: sitesCountError },
      { count: postsCount, error: postsCountError },
    ] = await Promise.all([
      supabase
        .from('news_sites')
        .select('id', { count: 'exact', head: true })
        .eq('x_account_id', account.id),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('x_account_id', account.id),
    ]);

    if (sitesCountError || postsCountError) {
      throw fastify.httpErrors.internalServerError(
        sitesCountError?.message ?? postsCountError?.message ?? 'Failed to fetch account metrics',
      );
    }

    return {
      data: toPublicAccount(account, sitesCount ?? 0, postsCount ?? 0),
    };
  });

  fastify.delete(
    '/api/v1/accounts/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = paramsSchema.safeParse(request.params);
      if (!parsed.success) {
        throw fastify.httpErrors.badRequest('Invalid account id');
      }

      const { data: account, error } = await supabase
        .from('x_accounts')
        .select('id, oauth_access_token_enc')
        .eq('id', parsed.data.id)
        .eq('user_id', request.user.id)
        .maybeSingle();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      if (!account) {
        throw fastify.httpErrors.notFound('Account not found');
      }

      try {
        const accessToken = decrypt(account.oauth_access_token_enc);
        await revokeXAccessToken(accessToken);
      } catch (error) {
        request.log.error({ err: error }, 'Failed to revoke X account token');
        throw fastify.httpErrors.badGateway('Failed to revoke X account token');
      }

      const { error: deleteError } = await supabase
        .from('x_accounts')
        .delete()
        .eq('id', account.id)
        .eq('user_id', request.user.id);

      if (deleteError) {
        throw fastify.httpErrors.internalServerError(deleteError.message);
      }

      return reply.status(204).send();
    },
  );
};

export default accountsRoutes;
