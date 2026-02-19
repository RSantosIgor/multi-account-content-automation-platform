import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';

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

export async function buildTestApp(userOverride?: Partial<TestUser>): Promise<FastifyInstance> {
  const app = await buildApp();
  const user: TestUser = { ...DEFAULT_USER, ...userOverride };

  // Override the authenticate decorator for tests
  app.decorate('authenticate', async (request: Parameters<typeof app.authenticate>[0]) => {
    request.user = user;
  });

  await app.ready();
  return app;
}
