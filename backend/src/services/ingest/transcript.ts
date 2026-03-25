/**
 * YouTube Transcript Fetcher (SRC-003)
 *
 * Uses the youtube-transcript package which fetches captions via
 * YouTube's InnerTube player API (Android client) → timedtext XML.
 * Falls back to HTML scraping of ytInitialPlayerResponse.
 *
 * Returns null when no transcript is available (live, age-gated, disabled captions).
 */

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetch the transcript for a YouTube video.
 *
 * @param videoId - YouTube video ID (e.g. "dQw4w9WgXcQ")
 * @param preferredLang - BCP-47 language code (e.g. "pt", "en"). Default: "pt"
 * @returns Plain-text transcript, or null if unavailable
 */
export async function fetchYoutubeTranscript(
  videoId: string,
  preferredLang = 'pt',
): Promise<string | null> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: preferredLang });

    if (!segments || segments.length === 0) return null;

    const text = segments
      .map((seg) => seg.text ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > 0 ? text : null;
  } catch {
    // If preferred language failed, retry without language preference
    // (YouTube will return the default/auto-generated track)
    if (preferredLang !== '') {
      try {
        const segments = await YoutubeTranscript.fetchTranscript(videoId);

        if (!segments || segments.length === 0) return null;

        const text = segments
          .map((seg) => seg.text ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return text.length > 0 ? text : null;
      } catch {
        // Both attempts failed
      }
    }

    console.warn('[Transcript] Failed for video', videoId);
    return null;
  }
}
