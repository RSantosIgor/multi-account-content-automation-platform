/**
 * Editorial Clusterer Service (EDT-004)
 *
 * Groups content_items into editorial clusters based on tag overlap and temporal proximity.
 * Algorithm:
 *   1. Fetch content_items from the last 48h with their tags
 *   2. Skip items already in active clusters (detected / ready / used)
 *   3. Build adjacency graph: edge between two items if they share ≥2 tags
 *   4. Find connected components (BFS)
 *   5. For each component ≥2 items: compute trend_score, insert cluster + cluster_items
 *   6. Expire clusters older than 72h
 */

import { supabase } from '../../lib/supabase.js';

type ItemRow = { id: string; source_type: string; ingested_at: string };

export class EditorialClusterer {
  /** Window used to look for recent items (hours) */
  static readonly WINDOW_HOURS = 48;
  /** Minimum number of shared tags for two items to be adjacent */
  static readonly MIN_SHARED_TAGS = 2;
  /** Minimum component size to become a cluster */
  static readonly MIN_CLUSTER_SIZE = 2;
  /** Clusters older than this many hours are expired */
  static readonly EXPIRY_HOURS = 72;
  /** Recency bonus window (hours) */
  private static readonly RECENCY_HOURS = 6;

  // ---------------------------------------------------------------------------
  // Public entry-point
  // ---------------------------------------------------------------------------

