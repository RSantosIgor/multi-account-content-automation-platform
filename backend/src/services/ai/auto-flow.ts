import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from './provider.js';
import { buildPublicationPrompt } from './prompt-builder.js';
import {
  buildSystemPrompt,
  buildFullContentUserPrompt,
  parseAiSuggestionResponse,
} from './prompts.js';
import { generateArticleSummary } from './summarizer.js';
import { fetchArticleContent } from '../scraper/article-fetcher.js';
import { XApiClient } from '../x-api/client.js';
import type { Json } from '../../types/database.js';

/**
 * FLOW-005: Auto-flow service.
 *
 * Handles the fully automatic pipeline for sites with auto_flow=true:
 *   1. Fetch full article content
 *   2. Generate tweet using publication prompt rules + full content
 *   3. Generate bullet-point article summary
 *   4. Publish tweet to X via API
 *   5. Update all related records (suggestion, post, article)
 *
 * Called from processNewArticles() when a site has auto_flow enabled.
 */
export class AutoFlowService {
  /**
   * Process a single eligible article through the full auto-flow pipeline.
   *
   * @param articleId  - scraped_articles.id
   * @param suggestionId - ai_suggestions.id (already created with status=pending)
   * @param xAccountId - x_accounts.id
   */
  static async processEligibleArticle(
    articleId: string,
    suggestionId: string,
    xAccountId: string,
  ): Promise<void> {
    // Fetch article data
    const { data: article, error: articleError } = await supabase
      .from('scraped_articles')
      .select('id, url, title, summary, full_article_content')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error(`Article not found: ${articleError?.message ?? articleId}`);
    }

    // Step 1: Fetch full article content (or reuse cached)
    let content = article.full_article_content;
    if (!content) {
      try {
        const fetched = await fetchArticleContent(article.url);
        content = fetched.content;

        await supabase
          .from('scraped_articles')
          .update({ full_article_content: content })
          .eq('id', article.id);
      } catch (fetchError) {
        console.error('[AutoFlow] Failed to fetch article content:', fetchError);
        content = article.summary ?? article.title;
      }
    }

    const aiProvider = createAiProvider();

    // Step 2: Generate tweet using publication rules + full content
    const publicationPrompt = await buildPublicationPrompt(xAccountId, buildSystemPrompt());
    const rawTweet = await aiProvider.generateRaw(
      publicationPrompt,
      buildFullContentUserPrompt(article.title, content, article.summary ?? undefined),
    );
    const tweetResult = parseAiSuggestionResponse(rawTweet);

    if (!tweetResult.ok) {
      throw new Error(`Tweet generation failed: ${tweetResult.error}`);
    }

    const tweetText = tweetResult.data.text;
    const hashtags = tweetResult.data.hashtags;

    // Step 3: Generate article summary
    const summary = await generateArticleSummary(aiProvider, article.title, content);

    // Step 4: Update suggestion with tweet + summary and mark as approved
    await supabase
      .from('ai_suggestions')
      .update({
        suggestion_text: tweetText,
        hashtags,
        article_summary: summary as unknown as Json,
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId);

    // Step 5: Publish to X
    const { data: account, error: accountError } = await supabase
      .from('x_accounts')
      .select('*')
      .eq('id', xAccountId)
      .single();

    if (accountError || !account) {
      throw new Error(`X account not found: ${accountError?.message ?? xAccountId}`);
    }

    const xApiClient = new XApiClient(account);

    // Compose final text (tweet + hashtags)
    const hashtagSuffix = hashtags.length > 0 ? `\n${hashtags.join(' ')}` : '';
    const finalText = `${tweetText}${hashtagSuffix}`.slice(0, 280);

    try {
      const { tweetId, tweetUrl } = await xApiClient.postTweet(finalText);

      // Save post record
      await supabase.from('posts').insert({
        x_account_id: xAccountId,
        ai_suggestion_id: suggestionId,
        content: finalText,
        status: 'published',
        x_post_id: tweetId,
        x_post_url: tweetUrl,
        published_at: new Date().toISOString(),
      });

      // Mark suggestion as posted
      await supabase.from('ai_suggestions').update({ status: 'posted' }).eq('id', suggestionId);
    } catch (postError) {
      // Save failed post
      await supabase.from('posts').insert({
        x_account_id: xAccountId,
        ai_suggestion_id: suggestionId,
        content: finalText,
        status: 'failed',
        error_message: postError instanceof Error ? postError.message : 'Unknown error',
      });

      console.error('[AutoFlow] Failed to publish tweet:', postError);
      // Don't re-throw — suggestion remains approved, post is marked as failed
    }

    // Mark article as processed
    await supabase.from('scraped_articles').update({ is_processed: true }).eq('id', article.id);
  }
}
