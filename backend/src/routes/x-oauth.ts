import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { XOAuthService } from '../services/x-api/oauth.js';

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().uuid(),
});

const xOAuthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/v1/x/oauth/start', { preHandler: [fastify.authenticate] }, async (request) => {
    const authorizationUrl = await XOAuthService.createAuthorizationUrl(request.user.id);
    return {
      data: { authorizationUrl },
      message: 'X OAuth URL generated successfully',
    };
  });

  fastify.get('/api/v1/x/oauth/callback', async (request, reply) => {
    const parsed = callbackQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw fastify.httpErrors.badRequest('Invalid callback query parameters');
    }

    try {
      await XOAuthService.handleCallback(parsed.data.code, parsed.data.state);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_OAUTH_STATE' || error.message === 'EXPIRED_OAUTH_STATE') {
          throw fastify.httpErrors.badRequest('OAuth state is invalid or expired');
        }
      }

      request.log.error({ err: error }, 'X OAuth callback failed');
      throw fastify.httpErrors.internalServerError('Failed to complete X OAuth callback');
    }

    return reply.redirect(`${config.FRONTEND_URL}/dashboard?x_oauth=success`);
  });
};

export default xOAuthRoutes;
