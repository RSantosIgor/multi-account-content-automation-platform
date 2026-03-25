/**
 * Editorial Brief Generator (EDT-005, EDT-009)
 *
 * For each 'detected' cluster with trend_score >= threshold, generates:
 *   - A context summary (2-3 sentences)
 *   - 2-4 suggested posting angles
 *
 * Stores the result in editorial_briefs and advances the cluster to 'ready'.
 *
 * EDT-009: After creating the brief, auto-generates one ai_suggestion per angle
 * via ContextualGeneratorService. Each angle is processed independently (isolated failures).
 */

import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from '../ai/provider.js';
import { buildBriefPrompt, parseBriefResponse } from './prompts.js';
import { ContextualGeneratorService } from './contextual-generator.js';

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
    const { data: insertedBrief, error: insertError } = await supabase
      .from('editorial_briefs')
      .insert({
        cluster_id: clusterId,
        x_account_id: cluster.x_account_id,
        brief_text: brief.context,
        suggested_angles: brief.angles,
        status: 'draft',
      })
      .select('id')
      .single();

    if (insertError || !insertedBrief) {
      console.error('[BriefGen] Failed to insert brief:', insertError?.message);
      return;
    }

    // 7. EDT-009: Auto-generate one suggestion per angle (isolated failures)
    const angles = brief.angles as { angle: string; rationale: string }[];
    let generatedCount = 0;

    for (const angleObj of angles) {
      try {
        await ContextualGeneratorService.generateFromBrief(
          insertedBrief.id,
          angleObj.angle,
          cluster.x_account_id,
          { skipMarkUsed: true },
        );
        generatedCount++;
      } catch (err) {
        console.warn(
          `[BriefGen] Failed to generate suggestion for angle "${angleObj.angle}":`,
          err instanceof Error ? err.message : err,
        );
        // Continue with next angle — isolated failure
      }
    }

    // 8. Mark brief + cluster as 'used' after all generations attempted
    await ContextualGeneratorService.markBriefUsed(insertedBrief.id);

    console.info(
      `[BriefGen] Brief generated for cluster "${cluster.topic}" — ${generatedCount}/${angles.length} suggestions created`,
    );
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
