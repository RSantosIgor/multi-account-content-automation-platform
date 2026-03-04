export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', id] as const,
  },
  timeline: {
    list: (accountId: string, params?: Record<string, unknown>) =>
      ['timeline', accountId, params] as const,
    item: (itemId: string) => ['timeline', 'item', itemId] as const,
  },
  suggestions: {
    detail: (id: string) => ['suggestions', id] as const,
  },
  pendingPosts: {
    list: (accountId: string) => ['pendingPosts', accountId] as const,
  },
};
