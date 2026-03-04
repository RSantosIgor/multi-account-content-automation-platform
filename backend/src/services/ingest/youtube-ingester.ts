/**
 * YouTube Channel Ingester (SRC-003)
 *
 * Periodically checks a YouTube channel for new videos and ingests them as
 * content_items. Transcript is fetched via the free timedtext API first;
 * falls back to video description when unavailable.
 *
 * Requires: YOUTUBE_API_KEY env var (YouTube Data API v3)
 */

import { supabase } from '../../lib/supabase.js';
import { fetchYoutubeTranscript } from './transcript.js';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_RESULTS = 10;
const FETCH_TIMEOUT_MS = 15_000;

interface YtVideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    thumbnails?: { default?: { url: string } };
  };
}

interface YtSearchResponse {
  items: YtVideoItem[];
}

interface YtVideoDetails {
  id: string;
  contentDetails: { duration: string }; // ISO 8601 e.g. "PT4M13S"
  statistics: { viewCount?: string; likeCount?: string };
}

/** Parse ISO 8601 duration to seconds. */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const sec = parseInt(m[3] ?? '0', 10);
  return h * 3600 + min * 60 + sec;
}

async function ytFetch<T>(path: string, apiKey: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(`${YT_API_BASE}${path}&key=${apiKey}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text();
      console.error(`[YouTube] API error ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error('[YouTube] Fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

export interface YoutubeIngesterResult {
  sourceId: string;
  channelId: string;
  itemsIngested: number;
  itemsSkipped: number;
  errors: number;
}

export class YoutubeIngester {
  /**
   * Run ingestion for all active youtube_sources.
   */
  static async runAll(apiKey: string): Promise<YoutubeIngesterResult[]> {
    const { data: sources, error } = await supabase
      .from('youtube_sources')
      .select('*')
      .eq('is_active', true);

    if (error || !sources) {
      console.error('[YouTube] Failed to fetch sources:', error?.message);
      return [];
    }

    const results: YoutubeIngesterResult[] = [];

    for (const source of sources) {
      // Respect per-source interval
      if (source.last_scraped_at) {
        const nextRun = new Date(source.last_scraped_at);
        nextRun.setHours(nextRun.getHours() + source.scraping_interval_hours);
        if (new Date() < nextRun) continue; // not due yet
      }

      try {
        const result = await YoutubeIngester.runSource(source.id, apiKey);
        results.push(result);
      } catch (err) {
        console.error('[YouTube] runSource failed for', source.id, err);
      }
    }

    return results;
  }

  /**
   * Run ingestion for a single youtube_source.
   */
  static async runSource(sourceId: string, apiKey: string): Promise<YoutubeIngesterResult> {
    const { data: source, error: sourceError } = await supabase
      .from('youtube_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`YouTube source not found: ${sourceId}`);
    }

    const result: YoutubeIngesterResult = {
      sourceId,
      channelId: source.channel_id,
      itemsIngested: 0,
      itemsSkipped: 0,
      errors: 0,
    };

    // Build publishedAfter filter from last run
    const publishedAfter = source.last_scraped_at
      ? `&publishedAfter=${source.last_scraped_at}`
      : '';

    // Search for new videos in the channel
    const searchResp = await ytFetch<YtSearchResponse>(
      `/search?part=snippet&channelId=${source.channel_id}&type=video&order=date&maxResults=${MAX_RESULTS}${publishedAfter}`,
      apiKey,
    );

    if (!searchResp?.items?.length) {
      await supabase
        .from('youtube_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);
      return result;
    }

    const videoIds = searchResp.items.map((v) => v.id.videoId).join(',');

    // Fetch content details (duration) and statistics in batch
    const detailsResp = await ytFetch<{ items: YtVideoDetails[] }>(
      `/videos?part=contentDetails,statistics&id=${videoIds}`,
      apiKey,
    );

    const detailMap = new Map<string, YtVideoDetails>(
      (detailsResp?.items ?? []).map((d) => [d.id, d]),
    );

    for (const video of searchResp.items) {
      const videoId = video.id.videoId;
      const details = detailMap.get(videoId);
      const durationSec = details ? parseDuration(details.contentDetails.duration) : 0;

      // Skip Shorts (< 60 s)
      if (durationSec > 0 && durationSec < 60) {
        result.itemsSkipped++;
        continue;
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const summary = video.snippet.description.slice(0, 500) || null;

      // Try to fetch transcript (graceful fallback to null)
      let fullContent: string | null = null;
      try {
        fullContent = await fetchYoutubeTranscript(videoId);
      } catch {
        // transcript unavailable — full_content stays null
      }

      const metadata = {
        videoId,
        duration: durationSec,
        viewCount: parseInt(details?.statistics.viewCount ?? '0', 10),
        channelTitle: video.snippet.channelTitle,
        thumbnailUrl: video.snippet.thumbnails?.default?.url ?? null,
      };

      const { error: insertError } = await supabase.from('content_items').upsert(
        {
          x_account_id: source.x_account_id,
          source_type: 'youtube_video',
          source_table: 'youtube_sources',
          source_record_id: sourceId,
          url: videoUrl,
          title: video.snippet.title.trim(),
          summary,
          full_content: fullContent,
          is_processed: false,
          published_at: video.snippet.publishedAt,
          ingested_at: new Date().toISOString(),
          metadata,
        },
        { onConflict: 'source_type,x_account_id,url', ignoreDuplicates: true },
      );

      if (insertError) {
        console.error('[YouTube] Insert failed for video', videoId, insertError.message);
        result.errors++;
      } else {
        result.itemsIngested++;
      }
    }

    // Update last_scraped_at
    await supabase
      .from('youtube_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sourceId);

    return result;
  }
}
