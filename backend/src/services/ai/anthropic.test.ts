import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

import { AnthropicProvider } from './anthropic.js';

describe('AnthropicProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls Anthropic with expected prompt arguments', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '{"text":"Anthropic suggestion","hashtags":["#world","#updates"]}',
        },
      ],
    });

    const provider = new AnthropicProvider();
    const result = await provider.generateSuggestion('Article title', 'Article summary');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        system: expect.stringContaining('social media expert'),
        messages: [
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Article title'),
          }),
        ],
      }),
    );

    expect(result).toEqual({
      text: 'Anthropic suggestion',
      hashtags: ['#world', '#updates'],
    });
  });

  it('handles malformed JSON gracefully without throwing', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'malformed-json',
        },
      ],
    });

    const provider = new AnthropicProvider();

    await expect(provider.generateSuggestion('Title fallback', 'summary')).resolves.toEqual({
      text: 'Title fallback',
      hashtags: [],
    });
  });
});
