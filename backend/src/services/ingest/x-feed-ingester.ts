/**
 * X Feed Ingester (SRC-004)
 *
 * Monitors X (Twitter) user timelines, lists, and searches, ingesting
 * relevant tweets as content_items.
 *
 * Reuses the account's encrypted OAuth token already stored in x_accounts
 * (read scope is included in the existing PKCE flow).
 */

import { TwitterApi } from 'twitter-api-v2';
import { supabase } from '../../lib/supabase.js';
import { decrypt } from '../../lib/crypto.js';
import { ContentTagger } from '../editorial/tagger.js';

const MAX_TWEETS = 20;
const MIN_LIKES_DEFAULT = 0;
const MIN_RETWEETS_DEFAULT = 0;

export interface XFeedIngesterResult {
  sourceId: string;
  feedUsername: string;
  itemsIngested: number;
  itemsSkipped: number;
  errors: number;
}

/**
 * Build the plain-text representation of a tweet (or thread).
 * For quote tweets, append the quoted tweet text as context.
 */
function buildTweetContent(tweetText: string, quotedText?: string): string {
  if (!quotedText) return tweetText;
  return `${tweetText}\n\n[Quote]: ${quotedText}`;
}

export class XFeedIngester {
  /**
   * Run ingestion for all active x_feed_sources.
   */
  static async runAll(): Promise<XFeedIngesterResult[]> {
    const { data: sources, error } = await supabase
      .from('x_feed_sources')
      .select('*')
      .eq('is_active', true);

    if (error || !sources) {
      console.error('[XFeed] Failed to fetch sources:', error?.message);
      return [];
    }

    const results: XFeedIngesterResult[] = [];

    for (const source of sources) {
      // Respect per-source interval
      if (source.last_scraped_at) {
        const nextRun = new Date(source.last_scraped_at);
        nextRun.setHours(nextRun.getHours() + source.scraping_interval_hours);
        if (new Date() < nextRun) continue;
      }

      try {
        const result = await XFeedIngester.runSource(source.id);
        results.push(result);
      } catch (err) {
        console.error('[XFeed] runSource failed for', source.id, err);
      }
    }

    return results;
  }

  /**
   * Run ingestion for a single x_feed_source.
   */
  static async runSource(sourceId: string): Promise<XFeedIngesterResult> {
    const { data: source, error: sourceError } = await supabase
      .from('x_feed_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`X feed source not found: ${sourceId}`);
    }

    const result: XFeedIngesterResult = {
      sourceId,
      feedUsername: source.feed_username,
      itemsIngested: 0,
      itemsSkipped: 0,
      errors: 0,
    };

    // Fetch the x_account's token for API auth
    const { data: account, error: accountError } = await supabase
      .from('x_accounts')
      .select('oauth_access_token_enc')
      .eq('id', source.x_account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`X account not found for source ${sourceId}`);
    }

    let accessToken: string;
    try {
      accessToken = decrypt(account.oauth_access_token_enc);
    } catch {
      throw new Error('Failed to decrypt access token');
    }

    const client = new TwitterApi(accessToken);

    // Resolve user ID if not cached
    let userId = source.feed_user_id;
    if (!userId) {
      try {
        const userResponse = await client.v2.userByUsername(source.feed_username, {
          'user.fields': ['id'],
        });
        userId = userResponse.data?.id ?? null;
        if (userId) {
          await supabase.from('x_feed_sources').update({ feed_user_id: userId }).eq('id', sourceId);
        }
      } catch (err) {
        console.error('[XFeed] Failed to resolve user ID:', err);
      }
    }

    if (!userId) {
      await supabase
        .from('x_feed_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);
      return result;
    }

    // Fetch recent tweets
    let tweets: Array<{
      id: string;
      text: string;
      created_at?: string;
      public_metrics?: { like_count: number; retweet_count: number };
      referenced_tweets?: Array<{ type: string; id: string }>;
    }> = [];

    try {
      const timeline = await client.v2.userTimeline(userId, {
        max_results: MAX_TWEETS,
        'tweet.fields': ['created_at', 'public_metrics', 'referenced_tweets'],
        expansions: ['referenced_tweets.id'],
      });

      tweets = timeline.data?.data ?? [];
    } catch (err) {
      console.error('[XFeed] Failed to fetch timeline for', source.feed_username, err);
      await supabase
        .from('x_feed_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', sourceId);
      return result;
    }

    // ingestion_start_date not yet in generated types — cast to access it safely
    const ingestionStartDate =
      (source as unknown as { ingestion_start_date?: string | null }).ingestion_start_date ?? null;

    // Build a map of included referenced tweets for quote context
    const expandedTweets = new Map<string, string>();

    for (const tweet of tweets) {
      const metrics = tweet.public_metrics;
      const likes = metrics?.like_count ?? 0;
      const retweets = metrics?.retweet_count ?? 0;

      if (likes < MIN_LIKES_DEFAULT || retweets < MIN_RETWEETS_DEFAULT) {
        result.itemsSkipped++;
        continue;
      }

      // Skip tweets posted before ingestion_start_date
      if (ingestionStartDate && tweet.created_at && tweet.created_at < ingestionStartDate) {
        result.itemsSkipped++;
        continue;
      }

      // Build content (include quote context if available)
      const quotedRef = tweet.referenced_tweets?.find((r) => r.type === 'quoted');
      const quotedText = quotedRef ? expandedTweets.get(quotedRef.id) : undefined;
      const fullContent = buildTweetContent(tweet.text, quotedText);
      const tweetUrl = `https://x.com/${source.feed_username}/status/${tweet.id}`;

      const metadata = {
        tweetId: tweet.id,
        authorUsername: source.feed_username,
        likes,
        retweets,
        isQuote: !!quotedRef,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('content_items')
        .upsert(
          {
            x_account_id: source.x_account_id,
            source_type: 'x_post',
            source_table: 'x_feed_sources',
            source_record_id: sourceId,
            url: tweetUrl,
            title: tweet.text.slice(0, 100),
            summary: tweet.text,
            full_content: fullContent,
            is_processed: false,
            published_at: tweet.created_at ?? null,
            ingested_at: new Date().toISOString(),
            metadata,
          },
          { onConflict: 'source_type,x_account_id,url', ignoreDuplicates: true },
        )
        .select('id');

      if (insertError) {
        console.error('[XFeed] Insert failed for tweet', tweet.id, insertError.message);
        result.errors++;
      } else if (inserted && inserted.length > 0) {
        // Newly inserted item — tag it immediately
        await ContentTagger.tagContentItem(inserted[0].id);
        result.itemsIngested++;
        // Store tweet text for potential use as quote context by later tweets
        expandedTweets.set(tweet.id, tweet.text);
      } else {
        result.itemsSkipped++;
      }
    }

    await supabase
      .from('x_feed_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sourceId);

    return result;
  }
}
