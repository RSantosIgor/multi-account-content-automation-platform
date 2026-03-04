import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from './provider.js';
import { buildAnalysisPrompt } from './prompt-builder.js';
import { buildAnalysisSystemPrompt, buildUserPrompt, parseAnalysisResponse } from './prompts.js';
import { AutoFlowService } from './auto-flow.js';

type ProcessingSummary = {
  processed: number;
  created: number;
  skipped: number;
  failed: number;
};

const DEFAULT_BATCH_SIZE = 5;

/** HTTP status codes that indicate a non-retryable provider error. */
const FATAL_HTTP_STATUSES = [400, 401, 403];

/**
 * Returns true when the error carries an HTTP status that should stop
 * the entire batch (e.g. invalid API key, no credits, forbidden).
 */
function isFatalApiError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status;
    return typeof status === 'number' && FATAL_HTTP_STATUSES.includes(status);
  }
  return false;
}

export class AiSuggestionService {
  /**
   * SRC-006: Analysis phase — reads from content_items (unified layer).
   *
   * For each unprocessed content_item belonging to the given account:
   * 1. Use analysis rules + analysis prompt to decide eligibility
   * 2. If eligible → create ai_suggestion(content_item_id, suggestion_text=NULL, status='pending')
   *    - article_id set for backward compat when source_type='news_article'
   *    - If source is news_article with auto_flow=true → delegate to AutoFlowService
   * 3. If not eligible → mark content_item.is_processed=true (skip silently)
   */
  static async processNewContentItems(
    xAccountId: string,
    batchSize: number = DEFAULT_BATCH_SIZE,
  ): Promise<ProcessingSummary> {
    const provider = createAiProvider();
    const summary: ProcessingSummary = { processed: 0, created: 0, skipped: 0, failed: 0 };

    const { data: xAccount } = await supabase
      .from('x_accounts')
      .select('language')
      .eq('id', xAccountId)
      .maybeSingle();
    const language = xAccount?.language ?? 'pt-BR';

    // Fetch all unprocessed content_items for this account
    const { data: items, error: itemsError } = await supabase
      .from('content_items')
      .select('id, title, summary, source_type, source_record_id')
      .eq('x_account_id', xAccountId)
      .eq('is_processed', false)
      .order('created_at', { ascending: true });

    if (itemsError || !items || items.length === 0) {
      return summary;
    }

    // Exclude items that already have a suggestion (avoid duplicates on re-run)
    const itemIds = items.map((i) => i.id);
    const { data: existingSuggs } = await supabase
      .from('ai_suggestions')
      .select('content_item_id')
      .in('content_item_id', itemIds);

    const existingItemIds = new Set((existingSuggs ?? []).map((s) => s.content_item_id));
    const unanalyzed = items.filter((i) => !existingItemIds.has(i.id));

    if (unanalyzed.length === 0) {
      return summary;
    }

    // Build auto_flow map for news_article items
    const newsArticleSourceIds = unanalyzed
      .filter((i) => i.source_type === 'news_article' && i.source_record_id)
      .map((i) => i.source_record_id as string);

    const autoFlowMap = new Map<string, boolean>(); // scraped_article.id → auto_flow
    if (newsArticleSourceIds.length > 0) {
      const { data: articles } = await supabase
        .from('scraped_articles')
        .select('id, news_sites!scraped_articles_news_site_id_fkey(auto_flow)')
        .in('id', newsArticleSourceIds);

      for (const a of articles ?? []) {
        const site = a.news_sites as { auto_flow: boolean } | null;
        autoFlowMap.set(a.id, site?.auto_flow ?? false);
      }
    }

    const customAnalysisPrompt = await buildAnalysisPrompt(
      xAccountId,
      buildAnalysisSystemPrompt(language),
    );

    for (let i = 0; i < unanalyzed.length; i += batchSize) {
      const batch = unanalyzed.slice(i, i + batchSize);
      for (const item of batch) {
        try {
          const rawResponse = await provider.generateRaw(
            customAnalysisPrompt,
            buildUserPrompt(item.title, item.summary ?? ''),
          );

          const analysis = parseAnalysisResponse(rawResponse);

          if (!analysis.eligible) {
            await supabase.from('content_items').update({ is_processed: true }).eq('id', item.id);
            summary.processed += 1;
            summary.skipped += 1;
            continue;
          }

          // article_id for backward compat (null for non-news source types)
          const articleId =
            item.source_type === 'news_article' ? (item.source_record_id ?? null) : null;

          const { data: suggestion, error: insertError } = await supabase
            .from('ai_suggestions')
            .insert({
              content_item_id: item.id,
              article_id: articleId,
              x_account_id: xAccountId,
              suggestion_text: null,
              hashtags: [],
              status: 'pending',
            })
            .select('id')
            .single();

          if (insertError || !suggestion) {
            throw new Error(insertError?.message ?? 'Failed to insert suggestion');
          }

          summary.processed += 1;
          summary.created += 1;

          // Auto-flow only for news_article source type
          if (articleId && autoFlowMap.get(articleId)) {
            try {
              await AutoFlowService.processEligibleArticle(articleId, suggestion.id, xAccountId);
            } catch (autoFlowError) {
              console.error('[Suggest] Auto-flow failed for item', item.id, autoFlowError);
            }
          }
        } catch (error) {
          summary.failed += 1;
          if (isFatalApiError(error)) break;
        }
      }
    }

    return summary;
  }

