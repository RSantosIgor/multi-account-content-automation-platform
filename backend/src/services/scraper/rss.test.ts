import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeRss } from './rss.js';

// Mock rss-parser
vi.mock('rss-parser', () => {
  const MockParser = vi.fn();
  MockParser.prototype.parseURL = vi.fn();
  return { default: MockParser };
});

import Parser from 'rss-parser';

const mockParseURL = Parser.prototype.parseURL as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scrapeRss', () => {
  it('parses a valid RSS feed and returns articles', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: 'Article One',
          link: 'https://example.com/article-1',
          contentSnippet: 'This is the first article summary.',
          isoDate: '2026-02-20T10:00:00.000Z',
        },
        {
          title: 'Article Two',
          link: 'https://example.com/article-2',
          content: '<p>Second article <strong>content</strong></p>',
          pubDate: 'Wed, 19 Feb 2026 08:00:00 GMT',
        },
      ],
    });

    const articles = await scrapeRss('https://example.com/feed.xml');

    expect(articles).toHaveLength(2);
    expect(articles[0]).toEqual({
      url: 'https://example.com/article-1',
      title: 'Article One',
      summary: 'This is the first article summary.',
      published_at: '2026-02-20T10:00:00.000Z',
    });
    expect(articles[1]).toEqual({
      url: 'https://example.com/article-2',
      title: 'Article Two',
      summary: 'Second article content',
      published_at: '2026-02-19T08:00:00.000Z',
    });
  });

  it('returns empty array on network error', async () => {
    mockParseURL.mockRejectedValue(new Error('Network error'));

    const articles = await scrapeRss('https://unreachable.example.com/feed.xml');

    expect(articles).toEqual([]);
  });

  it('strips HTML from content:encoded field', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: 'HTML Article',
          link: 'https://example.com/html-article',
          'content:encoded':
            '<div><h2>Title</h2><p>Paragraph with <a href="#">link</a> and <em>emphasis</em>.</p></div>',
          isoDate: '2026-02-20T12:00:00.000Z',
        },
      ],
    });

    const articles = await scrapeRss('https://example.com/feed.xml');

    expect(articles).toHaveLength(1);
    // HTML tags are stripped; whitespace between block elements collapses
    expect(articles[0]!.summary).not.toContain('<');
    expect(articles[0]!.summary).toContain('Paragraph with link and emphasis.');
  });

  it('truncates summary to 500 characters', async () => {
    const longContent = 'A'.repeat(600);
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: 'Long Article',
          link: 'https://example.com/long',
          contentSnippet: longContent,
          isoDate: '2026-02-20T12:00:00.000Z',
        },
      ],
    });

    const articles = await scrapeRss('https://example.com/feed.xml');

    expect(articles[0]!.summary!.length).toBeLessThanOrEqual(503); // 500 + '...'
  });

  it('skips items without URL or title', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        { title: 'No Link', link: undefined },
        { title: undefined, link: 'https://example.com/no-title' },
        {
          title: 'Valid',
          link: 'https://example.com/valid',
          contentSnippet: 'Summary',
          isoDate: '2026-02-20T12:00:00.000Z',
        },
      ],
    });

    const articles = await scrapeRss('https://example.com/feed.xml');

    expect(articles).toHaveLength(1);
    expect(articles[0]!.title).toBe('Valid');
  });

  it('respects maxArticles parameter', async () => {
    mockParseURL.mockResolvedValue({
      items: Array.from({ length: 10 }, (_, i) => ({
        title: `Article ${i}`,
        link: `https://example.com/article-${i}`,
        contentSnippet: `Summary ${i}`,
        isoDate: '2026-02-20T12:00:00.000Z',
      })),
    });

    const articles = await scrapeRss('https://example.com/feed.xml', 3);

    expect(articles).toHaveLength(3);
  });

  it('handles empty feed gracefully', async () => {
    mockParseURL.mockResolvedValue({ items: [] });

    const articles = await scrapeRss('https://example.com/feed.xml');

    expect(articles).toEqual([]);
  });
});
