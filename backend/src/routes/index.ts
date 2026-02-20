import type { FastifyPluginAsync } from 'fastify';
import accountsRoutes from './accounts.js';
import xOAuthRoutes from './x-oauth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(xOAuthRoutes);
  await fastify.register(accountsRoutes);
};

export default routes;
