/**
 * Test script: Metropoles.com scrape + AI analysis
 *
 * Usage: tsx --env-file=.env src/scripts/test-metropoles.ts
 *
 * This script:
 * 1. Finds the first active X account in the DB
 * 2. Creates (or reuses) a news site for metropoles.com
 * 3. Scrapes the RSS feed (limited to 5 articles)
 * 4. Inserts new articles into the DB
 * 5. Runs AI analysis → creates pending suggestions for eligible articles
 * 6. Reports the results
 *
 * Prerequisites: migrations 014 and 015 must be applied.
 */

import { supabase } from '../lib/supabase.js';
import { scrapeRss } from '../services/scraper/rss.js';
import { AiSuggestionService } from '../services/ai/suggest.js';

const FEED_URL = 'https://www.metropoles.com/feed';
const SITE_URL = 'https://www.metropoles.com';
const SITE_NAME = 'Metrópoles [TEST]';
const MAX_ARTICLES = 5;

async function main() {
  console.log('🧪 Teste Metrópoles — scrape + análise IA');
  console.log('='.repeat(50));
  console.log();

  // ── Step 1: Find an active X account ─────────────────────────────────────
  const { data: accounts, error: accountsError } = await supabase
    .from('x_accounts')
    .select('id, x_username')
    .eq('is_active', true)
    .limit(1);

  if (accountsError || !accounts || accounts.length === 0) {
    console.error('❌ Nenhuma conta X ativa encontrada no banco.', accountsError?.message ?? '');
    console.error('   Conecte uma conta X antes de rodar este script.');
    process.exit(1);
  }

  const account = accounts[0];
  console.log(`✅ Conta X: @${account.x_username}`);
  console.log();

  // ── Step 2: Create or reuse site ─────────────────────────────────────────
  const { data: existingSite } = await supabase
    .from('news_sites')
    .select('id, name')
    .eq('x_account_id', account.id)
    .eq('url', SITE_URL)
    .maybeSingle();

  let siteId: string;

  if (existingSite) {
    siteId = existingSite.id;
    console.log(`ℹ️  Site já existe: "${existingSite.name}" (${siteId})`);
  } else {
    const { data: newSite, error: siteError } = await supabase
      .from('news_sites')
      .insert({
        x_account_id: account.id,
        name: SITE_NAME,
        url: SITE_URL,
        feed_url: FEED_URL,
        source_type: 'rss',
        scraping_interval_hours: 4,
        auto_flow: false,
        is_active: true,
      })
      .select('id')
      .single();

    if (siteError || !newSite) {
      console.error('❌ Erro ao criar site:', siteError?.message);
      console.error('   Verifique se as migrações 014 e 015 foram aplicadas ao Supabase.');
      process.exit(1);
    }

    siteId = newSite.id;
    console.log(`✅ Site criado: "${SITE_NAME}" (${siteId})`);
  }

  console.log();

  // ── Step 3: Scrape RSS feed ───────────────────────────────────────────────
  console.log(`📡 Scraping RSS: ${FEED_URL}`);
  const articles = await scrapeRss(FEED_URL, MAX_ARTICLES);

  if (articles.length === 0) {
    console.error('❌ Nenhum artigo encontrado no feed.');
    process.exit(1);
  }

  console.log(`✅ ${articles.length} artigo(s) encontrado(s):`);
  articles.forEach((a, i) => {
    const title = a.title.length > 70 ? a.title.slice(0, 70) + '…' : a.title;
    console.log(`   ${i + 1}. ${title}`);
  });
  console.log();

  // ── Step 4: Insert articles ───────────────────────────────────────────────
  const rows = articles.map((a) => ({
    news_site_id: siteId,
    url: a.url,
    title: a.title,
    summary: a.summary,
    published_at: a.published_at,
    is_processed: false,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('scraped_articles')
    .upsert(rows, { onConflict: 'news_site_id,url', ignoreDuplicates: true })
    .select('id');

  if (insertError) {
    console.error('❌ Erro ao inserir artigos:', insertError.message);
    process.exit(1);
  }

  const newCount = inserted?.length ?? 0;
  if (newCount > 0) {
    console.log(`💾 ${newCount} artigo(s) novo(s) inserido(s) no banco`);
  } else {
    console.log('ℹ️  Todos os artigos já existiam — verificando não analisados...');
  }
  console.log();

  // ── Step 5: AI analysis ───────────────────────────────────────────────────
  console.log('🤖 Rodando análise IA (título + resumo)...');
  const result = await AiSuggestionService.processNewArticles(account.id);

  console.log();
  console.log('📊 Resultado:');
  console.log(`   Processados : ${result.processed}`);
  console.log(`   Elegíveis   : ${result.created}  → sugestões pendentes criadas`);
  console.log(`   Inelegíveis : ${result.skipped}  → descartados silenciosamente`);
  console.log(`   Falhas      : ${result.failed}`);
  console.log();

  if (result.failed > 0) {
    console.warn('⚠️  Houve falhas na análise IA.');
    console.warn(
      '   Verifique a chave do AI provider no .env (OPENAI_API_KEY / ANTHROPIC_API_KEY).',
    );
  }

  // ── Step 6: Show created suggestions ─────────────────────────────────────
  if (result.created > 0) {
    const { data: suggestions } = await supabase
      .from('ai_suggestions')
      .select('id, status, created_at, article_id')
      .eq('x_account_id', account.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(result.created);

    console.log(`✅ ${suggestions?.length ?? 0} sugestão(ões) pendente(s) criada(s):`);
    suggestions?.forEach((s, i) => {
      const date = new Date(s.created_at).toLocaleString('pt-BR');
      console.log(`   ${i + 1}. ${s.id}  [${date}]`);
    });
    console.log();
    console.log('🎉 Acesse a timeline para ver e aprovar as sugestões.');
  } else if (result.processed === 0 && result.failed === 0) {
    // Check if the problem is the missing auto_flow column (migration 014 not applied)
    const { error: migrationCheck } = await supabase
      .from('news_sites')
      .select('auto_flow')
      .limit(1);

    if (migrationCheck) {
      console.error('❌ PROBLEMA DETECTADO: A coluna auto_flow não existe no banco.');
      console.error('');
      console.error('   Aplique as migrações pendentes no Supabase Dashboard:');
      console.error('   → SQL Editor → cole e execute:');
      console.error('');
      console.error('   supabase/migrations/014_news_sites_auto_flow.sql');
      console.error('   supabase/migrations/015_ai_suggestions_nullable_text.sql');
    } else {
      console.log('ℹ️  Nenhum artigo novo para analisar (todos já possuem sugestão).');
      console.log('   Aguarde novas publicações no Metrópoles ou force o scraper mais tarde.');
    }
  }

  console.log();
  console.log('='.repeat(50));
  console.log('✅ Script concluído.');
}

main().catch((err: unknown) => {
  console.error('\n❌ Erro fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
