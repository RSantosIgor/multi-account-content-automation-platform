import type { FastifyPluginAsync } from 'fastify';
import accountsRoutes from './accounts.js';
import adminRoutes from './admin.js';
import aiRoutes from './ai.js';
import sourcesRoutes from './sources.js';
import timelineRoutes from './timeline.js';
import postsRoutes from './posts.js';
import promptRulesRoutes from './prompt-rules.js';
import { statsRoutes } from './stats.js';
import xOAuthRoutes from './x-oauth.js';
import editorialRoutes from './editorial.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(xOAuthRoutes);
  await fastify.register(accountsRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(aiRoutes);
  await fastify.register(sourcesRoutes);
  await fastify.register(timelineRoutes);
  await fastify.register(postsRoutes);
  await fastify.register(promptRulesRoutes);
  await fastify.register(statsRoutes);
  await fastify.register(editorialRoutes);
};

export default routes;
