/**
 * YouTube Transcript Fetcher (SRC-003)
 *
 * Uses YouTube's InnerTube private API via youtubei.js for reliable
 * transcript extraction — no HTML scraping needed.
 *
 * Returns null when no transcript is available (live, age-gated, disabled captions).
 */

import { Innertube } from 'youtubei.js';

/** Re-create the InnerTube client every 5 min to keep the session fresh. */
const INNERTUBE_TTL_MS = 5 * 60 * 1000;

let innertubeInstance: Awaited<ReturnType<typeof Innertube.create>> | null = null;
let innertubeCreatedAt = 0;

async function getInnertube(): Promise<Innertube> {
  const now = Date.now();
  if (!innertubeInstance || now - innertubeCreatedAt > INNERTUBE_TTL_MS) {
    innertubeInstance = await Innertube.create({
      generate_session_locally: true,
    });
    innertubeCreatedAt = now;
  }
  return innertubeInstance;
}

/**
 * Fetch the transcript for a YouTube video.
 *
 * @param videoId - YouTube video ID (e.g. "dQw4w9WgXcQ")
 * @param _preferredLang - reserved for future language selection
 * @returns Plain-text transcript, or null if unavailable
 */
export async function fetchYoutubeTranscript(
  videoId: string,
  _preferredLang = 'en',
): Promise<string | null> {
  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    const body = transcriptData?.transcript?.content?.body;
    if (!body) return null;

    const segments = body.initial_segments ?? [];

    const text = segments
      .filter((seg) => seg.type === 'TranscriptSegment')
      .map((seg) => {
        if ('snippet' in seg && seg.snippet && 'text' in seg.snippet) {
          return String(seg.snippet.text ?? '');
        }
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > 0 ? text : null;
  } catch (err) {
    console.warn(
      '[Transcript] Failed for video',
      videoId,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