  static async detectClusters(xAccountId: string): Promise<void> {
    // 0. Expire stale clusters first
    await EditorialClusterer.expireOldClusters(xAccountId);

    // 1. Fetch content_items ingested in the last WINDOW_HOURS
    const windowStart = new Date(
      Date.now() - EditorialClusterer.WINDOW_HOURS * 3_600_000,
    ).toISOString();
    const windowEnd = new Date().toISOString();

    const { data: items, error: itemsError } = await supabase
      .from('content_items')
      .select('id, source_type, ingested_at')
      .eq('x_account_id', xAccountId)
      .gte('ingested_at', windowStart);

    if (itemsError) {
      console.error('[Clusterer] Failed to fetch content_items:', itemsError.message);
      return;
    }
    if (!items || items.length < EditorialClusterer.MIN_CLUSTER_SIZE) return;

    // 2. Fetch tags for all those items
    const allItemIds = items.map((i) => i.id);
    const { data: tagRows } = await supabase
      .from('content_tags')
      .select('content_item_id, tag')
      .in('content_item_id', allItemIds);

    if (!tagRows || tagRows.length === 0) return;

    const tagMap = new Map<string, Set<string>>();
    for (const row of tagRows) {
      if (!tagMap.has(row.content_item_id)) tagMap.set(row.content_item_id, new Set());
      tagMap.get(row.content_item_id)!.add(row.tag);
    }

    // Only keep items that have at least one tag
    const taggedItems = (items as ItemRow[]).filter((i) => (tagMap.get(i.id)?.size ?? 0) > 0);
    if (taggedItems.length < EditorialClusterer.MIN_CLUSTER_SIZE) return;

    // 3. Find items already in an active cluster → exclude them
    const { data: existingLinks } = await supabase
      .from('cluster_items')
      .select('content_item_id, cluster_id')
      .in(
        'content_item_id',
        taggedItems.map((i) => i.id),
      );

    let alreadyClusteredIds = new Set<string>();
    if (existingLinks && existingLinks.length > 0) {
      const linkedClusterIds = [...new Set(existingLinks.map((r) => r.cluster_id))];
      const { data: activeClusters } = await supabase
        .from('editorial_clusters')
        .select('id')
        .in('id', linkedClusterIds)
        .in('status', ['detected', 'ready', 'used']);

      const activeIds = new Set((activeClusters ?? []).map((c) => c.id));
      alreadyClusteredIds = new Set(
        existingLinks.filter((r) => activeIds.has(r.cluster_id)).map((r) => r.content_item_id),
      );
    }

    const candidates = taggedItems.filter((i) => !alreadyClusteredIds.has(i.id));
    if (candidates.length < EditorialClusterer.MIN_CLUSTER_SIZE) return;

    // 4. Build adjacency graph
    const adj = new Map<string, Set<string>>();
    for (const item of candidates) adj.set(item.id, new Set());

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const a = candidates[i];
        const b = candidates[j];
        const tagsA = tagMap.get(a.id)!;
        const tagsB = tagMap.get(b.id)!;

        let shared = 0;
        for (const t of tagsA) {
          if (tagsB.has(t)) shared++;
          if (shared >= EditorialClusterer.MIN_SHARED_TAGS) break;
        }

        if (shared >= EditorialClusterer.MIN_SHARED_TAGS) {
          adj.get(a.id)!.add(b.id);
          adj.get(b.id)!.add(a.id);
        }
      }
    }

    // 5. BFS — connected components
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const item of candidates) {
      if (visited.has(item.id)) continue;

      const component: string[] = [];
      const queue = [item.id];
      visited.add(item.id);

      while (queue.length > 0) {
        const cur = queue.shift()!;
        component.push(cur);
        for (const nb of adj.get(cur) ?? []) {
          if (!visited.has(nb)) {
            visited.add(nb);
            queue.push(nb);
          }
        }
      }

      if (component.length >= EditorialClusterer.MIN_CLUSTER_SIZE) {
        components.push(component);
      }
    }

    // 6. Persist each component as a cluster
    for (const component of components) {
      const compItems = candidates.filter((i) => component.includes(i.id));

      // Shared tags = intersection across all items in component
      let sharedTags: Set<string> | null = null;
      for (const item of compItems) {
        const tags = tagMap.get(item.id)!;
        if (sharedTags === null) {
          sharedTags = new Set(tags);
        } else {
          for (const t of [...sharedTags]) {
            if (!tags.has(t)) sharedTags.delete(t);
          }
        }
      }

      const tagsArray = [...(sharedTags ?? [])];
      if (tagsArray.length === 0) continue;

      // Topic = most frequent tag in the component
      const freq = new Map<string, number>();
      for (const item of compItems) {
        for (const t of tagMap.get(item.id) ?? []) {
          freq.set(t, (freq.get(t) ?? 0) + 1);
        }
      }
      const topic = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];

      const trendScore = EditorialClusterer.calculateTrendScore(compItems);
      const sourceTypeCount = new Set(compItems.map((i) => i.source_type)).size;

      const { data: cluster, error: clusterError } = await supabase
        .from('editorial_clusters')
        .insert({
          x_account_id: xAccountId,
          topic,
          tags: tagsArray,
          trend_score: trendScore,
          item_count: compItems.length,
          source_type_count: sourceTypeCount,
          time_window_start: windowStart,
          time_window_end: windowEnd,
          status: 'detected',
        })
        .select('id')
        .single();

      if (clusterError || !cluster) {
        console.error('[Clusterer] Failed to insert cluster:', clusterError?.message);
        continue;
      }

      const clusterItemRows = compItems.map((item) => ({
        cluster_id: cluster.id,
        content_item_id: item.id,
        relevance_score: 1.0,
      }));

      const { error: itemsInsertError } = await supabase
        .from('cluster_items')
        .insert(clusterItemRows);

      if (itemsInsertError) {
        console.error('[Clusterer] Failed to insert cluster_items:', itemsInsertError.message);
      } else {
        console.info(
          `[Clusterer] Created cluster "${topic}" with ${compItems.length} items (score=${trendScore.toFixed(1)})`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  static calculateTrendScore(items: { source_type: string; ingested_at: string }[]): number {
    const count = items.length;
    const sourceTypes = new Set(items.map((i) => i.source_type)).size;
    const recencyCutoff = Date.now() - EditorialClusterer.RECENCY_HOURS * 3_600_000;
    const recentItems = items.filter(
      (i) => new Date(i.ingested_at).getTime() > recencyCutoff,
    ).length;

    return count * 1.0 + sourceTypes * 1.5 + recentItems * 0.5;
  }

  static async expireOldClusters(xAccountId: string): Promise<void> {
    const cutoff = new Date(Date.now() - EditorialClusterer.EXPIRY_HOURS * 3_600_000).toISOString();

    await supabase
      .from('editorial_clusters')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('x_account_id', xAccountId)
      .in('status', ['detected', 'ready'])
      .lt('created_at', cutoff);
  }
}
