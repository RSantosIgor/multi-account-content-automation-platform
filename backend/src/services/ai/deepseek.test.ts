import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreate, mockOpenAiConstructor } = vi.hoisted(() => {
  const create = vi.fn();
  const openAiCtor = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create,
      },
    },
  }));

  return { mockCreate: create, mockOpenAiConstructor: openAiCtor };
});

vi.mock('openai', () => ({
  default: mockOpenAiConstructor,
}));

import { DeepseekProvider } from './deepseek.js';

describe('DeepseekProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeepSeek via OpenAI-compatible API', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"text":"DeepSeek suggestion","hashtags":["#ai","#news"]}',
          },
        },
      ],
    });

    const provider = new DeepseekProvider();
    const result = await provider.generateSuggestion('Title', 'Summary');

    expect(mockOpenAiConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: expect.any(String),
        baseURL: 'https://api.deepseek.com',
      }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'deepseek-chat',
      }),
    );

    expect(result).toEqual({
      text: 'DeepSeek suggestion',
      hashtags: ['#ai', '#news'],
    });
  });

  it('handles malformed JSON gracefully without throwing', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'invalid-json' } }],
    });

    const provider = new DeepseekProvider();

    await expect(provider.generateSuggestion('Fallback title', 'summary')).resolves.toEqual({
      text: 'Fallback title',
      hashtags: [],
    });
  });
});
