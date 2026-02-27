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
   * FLOW-003: Analysis phase.
   *
   * For each unprocessed article belonging to the given account:
   * 1. Use analysis rules + analysis prompt to decide eligibility
   * 2. If eligible → create ai_suggestion(suggestion_text=NULL, status='pending')
   *    - If site.auto_flow=true → delegate to AutoFlowService
   * 3. If not eligible → mark is_processed=true (skip silently)
   *
   * The tweet text is NOT generated here — only on approval (FLOW-004)
   * or auto-flow (FLOW-005).
   */
  static async processNewArticles(
    xAccountId: string,
    batchSize: number = DEFAULT_BATCH_SIZE,
  ): Promise<ProcessingSummary> {
    const provider = createAiProvider();
    const summary: ProcessingSummary = { processed: 0, created: 0, skipped: 0, failed: 0 };

    // Fetch sites with auto_flow flag
    const { data: sites, error: sitesError } = await supabase
      .from('news_sites')
      .select('id, auto_flow')
      .eq('x_account_id', xAccountId);

    if (sitesError) {
      console.error(
        '[Suggest] Failed to fetch sites (check migration 014 — auto_flow column):',
        sitesError.message,
      );
      return summary;
    }

    if (!sites || sites.length === 0) {
      return summary;
    }

    const siteIds = sites.map((site) => site.id);
    const siteAutoFlowMap = new Map(sites.map((s) => [s.id, s.auto_flow]));

    const { data: articles, error: articlesError } = await supabase
      .from('scraped_articles')
      .select('id, title, summary, news_site_id')
      .eq('is_processed', false)
      .in('news_site_id', siteIds)
      .order('created_at', { ascending: true });

    if (articlesError || !articles || articles.length === 0) {
      return summary;
    }

    // Exclude articles that already have a suggestion (avoid duplicates on re-run)
    const articleIds = articles.map((a) => a.id);
    const { data: existingSuggs } = await supabase
      .from('ai_suggestions')
      .select('article_id')
      .in('article_id', articleIds);

    const existingArticleIds = new Set((existingSuggs ?? []).map((s) => s.article_id));
    const unanalyzedArticles = articles.filter((a) => !existingArticleIds.has(a.id));

    if (unanalyzedArticles.length === 0) {
      return summary;
    }

    // Build custom analysis prompt with user's analysis rules
    const customAnalysisPrompt = await buildAnalysisPrompt(xAccountId, buildAnalysisSystemPrompt());

    for (let i = 0; i < unanalyzedArticles.length; i += batchSize) {
      const batch = unanalyzedArticles.slice(i, i + batchSize);
      for (const article of batch) {
        try {
          // Phase 2: Analysis — use title + summary (cheap) to decide eligibility
          const rawResponse = await provider.generateRaw(
            customAnalysisPrompt,
            buildUserPrompt(article.title, article.summary ?? ''),
          );

          const analysis = parseAnalysisResponse(rawResponse);

          if (!analysis.eligible) {
            // Not eligible → discard silently
            await supabase
              .from('scraped_articles')
              .update({ is_processed: true })
              .eq('id', article.id);

            summary.processed += 1;
            summary.skipped += 1;
            continue;
          }

          // Eligible → create pending suggestion with NO tweet text
          const { data: suggestion, error: insertError } = await supabase
            .from('ai_suggestions')
            .insert({
              article_id: article.id,
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

          // NOTE: is_processed stays false — set to true only on approval/rejection

          summary.processed += 1;
          summary.created += 1;

          // Auto-flow: automatically generate tweet + publish
          const isAutoFlow = siteAutoFlowMap.get(article.news_site_id) ?? false;
          if (isAutoFlow) {
            try {
              await AutoFlowService.processEligibleArticle(article.id, suggestion.id, xAccountId);
            } catch (autoFlowError) {
              // Auto-flow errors don't halt the batch
              console.error('[Suggest] Auto-flow failed for article', article.id, autoFlowError);
            }
          }
        } catch (error) {
          summary.failed += 1;

          if (isFatalApiError(error)) {
            break;
          }
        }
      }
    }

    return summary;
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
