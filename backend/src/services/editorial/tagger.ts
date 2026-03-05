/**
 * Content Tagger Service (EDT-002)
 *
 * Extracts 3-5 thematic tags from each content_item using AI.
 * Tags are stored in content_tags with a confidence score (0.0–1.0).
 *
 * Usage:
 *   await ContentTagger.tagContentItem(itemId);
 *   const count = await ContentTagger.tagUntaggedItems(xAccountId);
 */

import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from '../ai/provider.js';
import { buildTaggingPrompt, parseTaggingResponse } from './prompts.js';

export class ContentTagger {
  /**
   * Extract and persist tags for a single content_item.
   * Idempotent — duplicate tags are silently ignored (UNIQUE constraint).
   * AI failures are caught and logged; they do not propagate.
   */
  static async tagContentItem(itemId: string): Promise<void> {
    try {
      // 1. Fetch content_item (title + summary only — cheap tokens)
      const { data: item, error: fetchError } = await supabase
        .from('content_items')
        .select('id, title, summary')
        .eq('id', itemId)
        .maybeSingle();

      if (fetchError || !item) {
        console.error(`[Tagger] content_item not found: ${itemId}`, fetchError?.message);
        return;
      }

      const userContent = [`Title: ${item.title}`, item.summary ? `\nSummary: ${item.summary}` : '']
        .join('')
        .trim();

      // 2. Call AI
      const aiProvider = createAiProvider();
      const rawResponse = await aiProvider.generateRaw(buildTaggingPrompt(), userContent);

      // 3. Parse + normalise
      const tags = parseTaggingResponse(rawResponse);
      if (tags.length === 0) {
        console.warn(`[Tagger] No tags extracted for item ${itemId}`);
        return;
      }

      // 4. Upsert into content_tags (ON CONFLICT DO NOTHING via ignoreDuplicates)
      const rows = tags.map((t) => ({
        content_item_id: itemId,
        tag: t.tag,
        confidence: t.confidence,
      }));

      const { error: insertError } = await supabase
        .from('content_tags')
        .insert(rows)
        .throwOnError();

      if (insertError) {
        // Duplicate rows are expected when re-tagging; swallow them
        if (!insertError.code?.startsWith('23')) {
          console.error(`[Tagger] Insert error for item ${itemId}:`, insertError.message);
        }
      }
    } catch (err) {
      // Circuit-breaker: log but never throw — tagging failure must not block ingestion
      console.error(`[Tagger] Unexpected error for item ${itemId}:`, err);
    }
  }

  /**
   * Tag all untagged content_items for a given X account.
   * "Untagged" = no rows in content_tags for that item.
   *
   * @returns Number of items processed.
   */
  static async tagUntaggedItems(xAccountId: string): Promise<number> {
    // 1. Fetch all content_items for the account
    const { data: items, error } = await supabase
      .from('content_items')
      .select('id')
      .eq('x_account_id', xAccountId);

    if (error) {
      console.error('[Tagger] Failed to fetch content_items:', error.message);
      return 0;
    }

    if (!items || items.length === 0) return 0;

    // 2. Fetch already-tagged item ids for this account (two-step: PostgREST has no subqueries)
    const allItemIds = items.map((i) => i.id);
    const { data: tagged } = await supabase
      .from('content_tags')
      .select('content_item_id')
      .in('content_item_id', allItemIds);

    const taggedIds = new Set((tagged ?? []).map((r) => r.content_item_id));
    const untagged = items.filter((i) => !taggedIds.has(i.id));

    if (untagged.length === 0) return 0;

    let processed = 0;
    for (const item of untagged) {
      await ContentTagger.tagContentItem(item.id);
      processed++;
    }

    return processed;
  }
}
