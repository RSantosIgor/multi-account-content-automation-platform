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
 * Auto-flow service (UNIFY-003).
 *
 * Handles the fully automatic pipeline for sources with auto_flow=true:
 *   1. Fetch full content (from content_items cache or URL)
 *   2. Generate tweet using publication prompt rules + full content
 *   3. Generate bullet-point article summary
 *   4. Publish tweet to X via API
 *   5. Update all related records (suggestion, post, content_item)
 */
export class AutoFlowService {
  /**
   * Process a single eligible content item through the full auto-flow pipeline.
   *
   * @param contentItemId - content_items.id
   * @param suggestionId  - ai_suggestions.id (already created with status=pending)
   * @param xAccountId    - x_accounts.id
   */
  static async processContentItem(
    contentItemId: string,
    suggestionId: string,
    xAccountId: string,
  ): Promise<void> {
    // Fetch content item
    const { data: item, error: itemError } = await supabase
      .from('content_items')
      .select('id, url, title, summary, full_content')
      .eq('id', contentItemId)
      .single();

    if (itemError || !item) {
      throw new Error(`Content item not found: ${itemError?.message ?? contentItemId}`);
    }

    // Step 1: Get full content — use cache or fetch from URL
    let content = item.full_content;
    if (!content) {
      try {
        const fetched = await fetchArticleContent(item.url);
        content = fetched.content;

        // Cache in content_items
        await supabase.from('content_items').update({ full_content: content }).eq('id', item.id);
      } catch (fetchError) {
        console.error('[AutoFlow] Failed to fetch content:', fetchError);
        content = item.summary ?? item.title;
      }
    }

    const aiProvider = createAiProvider();

    // Fetch account language
    const { data: xAccountMeta } = await supabase
      .from('x_accounts')
      .select('language')
      .eq('id', xAccountId)
      .maybeSingle();
    const language = xAccountMeta?.language ?? 'pt-BR';

    // Step 2: Generate tweet using publication rules + full content
    const publicationPrompt = await buildPublicationPrompt(xAccountId, buildSystemPrompt(language));
    const rawTweet = await aiProvider.generateRaw(
      publicationPrompt,
      buildFullContentUserPrompt(item.title, content, item.summary ?? undefined),
    );
    const tweetResult = parseAiSuggestionResponse(rawTweet);

    if (!tweetResult.ok) {
      throw new Error(`Tweet generation failed: ${tweetResult.error}`);
    }

    const tweetText = tweetResult.data.text;
    const hashtags = tweetResult.data.hashtags;

    // Step 3: Generate article summary
    const summary = await generateArticleSummary(aiProvider, item.title, content);

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

    const hashtagSuffix = hashtags.length > 0 ? `\n${hashtags.join(' ')}` : '';
    const finalText = `${tweetText}${hashtagSuffix}`.slice(0, 280);

    try {
      const { tweetId, tweetUrl } = await xApiClient.postTweet(finalText);

      await supabase.from('posts').insert({
        x_account_id: xAccountId,
        ai_suggestion_id: suggestionId,
        content: finalText,
        status: 'published',
        x_post_id: tweetId,
        x_post_url: tweetUrl,
        published_at: new Date().toISOString(),
      });

      await supabase.from('ai_suggestions').update({ status: 'posted' }).eq('id', suggestionId);
    } catch (postError) {
      await supabase.from('posts').insert({
        x_account_id: xAccountId,
        ai_suggestion_id: suggestionId,
        content: finalText,
        status: 'failed',
        error_message: postError instanceof Error ? postError.message : 'Unknown error',
      });

      console.error('[AutoFlow] Failed to publish tweet:', postError);
    }

    // Mark content_item as processed
    await supabase.from('content_items').update({ is_processed: true }).eq('id', item.id);
  }
}
