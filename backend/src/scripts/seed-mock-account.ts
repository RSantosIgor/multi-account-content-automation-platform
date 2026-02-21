/**
 * Seed script: creates a mock X Account for the first authenticated user.
 *
 * Usage:
 *   pnpm --filter backend seed
 *
 * This allows testing sites CRUD without a real X OAuth flow.
 */

import { createClient } from '@supabase/supabase-js';
import { createCipheriv, randomBytes } from 'node:crypto';

// Load env vars directly since this script runs standalone
const SUPABASE_URL = process.env['SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;
const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY']!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ENCRYPTION_KEY) {
  console.error(
    'Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENCRYPTION_KEY',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

async function main() {
  // 1. Get all users from Supabase Auth
  const {
    data: { users },
    error: usersError,
  } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('Failed to list users:', usersError.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error('No users found. Register a user first at http://localhost:3000/register');
    process.exit(1);
  }

  const user = users[0]!;
  console.warn(`Found user: ${user.email} (${user.id})`);

  // 2. Check if a mock account already exists
  const { data: existing } = await supabase
    .from('x_accounts')
    .select('id, x_username')
    .eq('user_id', user.id)
    .eq('x_user_id', 'mock_12345');

  if (existing && existing.length > 0) {
    const found = existing[0]!;
    console.warn(`Mock account already exists: @${found.x_username} (${found.id})`);
    console.warn(`\nUse this account ID to test sites: ${found.id}`);
    console.warn(`  http://localhost:3000/accounts/${found.id}/sites`);
    return;
  }

  // 3. Insert mock X account
  const { data: account, error: insertError } = await supabase
    .from('x_accounts')
    .insert({
      user_id: user.id,
      x_user_id: 'mock_12345',
      x_username: 'batchnews_test',
      x_display_name: 'batchNews Test Account',
      x_profile_image_url: null,
      oauth_access_token_enc: encrypt('mock-access-token'),
      oauth_refresh_token_enc: encrypt('mock-refresh-token'),
      token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert mock account:', insertError.message);
    process.exit(1);
  }

  console.warn(`\nMock X account created successfully!`);
  console.warn(`  Username: @batchnews_test`);
  console.warn(`  Account ID: ${account.id}`);
  console.warn(`\nYou can now test sites at:`);
  console.warn(`  http://localhost:3000/accounts/${account.id}/sites`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
