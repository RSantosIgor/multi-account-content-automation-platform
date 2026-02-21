import type { FastifyPluginAsync } from 'fastify';
import accountsRoutes from './accounts.js';
import sitesRoutes from './sites.js';
import xOAuthRoutes from './x-oauth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(xOAuthRoutes);
  await fastify.register(accountsRoutes);
  await fastify.register(sitesRoutes);
};

export default routes;
