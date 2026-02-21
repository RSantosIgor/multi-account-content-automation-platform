import * as cheerio from 'cheerio';

/**
 * RSS Auto-Detection Service
 *
 * Attempts to find an RSS or Atom feed URL by parsing the HTML of a given site URL.
 * Looks for <link rel="alternate" type="application/rss+xml"> or type="application/atom+xml" tags.
 */

export interface RssDetectionResult {
  feedUrl: string | null;
}

/**
 * Detect RSS/Atom feed URL from a site's HTML
 *
 * @param siteUrl - The URL of the site to check
 * @returns Object with feedUrl (string if found, null otherwise)
 */
export async function detectRssFeed(siteUrl: string): Promise<RssDetectionResult> {
  try {
    // Fetch the site HTML with 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { feedUrl: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for RSS or Atom feed links in <head>
    const feedLink = $('link[rel="alternate"]')
      .filter((_i, el) => {
        const type = $(el).attr('type');
        return type === 'application/rss+xml' || type === 'application/atom+xml';
      })
      .first()
      .attr('href');

    if (!feedLink) {
      return { feedUrl: null };
    }

    // Resolve relative URLs to absolute
    const feedUrl = new URL(feedLink, siteUrl).toString();

    return { feedUrl };
  } catch {
    // Handle timeout, network errors, or parsing errors gracefully
    // Return null instead of throwing
    return { feedUrl: null };
  }
}
