import type { FastifyPluginAsync } from 'fastify';
import accountsRoutes from './accounts.js';
import sitesRoutes from './sites.js';
import scrapeRoutes from './scrape.js';
import xOAuthRoutes from './x-oauth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(xOAuthRoutes);
  await fastify.register(accountsRoutes);
  await fastify.register(sitesRoutes);
  await fastify.register(scrapeRoutes);
};

export default routes;
