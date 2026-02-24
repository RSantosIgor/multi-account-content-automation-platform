import Parser from 'rss-parser';

/**
 * RSS Scraper Service (SCRAPER-001)
 *
 * Fetches and parses an RSS/Atom feed, returning structured article data.
 * Uses rss-parser for feed parsing.
 */

const MAX_ARTICLES_PER_RUN = 20;
const FETCH_TIMEOUT_MS = 15_000;

export interface ScrapedArticleInput {
  url: string;
  title: string;
  summary: string | null;
  published_at: string | null;
}

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text to a maximum length, breaking at word boundaries
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

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
 * Scrape an RSS/Atom feed and return article data
 *
 * @param feedUrl - The URL of the RSS/Atom feed
 * @param maxArticles - Maximum number of articles to return (default: 20)
 * @returns Array of scraped article inputs, or empty array on error
 */
export async function scrapeRss(
  feedUrl: string,
  maxArticles: number = MAX_ARTICLES_PER_RUN,
): Promise<ScrapedArticleInput[]> {
  try {
    // Fetch the feed manually to clean it before parsing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawContent = await response.text();
    const cleanedContent = cleanXmlContent(rawContent);

    // Parse the cleaned XML
    const parser = new Parser();
    const feed = await parser.parseString(cleanedContent);

    const articles: ScrapedArticleInput[] = [];

    for (const item of feed.items.slice(0, maxArticles)) {
      const url = item.link;
      const title = item.title;

      // Skip items without a URL or title
      if (!url || !title) continue;

      // Extract summary: prefer content:encoded (stripped), then contentSnippet, then description
      let summary: string | null = null;
      const contentEncoded = item['content:encoded'] as string | undefined;
      if (contentEncoded) {
        summary = truncate(stripHtml(contentEncoded), 500);
      } else if (item.contentSnippet) {
        summary = truncate(item.contentSnippet.trim(), 500);
      } else if (item.content) {
        summary = truncate(stripHtml(item.content), 500);
      }

      // Parse published date
      let publishedAt: string | null = null;
      if (item.isoDate) {
        publishedAt = item.isoDate;
      } else if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed.toISOString();
        }
      }

      articles.push({
        url,
        title: title.trim(),
        summary,
        published_at: publishedAt,
      });
    }

    return articles;
  } catch (error) {
    // Log error for debugging but return empty array to not break the flow
    console.error(
      `[RSS Scraper] Failed to scrape ${feedUrl}:`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    return [];
  }
}
