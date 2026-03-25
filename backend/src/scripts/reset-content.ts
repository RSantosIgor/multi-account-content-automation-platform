/**
 * reset-content.ts
 *
 * Apaga todos os dados de fluxo de notícias (content_items, tags, clusters,
 * briefs, sugestões, posts). Preserva: x_accounts, user_profiles, user_roles,
 * todas as *_sources, prompt_rules.
 *
 * Uso:
 *   pnpm --filter backend exec tsx --env-file=.env src/scripts/reset-content.ts
 *
 * ⚠️  IRREVERSÍVEL — use apenas em desenvolvimento.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Tables deleted in order (children before parents to satisfy FK constraints)
const TABLES = [
  'posts', // FK → ai_suggestions
  'ai_suggestions', // FK → content_items, editorial_briefs
  'cluster_items', // FK → editorial_clusters, content_items
  'editorial_briefs', // FK → editorial_clusters
  'editorial_clusters', // FK → x_accounts
  'content_tags', // FK → content_items
  'content_items', // FK → x_accounts, *_sources
] as const;

async function resetTable(table: string): Promise<number> {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .not('id', 'is', null);

  if (error) {
    throw new Error(`[${table}] Delete failed: ${error.message}`);
  }
  return count ?? 0;
}

async function main() {
  console.log('⚠️  Resetting all content data...\n');

  let totalDeleted = 0;

  for (const table of TABLES) {
    try {
      const deleted = await resetTable(table);
      console.log(`  ✓  ${table.padEnd(24)} ${deleted} rows deleted`);
      totalDeleted += deleted;
    } catch (err) {
      console.error(`  ✗  ${table}:`, err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }

  console.log(`\nDone. ${totalDeleted} total rows deleted.`);
  console.log('Accounts, sources, and prompt rules were NOT touched.');
}

main();
