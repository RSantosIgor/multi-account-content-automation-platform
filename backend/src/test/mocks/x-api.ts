import { vi } from 'vitest';

export function createXApiMock() {
  return {
    v2: {
      tweet: vi.fn().mockResolvedValue({ data: { id: '123456789', text: 'Test tweet' } }),
      revokeOAuth2Token: vi.fn().mockResolvedValue({}),
    },
    refreshOAuth2Token: vi.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 7200,
    }),
  };
}
