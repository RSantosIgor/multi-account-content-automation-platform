import { describe, it, expect } from 'vitest';
import { parseHtml, type ScrapingConfig } from './html.js';

const BASE_URL = 'https://example.com';

const defaultConfig: ScrapingConfig = {
  article_selector: '.article',
  title_selector: 'h2',
  summary_selector: 'p.summary',
  link_selector: 'a.read-more',
};

const sampleHtml = `
<html>
<body>
  <div class="article">
    <h2>First Article</h2>
    <p class="summary">This is the first article summary.</p>
    <a class="read-more" href="/articles/first">Read more</a>
  </div>
  <div class="article">
    <h2>Second Article</h2>
    <p class="summary">This is the second article summary.</p>
    <a class="read-more" href="https://example.com/articles/second">Read more</a>
  </div>
  <div class="article">
    <h2>Third Article</h2>
    <p class="summary">Third summary here.</p>
    <a class="read-more" href="/articles/third">Read more</a>
  </div>
</body>
</html>
`;

describe('parseHtml', () => {
  it('extracts articles from HTML with given selectors', () => {
    const articles = parseHtml(sampleHtml, BASE_URL, defaultConfig);

    expect(articles).toHaveLength(3);
    expect(articles[0]).toEqual({
      url: 'https://example.com/articles/first',
      title: 'First Article',
      summary: 'This is the first article summary.',
      published_at: null,
    });
    expect(articles[1]).toEqual({
      url: 'https://example.com/articles/second',
      title: 'Second Article',
      summary: 'This is the second article summary.',
      published_at: null,
    });
  });

  it('resolves relative URLs to absolute', () => {
    const articles = parseHtml(sampleHtml, BASE_URL, defaultConfig);

    expect(articles[0]!.url).toBe('https://example.com/articles/first');
    expect(articles[2]!.url).toBe('https://example.com/articles/third');
  });

  it('returns empty array when selectors produce no matches', () => {
    const config: ScrapingConfig = {
      article_selector: '.nonexistent',
      title_selector: 'h1',
      summary_selector: 'p',
      link_selector: 'a',
    };

    const articles = parseHtml(sampleHtml, BASE_URL, config);

    expect(articles).toEqual([]);
  });

  it('skips articles without a title', () => {
    const html = `
      <div class="article">
        <h2></h2>
        <p class="summary">No title here.</p>
        <a class="read-more" href="/no-title">Read more</a>
      </div>
      <div class="article">
        <h2>Valid Title</h2>
        <p class="summary">Valid summary.</p>
        <a class="read-more" href="/valid">Read more</a>
      </div>
    `;

    const articles = parseHtml(html, BASE_URL, defaultConfig);

    expect(articles).toHaveLength(1);
    expect(articles[0]!.title).toBe('Valid Title');
  });

  it('skips articles without a link', () => {
    const html = `
      <div class="article">
        <h2>No Link</h2>
        <p class="summary">Summary.</p>
      </div>
      <div class="article">
        <h2>Has Link</h2>
        <p class="summary">Summary.</p>
        <a class="read-more" href="/valid">Read</a>
      </div>
    `;

    const articles = parseHtml(html, BASE_URL, defaultConfig);

    expect(articles).toHaveLength(1);
    expect(articles[0]!.title).toBe('Has Link');
  });

  it('respects maxArticles parameter', () => {
    const articles = parseHtml(sampleHtml, BASE_URL, defaultConfig, 2);

    expect(articles).toHaveLength(2);
  });

  it('handles null summary when selector matches empty content', () => {
    const html = `
      <div class="article">
        <h2>Title</h2>
        <p class="summary"></p>
        <a class="read-more" href="/link">Read</a>
      </div>
    `;

    const articles = parseHtml(html, BASE_URL, defaultConfig);

    expect(articles).toHaveLength(1);
    expect(articles[0]!.summary).toBeNull();
  });
});