  /**
   * Backward-compat wrapper: delegates to processNewContentItems.
   * Called by ScraperRunner after inserting scraped_articles (which
   * auto-create content_items via the bridge trigger from SRC-002).
   */
  static async processNewArticles(
    xAccountId: string,
    batchSize: number = DEFAULT_BATCH_SIZE,
  ): Promise<ProcessingSummary> {
    return AiSuggestionService.processNewContentItems(xAccountId, batchSize);
  }

  /**
   * On-demand suggestion generation for a single article.
   * Used by POST /api/v1/ai/suggest/:articleId
   *
   * This creates a pending suggestion (no tweet text) just like
   * processNewArticles, but for a single article without analysis.
   */
  static async suggestForArticle(articleId: string): Promise<{
    id: string;
    articleId: string;
    xAccountId: string;
    suggestionText: string | null;
    hashtags: string[];
    status: 'pending' | 'approved' | 'rejected' | 'posted';
    reviewedAt: string | null;
    reviewedBy: string | null;
    createdAt: string;
    updatedAt: string;
  }> {
    const { data: article, error: articleError } = await supabase
      .from('scraped_articles')
      .select('id, title, summary, news_site_id')
      .eq('id', articleId)
      .maybeSingle();

    if (articleError) {
      throw new Error(articleError.message);
    }

    if (!article) {
      throw new Error('Article not found');
    }

    const { data: site, error: siteError } = await supabase
      .from('news_sites')
      .select('x_account_id')
      .eq('id', article.news_site_id)
      .maybeSingle();

    if (siteError) {
      throw new Error(siteError.message);
    }

    if (!site) {
      throw new Error('News site not found');
    }

    // Create pending suggestion without tweet text
    // The tweet will be generated when approved (FLOW-004)
    const { data: inserted, error: insertError } = await supabase
      .from('ai_suggestions')
      .insert({
        article_id: article.id,
        x_account_id: site.x_account_id,
        suggestion_text: null,
        hashtags: [],
        status: 'pending',
      })
      .select(
        'id, article_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at',
      )
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Failed to insert suggestion');
    }

    return {
      id: inserted.id,
      articleId: inserted.article_id,
      xAccountId: inserted.x_account_id,
      suggestionText: inserted.suggestion_text,
      hashtags: inserted.hashtags,
      status: inserted.status as 'pending' | 'approved' | 'rejected' | 'posted',
      reviewedAt: inserted.reviewed_at,
      reviewedBy: inserted.reviewed_by,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }
}
