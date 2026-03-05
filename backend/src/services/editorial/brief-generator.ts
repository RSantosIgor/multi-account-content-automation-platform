/**
 * Editorial Brief Generator (EDT-005)
 *
 * For each 'detected' cluster with trend_score >= threshold, generates:
 *   - A context summary (2-3 sentences)
 *   - 2-4 suggested posting angles
 *
 * Stores the result in editorial_briefs and advances the cluster to 'ready'.
 */

import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from '../ai/provider.js';
import { buildBriefPrompt, parseBriefResponse } from './prompts.js';

/** Minimum trend_score for a cluster to get a brief generated */
const SCORE_THRESHOLD = 3.0;

export class BriefGenerator {
  /**
   * Generate an editorial brief for a single cluster.
   * Idempotent — if a 'draft' brief already exists for the cluster, skips.
   */
  static async generateForCluster(clusterId: string): Promise<void> {
    // 0. Check if brief already exists
    const { data: existing } = await supabase
      .from('editorial_briefs')
      .select('id')
      .eq('cluster_id', clusterId)
      .in('status', ['draft', 'approved'])
      .maybeSingle();

    if (existing) return; // already has a brief

    // 1. Fetch cluster metadata
    const { data: cluster, error: clusterError } = await supabase
      .from('editorial_clusters')
      .select('id, x_account_id, topic, tags')
      .eq('id', clusterId)
      .maybeSingle();

    if (clusterError || !cluster) {
      console.error('[BriefGen] Cluster not found:', clusterId, clusterError?.message);
      return;
    }

    // 2. Fetch cluster items → content_items (title + summary)
    const { data: clusterItems } = await supabase
      .from('cluster_items')
      .select('content_item_id')
      .eq('cluster_id', clusterId);

    if (!clusterItems || clusterItems.length === 0) return;

    const contentItemIds = clusterItems.map((ci) => ci.content_item_id);
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('title, summary, source_type')
      .in('id', contentItemIds);

    if (!contentItems || contentItems.length === 0) return;

    // 3. Build user content: topic + list of summaries
    const itemLines = contentItems
      .map(
        (ci, idx) =>
          `[${idx + 1}] (${ci.source_type}) ${ci.title}` +
          (ci.summary ? `\n   ${ci.summary.slice(0, 300)}` : ''),
      )
      .join('\n\n');

    const userContent = [
      `Topic: ${cluster.topic}`,
      `Tags: ${cluster.tags.join(', ')}`,
      '',
      'Content items:',
      itemLines,
    ].join('\n');

    // 4. Call AI
    const aiProvider = createAiProvider();
    let rawResponse: string;
    try {
      rawResponse = await aiProvider.generateRaw(buildBriefPrompt(), userContent);
    } catch (err) {
      console.error('[BriefGen] AI call failed for cluster', clusterId, err);
      return;
    }

    // 5. Parse response
    const brief = parseBriefResponse(rawResponse);
    if (!brief) {
      console.warn('[BriefGen] Could not parse brief response for cluster', clusterId);
      return;
    }

    // 6. Insert editorial_brief
    const { error: insertError } = await supabase.from('editorial_briefs').insert({
      cluster_id: clusterId,
      x_account_id: cluster.x_account_id,
      brief_text: brief.context,
      suggested_angles: brief.angles,
      status: 'draft',
    });

    if (insertError) {
      console.error('[BriefGen] Failed to insert brief:', insertError.message);
      return;
    }

    // 7. Advance cluster to 'ready'
    await supabase
      .from('editorial_clusters')
      .update({ status: 'ready', updated_at: new Date().toISOString() })
      .eq('id', clusterId);

    console.info(`[BriefGen] Brief generated for cluster "${cluster.topic}"`);
  }

  /**
   * Process all 'detected' clusters for an account with score >= threshold.
   * @returns Number of briefs generated.
   */
  static async processDetectedClusters(xAccountId: string): Promise<number> {
    const { data: clusters, error } = await supabase
      .from('editorial_clusters')
      .select('id, trend_score')
      .eq('x_account_id', xAccountId)
      .eq('status', 'detected')
      .gte('trend_score', SCORE_THRESHOLD);

    if (error) {
      console.error('[BriefGen] Failed to fetch clusters:', error.message);
      return 0;
    }

    if (!clusters || clusters.length === 0) return 0;

    let generated = 0;
    for (const cluster of clusters) {
      await BriefGenerator.generateForCluster(cluster.id);
      generated++;
    }

    return generated;
  }
}
