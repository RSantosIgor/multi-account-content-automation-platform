import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

/**
 * RSS Auto-Detection Service
 *
 * Attempts to find an RSS or Atom feed URL by parsing the HTML of a given site URL.
 * Looks for <link rel="alternate" type="application/rss+xml"> or type="application/atom+xml" tags.
 * If not found, tries common RSS feed URLs.
 */

export interface RssDetectionResult {
  feedUrl: string | null;
}

// Common RSS feed paths to try
const COMMON_FEED_PATHS = ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/index.xml'];

/**
 * Clean XML content by removing BOM, leading/trailing whitespace, and non-XML content
 */
function cleanXmlContent(content: string): string {
  // Remove UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // Trim whitespace
  content = content.trim();

  // Find the first occurrence of <?xml or <rss or <feed
  const xmlStart = content.search(/<\?xml|<rss|<feed/i);
  if (xmlStart > 0) {
    content = content.slice(xmlStart);
  }

  return content;
}

/**
 * Test if a URL is a valid RSS/Atom feed
 * Uses manual fetch + XML cleaning for better compatibility
 */
async function testFeedUrl(feedUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawContent = await response.text();
    const cleanedContent = cleanXmlContent(rawContent);

    const parser = new Parser();
    await parser.parseString(cleanedContent);
    return true;
  } catch (error) {
    // Silent fail for most cases
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[RSS Detector] testFeedUrl failed for ${feedUrl}:`,
        error instanceof Error ? error.message : 'Unknown',
      );
    }
    return false;
  }
}

/**
 * Detect RSS/Atom feed URL from a site's HTML
 *
 * @param siteUrl - The URL of the site to check
 * @returns Object with feedUrl (string if found, null otherwise)
 */
export async function detectRssFeed(siteUrl: string): Promise<RssDetectionResult> {
  try {
    // Step 0: Check if the URL itself is already an RSS feed
    const directFeedTest = await testFeedUrl(siteUrl);
    if (directFeedTest) {
      console.log(`[RSS Detector] URL is already a valid RSS feed: ${siteUrl}`);
      return { feedUrl: siteUrl };
    }

    // Step 1: Try to find feed link in HTML <head>
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

    if (response.ok) {
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

      if (feedLink) {
        // Resolve relative URLs to absolute
        const feedUrl = new URL(feedLink, siteUrl).toString();
        return { feedUrl };
      }
    }

    // Step 2: If no feed link found in HTML, try common feed paths
    const baseUrl = new URL(siteUrl);
    for (const path of COMMON_FEED_PATHS) {
      const candidateUrl = `${baseUrl.origin}${path}`;

      const isValid = await testFeedUrl(candidateUrl);
      if (isValid) {
        return { feedUrl: candidateUrl };
      }
    }

    return { feedUrl: null };
  } catch (error) {
    // Handle timeout, network errors, or parsing errors gracefully
    console.error(
      `[RSS Detector] Error detecting feed for ${siteUrl}:`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    return { feedUrl: null };
  }
}
