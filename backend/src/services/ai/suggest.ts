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

/** Source table → DB table name mapping for auto_flow lookup. */
const SOURCE_TABLES = [
  'news_site_sources',
  'youtube_sources',
  'x_feed_sources',
  'newsletter_sources',
];

/**
 * Build a map of source_record_id → auto_flow for a set of content items.
 * Queries each relevant source table to get the auto_flow flag.
 */
async function buildAutoFlowMap(
  items: { source_table: string; source_record_id: string | null }[],
): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();

  // Group source_record_ids by source_table
  const grouped = new Map<string, string[]>();
  for (const item of items) {
    if (!item.source_record_id) continue;
    if (!SOURCE_TABLES.includes(item.source_table)) continue;
    const ids = grouped.get(item.source_table) ?? [];
    ids.push(item.source_record_id);
    grouped.set(item.source_table, ids);
  }

  // Query each source table for auto_flow
  for (const [table, ids] of grouped) {
    const uniqueIds = [...new Set(ids)];
    const { data } = await supabase.from(table).select('id, auto_flow').in('id', uniqueIds);

    for (const row of data ?? []) {
      map.set(row.id, row.auto_flow ?? false);
    }
  }

  return map;
}

export class AiSuggestionService {
  /**
   * Analysis phase — reads from content_items (unified layer).
   *
   * For each unprocessed content_item belonging to the given account:
   * 1. Use analysis rules + analysis prompt to decide eligibility
   * 2. If eligible → create ai_suggestion(content_item_id, suggestion_text=NULL, status='pending')
   *    - If source has auto_flow=true → delegate to AutoFlowService
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
      .select('id, title, summary, source_type, source_table, source_record_id')
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

    // Build auto_flow map across all source types
    const autoFlowMap = await buildAutoFlowMap(unanalyzed);

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

          const { data: suggestion, error: insertError } = await supabase
            .from('ai_suggestions')
            .insert({
              content_item_id: item.id,
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

          // Auto-flow: check if the source has auto_flow enabled
          const sourceAutoFlow = item.source_record_id
            ? (autoFlowMap.get(item.source_record_id) ?? false)
            : false;

          if (sourceAutoFlow) {
            try {
              await AutoFlowService.processContentItem(item.id, suggestion.id, xAccountId);
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
   * On-demand suggestion generation for a single content item.
   * Creates a pending suggestion (no tweet text) without analysis.
   */
  static async suggestForContentItem(contentItemId: string): Promise<{
    id: string;
    contentItemId: string;
    xAccountId: string;
    suggestionText: string | null;
    hashtags: string[];
    status: 'pending' | 'approved' | 'rejected' | 'posted';
    reviewedAt: string | null;
    reviewedBy: string | null;
    createdAt: string;
    updatedAt: string;
  }> {
    const { data: item, error: itemError } = await supabase
      .from('content_items')
      .select('id, x_account_id')
      .eq('id', contentItemId)
      .maybeSingle();

    if (itemError) throw new Error(itemError.message);
    if (!item) throw new Error('Content item not found');

    const { data: inserted, error: insertError } = await supabase
      .from('ai_suggestions')
      .insert({
        content_item_id: item.id,
        x_account_id: item.x_account_id,
        suggestion_text: null,
        hashtags: [],
        status: 'pending',
      })
      .select(
        'id, content_item_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at',
      )
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Failed to insert suggestion');
    }

    return {
      id: inserted.id,
      contentItemId: inserted.content_item_id,
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
