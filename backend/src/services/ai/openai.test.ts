import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

import { OpenAiProvider } from './openai.js';

describe('OpenAiProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls OpenAI with expected prompt arguments', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"text":"A short post","hashtags":["#news","#tech"]}',
          },
        },
      ],
    });

    const provider = new OpenAiProvider();
    const result = await provider.generateSuggestion('Sample title', 'Sample summary');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Sample title'),
          }),
        ]),
      }),
    );

    expect(result).toEqual({
      text: 'A short post',
      hashtags: ['#news', '#tech'],
    });
  });

  it('handles malformed JSON gracefully without throwing', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'not json response',
          },
        },
      ],
    });

    const provider = new OpenAiProvider();

    await expect(provider.generateSuggestion('Fallback title', 'summary')).resolves.toEqual({
      text: 'Fallback title',
      hashtags: [],
    });
  });
});
