import { TwitterApi, ApiResponseError } from 'twitter-api-v2';
import type { Database } from '../../types/database.js';
import { decrypt, encrypt } from '../../lib/crypto.js';
import { supabase } from '../../lib/supabase.js';

type XAccount = Database['public']['Tables']['x_accounts']['Row'];

export class XApiClient {
  private accessToken: string;
  private refreshToken: string;

  constructor(private xAccount: XAccount) {
    this.accessToken = decrypt(xAccount.oauth_access_token_enc);
    this.refreshToken = decrypt(xAccount.oauth_refresh_token_enc);
  }

  /**
   * Check if the access token is expired or will expire soon (within 5 minutes)
   */
  private isTokenExpired(): boolean {
    if (!this.xAccount.token_expires_at) {
      return false; // No expiry set, assume valid
    }
    const expiresAt = new Date(this.xAccount.token_expires_at);
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    return expiresAt.getTime() - now.getTime() < bufferMs;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    const client = new TwitterApi({
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
    });

    try {
      const { accessToken, refreshToken, expiresIn } = await client.refreshOAuth2Token(
        this.refreshToken,
      );

      // Update tokens in memory
      this.accessToken = accessToken;
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Save encrypted tokens back to database
      const { error } = await supabase
        .from('x_accounts')
        .update({
          oauth_access_token_enc: encrypt(this.accessToken),
          oauth_refresh_token_enc: encrypt(this.refreshToken),
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.xAccount.id);

      if (error) {
        throw new Error(`Failed to save refreshed tokens: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Post a tweet to X
   * @param text The tweet text (max 280 characters)
   * @returns The tweet ID and URL
   */
  async postTweet(text: string): Promise<{ tweetId: string; tweetUrl: string }> {
    // Check if token needs refresh
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const client = new TwitterApi(this.accessToken);

    try {
      const tweet = await client.v2.tweet(text);

      return {
        tweetId: tweet.data.id,
        tweetUrl: `https://x.com/${this.xAccount.x_username}/status/${tweet.data.id}`,
      };
    } catch (error: unknown) {
      // Extract detailed X API error info if available
      if (error instanceof ApiResponseError) {
        const detail = JSON.stringify({
          statusCode: error.code,
          errors: error.errors,
          data: error.data,
        });
        // If we get a 401, try refreshing the token once and retry
        if (error.code === 401) {
          try {
            await this.refreshAccessToken();
            const retryClient = new TwitterApi(this.accessToken);
            const tweet = await retryClient.v2.tweet(text);

            return {
              tweetId: tweet.data.id,
              tweetUrl: `https://x.com/${this.xAccount.x_username}/status/${tweet.data.id}`,
            };
          } catch (retryError) {
            throw new Error(
              `Failed to post tweet after token refresh: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
            );
          }
        }
        throw new Error(`Failed to post tweet: HTTP ${error.code} — ${detail}`);
      }

      // If we get a 401, try refreshing the token once and retry
      const isUnauthorized =
        (error && typeof error === 'object' && 'code' in error && error.code === 401) ||
        (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401);

      if (isUnauthorized) {
        try {
          await this.refreshAccessToken();
          const retryClient = new TwitterApi(this.accessToken);
          const tweet = await retryClient.v2.tweet(text);

          return {
            tweetId: tweet.data.id,
            tweetUrl: `https://x.com/${this.xAccount.x_username}/status/${tweet.data.id}`,
          };
        } catch (retryError) {
          throw new Error(
            `Failed to post tweet after token refresh: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
          );
        }
      }

      throw new Error(
        `Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
