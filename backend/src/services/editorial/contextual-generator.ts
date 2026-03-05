/**
 * Contextual Generator Service (EDT-006)
 *
 * Generates AI suggestions from editorial briefs using multiple source articles.
 * Unlike the 1:1 pipeline (one article → one suggestion), this synthesizes
 * content from 2–3 cluster items into a richer, more informed tweet.
 *
 * Flow:
 *   1. Load brief + cluster metadata
 *   2. Fetch top cluster items by relevance_score (max 3)
 *   3. Fetch/cache full_content for each item
 *   4. Build multi-source contextual prompt
 *   5. Apply publication rules + call AI
 *   6. Parse response + generate article summary
 *   7. Insert ai_suggestion with editorial_brief_id + source_content_ids
 *   8. Mark brief + cluster as 'used'
 */

import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from '../ai/provider.js';
import { buildPublicationPrompt } from '../ai/prompt-builder.js';
import { buildContextualPublicationPrompt, parseAiSuggestionResponse } from '../ai/prompts.js';
import { generateArticleSummary } from '../ai/summarizer.js';
import { fetchArticleContent } from '../scraper/article-fetcher.js';
import type { Json } from '../../types/database.js';

/** Max number of source items to include in the contextual prompt */
const MAX_SOURCES = 3;
/** Max chars of full_content to send per source (keeps token usage reasonable) */
const MAX_CONTENT_CHARS = 1500;

export class ContextualGeneratorService {
  /**
   * Generates a suggestion from a brief + selected angle.
   * Fetches/caches full_content for the top cluster items.
   * @returns The inserted ai_suggestion id
   */
  static async generateFromBrief(
    briefId: string,
    selectedAngle: string,
    xAccountId: string,
  ): Promise<{ id: string; suggestion_text: string; hashtags: string[] }> {
    // 1. Fetch brief + cluster info
    const { data: brief, error: briefError } = await supabase
      .from('editorial_briefs')
      .select('id, brief_text, cluster_id, editorial_clusters(topic)')
      .eq('id', briefId)
      .eq('x_account_id', xAccountId)
      .maybeSingle();

    if (briefError || !brief) {
      throw new Error(briefError?.message ?? 'Brief not found');
    }

    const cluster = brief.editorial_clusters as { topic: string } | null;

    // 2. Get top cluster items by relevance_score (limit MAX_SOURCES)
    const { data: clusterItems } = await supabase
      .from('cluster_items')
      .select('content_item_id, relevance_score')
      .eq('cluster_id', brief.cluster_id)
      .order('relevance_score', { ascending: false })
      .limit(MAX_SOURCES);

    const contentItemIds = (clusterItems ?? []).map((ci) => ci.content_item_id);

    if (contentItemIds.length === 0) {
      throw new Error('Cluster has no items');
    }

    // 3. Fetch content items (title, summary, url, full_content)
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('id, title, summary, url, full_content')
      .in('id', contentItemIds);

    if (!contentItems || contentItems.length === 0) {
      throw new Error('Content items not found');
    }

    // 4. Fetch/cache full_content for each item (fetch from URL if not cached)
    const sourceContents = await Promise.all(
      contentItems.map(async (item) => {
        if (item.full_content) {
          return item.full_content.slice(0, MAX_CONTENT_CHARS);
        }
        try {
          const fetched = await fetchArticleContent(item.url);
          const content = fetched.content;
          // Cache in content_items (best-effort)
          await supabase
            .from('content_items')
            .update({ full_content: content, updated_at: new Date().toISOString() })
            .eq('id', item.id);
          return content.slice(0, MAX_CONTENT_CHARS);
        } catch {
          // Fallback to summary if fetch fails
          return item.summary ?? item.title;
        }
      }),
    );

    // 5. Build user prompt (topic + context + angle + multi-source content)
    const sourceLines = contentItems
      .map((item, i) => `[Source ${i + 1}] ${item.title}\n${sourceContents[i]}`)
      .join('\n\n---\n\n');

    const userPrompt = [
      `Topic: ${cluster?.topic ?? ''}`,
      brief.brief_text ? `Editorial context: ${brief.brief_text}` : '',
      `Angle: ${selectedAngle}`,
      '',
      'Sources:',
      sourceLines,
    ]
      .filter(Boolean)
      .join('\n');

    // 6. Build system prompt (contextual base + publication rules)
    const baseSystemPrompt = buildContextualPublicationPrompt();
    const systemPrompt = await buildPublicationPrompt(xAccountId, baseSystemPrompt);

    // 7. Call AI
    const aiProvider = createAiProvider();
    const rawResponse = await aiProvider.generateRaw(systemPrompt, userPrompt);

    // 8. Parse tweet response
    const parsed = parseAiSuggestionResponse(rawResponse);
    if (!parsed.ok) {
      throw new Error(`AI parse failed: ${parsed.error}`);
    }

    // 9. Generate multi-source summary
    const combinedContent = sourceContents.join('\n\n');
    const summary = await generateArticleSummary(
      aiProvider,
      cluster?.topic ?? 'Editorial',
      combinedContent,
    );

    // 10. Insert ai_suggestion linked to this brief
    const { data: suggestion, error: insertError } = await supabase
      .from('ai_suggestions')
      .insert({
        x_account_id: xAccountId,
        editorial_brief_id: briefId,
        source_content_ids: contentItemIds,
        suggestion_text: parsed.data.text,
        hashtags: parsed.data.hashtags,
        article_summary: summary as unknown as Json,
        status: 'pending',
      })
      .select('id, suggestion_text, hashtags')
      .single();

    if (insertError || !suggestion) {
      throw new Error(insertError?.message ?? 'Failed to insert suggestion');
    }

    // 11. Mark brief + cluster as 'used'
    await supabase
      .from('editorial_briefs')
      .update({ status: 'used', updated_at: new Date().toISOString() })
      .eq('id', briefId);

    await supabase
      .from('editorial_clusters')
      .update({ status: 'used', updated_at: new Date().toISOString() })
      .eq('id', brief.cluster_id);

    console.info(`[ContextualGen] Generated suggestion from brief ${briefId}`);

    return {
      id: suggestion.id,
      suggestion_text: suggestion.suggestion_text ?? '',
      hashtags: suggestion.hashtags,
    };
  }
}
