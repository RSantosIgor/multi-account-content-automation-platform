import * as cheerio from 'cheerio';

export interface ArticleContent {
  title: string;
  content: string; // full text content, HTML stripped
}

/**
 * Fetch and parse full article content from URL
 * Returns plain text content with HTML stripped
 */
export async function fetchArticleContent(url: string): Promise<ArticleContent> {
  try {
    // Set timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Fetch article HTML
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try common article content selectors in order of specificity
    const contentSelectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.article-body',
      '.entry-content',
      '.post-content',
      '.content',
      'main article',
      'main',
    ];

    let articleElement: cheerio.Cheerio<cheerio.Element> | null = null;
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        articleElement = element.first();
        break;
      }
    }

    // If no article element found, use body as fallback
    if (!articleElement || articleElement.length === 0) {
      articleElement = $('body');
    }

    // Extract title
    let title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'Untitled';

    // Remove script, style, nav, footer, aside elements
    articleElement.find('script, style, nav, footer, aside, .ad, .advertisement').remove();

    // Extract text from paragraphs, preserving structure
    const paragraphs: string[] = [];
    articleElement.find('p, h2, h3, h4, h5, h6, li').each((_i: number, elem: cheerio.Element) => {
      const text = $(elem).text().trim();
      if (text.length > 20) {
        // Minimum length to avoid noise
        paragraphs.push(text);
      }
    });

    // Join paragraphs with double newlines
    const content = paragraphs.join('\n\n');

    // If content is too short, try getting all text
    if (content.length < 200) {
      const fallbackContent = articleElement.text().replace(/\s+/g, ' ').trim();
      return {
        title,
        content: fallbackContent || 'No content found',
      };
    }

    return {
      title,
      content,
    };
  } catch (error) {
    console.error(`[Article Fetcher] Error fetching article from ${url}:`, error);
    throw error;
  }
}
