import { buildApp } from '../../app.js';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

type TestUser = {
  id: string;
  email: string;
  role: 'admin' | 'member';
};

const DEFAULT_USER: TestUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'member',
};

/**
 * Build a Fastify instance for integration testing.
 * Overrides the real `authenticate` plugin with a mock that injects
 * the given test user into `request.user` without requiring a real JWT.
 */
export async function buildTestApp(userOverride?: Partial<TestUser>): Promise<FastifyInstance> {
  const app = await buildApp();
  const user: TestUser = { ...DEFAULT_USER, ...userOverride };

  // Override the authenticate decorator for tests
  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    request.user = user;
  });

  await app.ready();
  return app;
}
