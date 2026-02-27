/**
 * Diagnóstico do token OAuth da conta X
 *
 * Usage: tsx --env-file=.env src/scripts/test-x-token.ts
 *
 * Testa dois caminhos:
 *   A) TwitterApi direto (como o script de teste original)
 *   B) XApiClient — exatamente como o backend usa em posts.ts
 */

import { TwitterApi } from 'twitter-api-v2';
import { supabase } from '../lib/supabase.js';
import { decrypt } from '../lib/crypto.js';
import { XApiClient } from '../services/x-api/client.js';

async function main() {
  console.log('🔍 Diagnóstico do token X OAuth');
  console.log('='.repeat(50));
  console.log();

  // Buscar conta X ativa — select('*') igual ao posts.ts
  const { data: accounts, error } = await supabase
    .from('x_accounts')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error || !accounts || accounts.length === 0) {
    console.error('❌ Nenhuma conta X ativa encontrada:', error?.message ?? '');
    process.exit(1);
  }

  console.log(`📋 ${accounts.length} conta(s) X ativa(s):\n`);
  for (const account of accounts) {
    const updatedAt = new Date(account.updated_at ?? '').toLocaleString('pt-BR');
    const expiresAtDate = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const now = new Date();
    const minutesLeft = expiresAtDate
      ? Math.round((expiresAtDate.getTime() - now.getTime()) / 60000)
      : null;
    const isExpired = expiresAtDate ? expiresAtDate < now : false;
    const willRefresh = minutesLeft !== null && minutesLeft < 5;
    const expiresLabel = expiresAtDate ? expiresAtDate.toLocaleString('pt-BR') : 'sem expiração';

    console.log(`  @${account.x_username} (id: ${account.id})`);
    console.log(`    Atualizado: ${updatedAt}`);
    console.log(
      `    Expira em : ${expiresLabel} ${
        isExpired
          ? '⚠️  EXPIRADO'
          : willRefresh
            ? `⚠️  ${minutesLeft}min — backend vai fazer REFRESH automático`
            : `✅ (${minutesLeft}min restantes)`
      }`,
    );
    console.log();
  }

  const account = accounts[0]!;
  console.log(`🧪 Testando conta @${account.x_username}...\n`);

  // ── Caminho A: TwitterApi direto (como o script anterior) ─────────────────
  console.log('── Caminho A: TwitterApi direto (sem refresh) ────────────────');
  let accessToken: string;
  try {
    accessToken = decrypt(account.oauth_access_token_enc);
  } catch {
    console.error('❌ Falha ao descriptografar token — ENCRYPTION_KEY pode estar errada');
    process.exit(1);
  }

  const directClient = new TwitterApi(accessToken);

  console.log('1️⃣  GET /2/users/me...');
  try {
    const me = await directClient.v2.me({ 'user.fields': ['username'] });
    console.log(`   ✅ @${me.data.username}`);
  } catch (err: unknown) {
    console.error(`   ❌ ${err instanceof Error ? err.message : String(err)}`);
  }

  const testTextA = `[batchNews A] ${new Date().toISOString()}`;
  console.log(`2️⃣  POST /2/tweets (direto)...`);
  try {
    const tweet = await directClient.v2.tweet(testTextA);
    console.log(`   ✅ Sucesso — https://x.com/${account.x_username}/status/${tweet.data.id}`);
  } catch (err: unknown) {
    console.error(`   ❌ ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log();

  // ── Caminho B: XApiClient (exatamente como posts.ts faz) ──────────────────
  console.log('── Caminho B: XApiClient (igual ao backend/posts.ts) ─────────');
  const xApiClient = new XApiClient(account);

  const testTextB = `[batchNews B] ${new Date().toISOString()}`;
  console.log(`1️⃣  XApiClient.postTweet()...`);
  try {
    const result = await xApiClient.postTweet(testTextB);
    console.log(`   ✅ Sucesso — ${result.tweetUrl}`);
  } catch (err: unknown) {
    console.error(`   ❌ ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log();
  console.log('='.repeat(50));
  console.log('Interpretação:');
  console.log('  A ok, B falha → bug no XApiClient (refresh de token)');
  console.log('  A e B falham  → problema de token/permissão no X');
  console.log('  A e B ok      → problema está em outro lugar no backend');
}

main().catch((err: unknown) => {
  console.error('\n❌ Erro fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
