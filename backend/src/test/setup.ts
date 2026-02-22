import { vi } from 'vitest';

// Set required env vars for config.ts to parse without throwing
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['FRONTEND_URL'] = 'http://localhost:3000';
process.env['SUPABASE_URL'] = 'https://test.supabase.co';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';
process.env['ENCRYPTION_KEY'] = 'a'.repeat(64);
process.env['X_CLIENT_ID'] = 'test-client-id';
process.env['X_CLIENT_SECRET'] = 'test-client-secret';
process.env['X_CALLBACK_URL'] = 'http://localhost:3001/api/v1/x/oauth/callback';
process.env['AI_PROVIDER'] = 'openai';
process.env['OPENAI_API_KEY'] = 'sk-test';
process.env['DEEPSEEK_API_KEY'] = 'sk-deepseek-test';
process.env['CRON_SECRET'] = 'test-cron-secret';

// Silence logger output during tests
vi.mock('pino-pretty', () => ({ default: () => process.stdout }));
