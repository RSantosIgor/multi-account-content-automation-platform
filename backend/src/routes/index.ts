import type { FastifyPluginAsync } from 'fastify';
import accountsRoutes from './accounts.js';
import adminRoutes from './admin.js';
import aiRoutes from './ai.js';
import sitesRoutes from './sites.js';
import scrapeRoutes from './scrape.js';
import timelineRoutes from './timeline.js';
import postsRoutes from './posts.js';
import xOAuthRoutes from './x-oauth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(xOAuthRoutes);
  await fastify.register(accountsRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(aiRoutes);
  await fastify.register(sitesRoutes);
  await fastify.register(scrapeRoutes);
  await fastify.register(timelineRoutes);
  await fastify.register(postsRoutes);
};

export default routes;
