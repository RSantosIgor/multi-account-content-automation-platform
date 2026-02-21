import * as cheerio from 'cheerio';

/**
 * HTML Scraper Service (SCRAPER-002)
 *
 * Fetches a site URL and extracts articles using CSS selectors (cheerio).
 * Designed for sites without RSS feeds.
 */

const MAX_ARTICLES_PER_RUN = 20;
const FETCH_TIMEOUT_MS = 15_000;
const REQUEST_DELAY_MS = 2_000;

export interface ScrapedArticleInput {
  url: string;
  title: string;
  summary: string | null;
  published_at: string | null;
}

export interface ScrapingConfig {
  article_selector: string;
  title_selector: string;
  summary_selector: string;
  link_selector: string;
}

/**
 * Delay execution for a given number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scrape articles from a site using CSS selectors
 *
 * @param siteUrl - The URL of the site to scrape
 * @param config - CSS selectors for extracting article data
 * @param maxArticles - Maximum number of articles to return (default: 20)
 * @returns Array of scraped article inputs, or empty array on error
 */
export async function scrapeHtml(
  siteUrl: string,
  config: ScrapingConfig,
  maxArticles: number = MAX_ARTICLES_PER_RUN,
): Promise<ScrapedArticleInput[]> {
  try {
    // Polite delay before request
    await delay(REQUEST_DELAY_MS);

    // Fetch site HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    return parseHtml(html, siteUrl, config, maxArticles);
  } catch {
    // Handle network errors, timeouts, parsing errors gracefully
    return [];
  }
}

/**
 * Parse HTML string and extract articles using CSS selectors.
 * Exported separately for unit testing without HTTP.
 */
export function parseHtml(
  html: string,
  baseUrl: string,
  config: ScrapingConfig,
  maxArticles: number = MAX_ARTICLES_PER_RUN,
): ScrapedArticleInput[] {
  const $ = cheerio.load(html);
  const articles: ScrapedArticleInput[] = [];

  $(config.article_selector)
    .slice(0, maxArticles)
    .each((_i, el) => {
      const $el = $(el);

      // Extract title
      const title = $el.find(config.title_selector).first().text().trim();
      if (!title) return;

      // Extract link — try href attribute first, then text content
      const linkEl = $el.find(config.link_selector).first();
      const rawHref = linkEl.attr('href') ?? linkEl.text().trim();
      if (!rawHref) return;

      // Resolve relative URL to absolute
      let url: string;
      try {
        url = new URL(rawHref, baseUrl).toString();
      } catch {
        return; // Skip invalid URLs
      }

      // Extract summary
      const summaryText = $el.find(config.summary_selector).first().text().trim();
      const summary = summaryText ? summaryText.slice(0, 500) : null;

      articles.push({
        url,
        title,
        summary,
        published_at: null, // HTML scraping typically doesn't provide reliable dates
      });
    });

  return articles;
}
