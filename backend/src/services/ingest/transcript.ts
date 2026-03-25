/**
 * YouTube Transcript Fetcher (SRC-003)
 *
 * Attempts to obtain a text transcript for a YouTube video without requiring
 * an API key, using the public timedtext API.
 *
 * Strategy:
 *  1. Fetch the video page to extract the "captions" track list from ytInitialPlayerResponse
 *  2. Pick the best available track (priority: requested language → 'en' → first available)
 *  3. Fetch the timed-text XML and strip timing tags, returning plain text
 *
 * Returns null when no transcript is available (live, age-gated, disabled captions).
 */

const YOUTUBE_VIDEO_BASE = 'https://www.youtube.com/watch';
const TIMEDTEXT_BASE = 'https://www.youtube.com/api/timedtext';
const FETCH_TIMEOUT_MS = 15_000;

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string | undefined; // 'asr' = auto-generated speech recognition
}

/**
 * Find the starting index of the JSON object for a given key in HTML.
 * Supports both `key = {` (variable assignment) and `"key": {` (nested object).
 */
function findJsonObjectStart(html: string, key: string): number {
  // Pattern 1: variable assignment  →  ytInitialPlayerResponse = {
  const assignIdx = html.indexOf(`${key} =`);
  if (assignIdx !== -1) {
    const braceIdx = html.indexOf('{', assignIdx);
    if (braceIdx !== -1) return braceIdx;
  }
  // Pattern 2: object key  →  "ytInitialPlayerResponse": {
  const keyIdx = html.indexOf(`"${key}":`);
  if (keyIdx !== -1) {
    const braceIdx = html.indexOf('{', keyIdx);
    if (braceIdx !== -1) return braceIdx;
  }
  return -1;
}

/**
 * Extract a balanced JSON object starting at `start` using bracket counting.
 * Much more robust than regex for large or nested JSON blobs.
 */
function extractBalancedJson(html: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Parse ytInitialPlayerResponse from a YouTube page HTML.
 * Returns caption track list or null.
 */
function extractCaptionTracks(html: string): CaptionTrack[] | null {
  const start = findJsonObjectStart(html, 'ytInitialPlayerResponse');
  if (start === -1) {
    console.warn('[Transcript] ytInitialPlayerResponse not found in page HTML');
    return null;
  }

  const jsonStr = extractBalancedJson(html, start);
  if (!jsonStr) {
    console.warn('[Transcript] Failed to extract balanced JSON for ytInitialPlayerResponse');
    return null;
  }

  try {
    const json = JSON.parse(jsonStr) as {
      captions?: {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: Array<{
            baseUrl: string;
            languageCode: string;
            kind?: string;
          }>;
        };
      };
    };

    return (
      json.captions?.playerCaptionsTracklistRenderer?.captionTracks?.map((t) => ({
        baseUrl: t.baseUrl,
        languageCode: t.languageCode,
        kind: t.kind,
      })) ?? null
    );
  } catch (err) {
    console.warn('[Transcript] JSON parse failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Choose the best caption track given a preferred language.
 * Order: exact match → 'en' → any auto-generated → first available.
 */
function chooseBestTrack(tracks: CaptionTrack[], preferredLang: string): CaptionTrack | undefined {
  const exact = tracks.find((t) => t.languageCode === preferredLang);
  if (exact) return exact;

  const english = tracks.find((t) => t.languageCode.startsWith('en'));
  if (english) return english;

  const asr = tracks.find((t) => t.kind === 'asr');
  if (asr) return asr;

  return tracks[0];
}

/**
 * Strip XML tags from timed-text XML and return plain text.
 */
function parseCaptionXml(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, ' ') // remove all tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function safeFetch(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Fetch the transcript for a YouTube video.
 *
 * @param videoId - YouTube video ID (e.g. "dQw4w9WgXcQ")
 * @param preferredLang - BCP-47 language code (e.g. "pt", "en"). Default: "en"
 * @returns Plain-text transcript, or null if unavailable
 */
export async function fetchYoutubeTranscript(
  videoId: string,
  preferredLang = 'en',
): Promise<string | null> {
  // Step 1: fetch video page
  const pageHtml = await safeFetch(`${YOUTUBE_VIDEO_BASE}?v=${videoId}`);
  if (!pageHtml) return null;

  // Step 2: extract caption tracks
  const tracks = extractCaptionTracks(pageHtml);
  if (!tracks || tracks.length === 0) return null;

  // Step 3: pick best track
  const track = chooseBestTrack(tracks, preferredLang);
  if (!track) return null;

  // Step 4: fetch timed-text XML
  // baseUrl may already be absolute; ensure it's formatted correctly
  const captionUrl = track.baseUrl.startsWith('http')
    ? track.baseUrl
    : `${TIMEDTEXT_BASE}${track.baseUrl}`;

  const xml = await safeFetch(`${captionUrl}&fmt=srv3`);
  if (!xml) return null;

  // Step 5: parse XML → plain text
  const text = parseCaptionXml(xml);
  return text.length > 0 ? text : null;
}
