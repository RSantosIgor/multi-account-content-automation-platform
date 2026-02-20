import { createHash, randomBytes } from 'node:crypto';
import { config } from '../../config.js';
import { supabase } from '../../lib/supabase.js';
import { encrypt } from '../../lib/crypto.js';

const X_AUTHORIZE_URL = 'https://x.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.x.com/2/oauth2/token';
const X_ME_URL = 'https://api.x.com/2/users/me?user.fields=profile_image_url,name,username';

const OAUTH_SCOPE = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' ');

type TokenExchangeResponse = {
  token_type: string;
  expires_in?: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
};

type XUserResponse = {
  data?: {
    id: string;
    username: string;
    name?: string;
    profile_image_url?: string;
  };
};

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createCodeVerifier(): string {
  return toBase64Url(randomBytes(64));
}

function createCodeChallenge(codeVerifier: string): string {
  const digest = createHash('sha256').update(codeVerifier).digest();
  return toBase64Url(digest);
}

function buildAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.X_CLIENT_ID,
    redirect_uri: config.X_CALLBACK_URL,
    scope: OAUTH_SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${X_AUTHORIZE_URL}?${params.toString()}`;
}

function buildBasicAuthHeader(clientId: string, clientSecret: string): string {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${token}`;
}

export class XOAuthService {
  static async createAuthorizationUrl(userId: string): Promise<string> {
    const codeVerifier = createCodeVerifier();
    const codeChallenge = createCodeChallenge(codeVerifier);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('oauth_state')
      .insert({
        user_id: userId,
        code_verifier: codeVerifier,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`Failed to persist oauth state: ${error?.message ?? 'unknown error'}`);
    }

    return buildAuthorizationUrl(data.id, codeChallenge);
  }

  static async handleCallback(code: string, state: string): Promise<void> {
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_state')
      .select('id, user_id, code_verifier, expires_at')
      .eq('id', state)
      .maybeSingle();

    if (stateError || !stateData) {
      throw new Error('INVALID_OAUTH_STATE');
    }

    const expiresAt = new Date(stateData.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      await supabase.from('oauth_state').delete().eq('id', state);
      throw new Error('EXPIRED_OAUTH_STATE');
    }

    const tokens = await this.exchangeCodeForTokens(code, stateData.code_verifier);
    if (!tokens.refresh_token) {
      throw new Error('Missing refresh token in OAuth callback');
    }

    const xUser = await this.fetchXUser(tokens.access_token);
    const tokenExpiresAt =
      typeof tokens.expires_in === 'number'
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

    const { error: upsertError } = await supabase.from('x_accounts').upsert(
      {
        user_id: stateData.user_id,
        x_user_id: xUser.id,
        x_username: xUser.username,
        x_display_name: xUser.name ?? null,
        x_profile_image_url: xUser.profile_image_url ?? null,
        oauth_access_token_enc: encrypt(tokens.access_token),
        oauth_refresh_token_enc: encrypt(tokens.refresh_token),
        token_expires_at: tokenExpiresAt,
        is_active: true,
      },
      {
        onConflict: 'user_id,x_user_id',
      },
    );

    if (upsertError) {
      throw new Error(`Failed to persist X account: ${upsertError.message}`);
    }

    const { error: deleteError } = await supabase.from('oauth_state').delete().eq('id', state);
    if (deleteError) {
      throw new Error(`Failed to cleanup oauth state: ${deleteError.message}`);
    }
  }

  private static async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<TokenExchangeResponse> {
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.X_CALLBACK_URL,
      code_verifier: codeVerifier,
      client_id: config.X_CLIENT_ID,
    });

    const response = await fetch(X_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: buildBasicAuthHeader(config.X_CLIENT_ID, config.X_CLIENT_SECRET),
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed with status ${response.status}`);
    }

    return (await response.json()) as TokenExchangeResponse;
  }

  private static async fetchXUser(
    accessToken: string,
  ): Promise<NonNullable<XUserResponse['data']>> {
    const response = await fetch(X_ME_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch X user profile with status ${response.status}`);
    }

    const payload = (await response.json()) as XUserResponse;
    if (!payload.data) {
      throw new Error('X user response is missing data');
    }

    return payload.data;
  }
}
