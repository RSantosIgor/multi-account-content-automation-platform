import { createClient } from '../supabase/client';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

type ApiOptions = RequestInit & { skipAuth?: boolean };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeader(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? `Bearer ${session.access_token}` : null;
}

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Only set JSON content type when a request body is actually present.
  if (rest.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const authHeader = await getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, body.message ?? response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
