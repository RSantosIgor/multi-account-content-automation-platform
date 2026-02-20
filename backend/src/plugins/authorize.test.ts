import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import { authorize } from './authorize.js';
import type { FastifyInstance } from 'fastify';

// Mock supabase so authenticate can be overridden
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

describe('authorize', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();

    // Override authenticate to inject a test user (set per test via closure)
    let testUser = { id: 'u1', email: 'test@test.com', role: 'member' as const };

    app.decorate('setTestUser', (user: typeof testUser) => {
      testUser = user;
    });

    // Replace the authenticate decorator with a test version
    app.decorateRequest('user', null);
    app.addHook('preHandler', async (request) => {
      request.user = testUser;
    });

    app.get('/admin-only', { preHandler: [authorize('admin')] }, async (request) => ({
      ok: true,
      user: request.user,
    }));

    app.get('/member-or-admin', { preHandler: [authorize('admin', 'member')] }, async () => ({
      ok: true,
    }));

    await app.ready();
  });

  it('admin can access admin-only route', async () => {
    (
      app as unknown as { setTestUser: (user: { id: string; email: string; role: string }) => void }
    ).setTestUser({
      id: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });

    const res = await app.inject({ method: 'GET', url: '/admin-only' });
    expect(res.statusCode).toBe(200);
  });

  it('member receives 403 on admin-only route', async () => {
    (
      app as unknown as { setTestUser: (user: { id: string; email: string; role: string }) => void }
    ).setTestUser({
      id: 'u2',
      email: 'member@test.com',
      role: 'member',
    });

    const res = await app.inject({ method: 'GET', url: '/admin-only' });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({
      statusCode: 403,
      error: 'Forbidden',
    });
  });

  it('member can access member-or-admin route', async () => {
    (
      app as unknown as { setTestUser: (user: { id: string; email: string; role: string }) => void }
    ).setTestUser({
      id: 'u3',
      email: 'member@test.com',
      role: 'member',
    });

    const res = await app.inject({ method: 'GET', url: '/member-or-admin' });
    expect(res.statusCode).toBe(200);
  });
});
