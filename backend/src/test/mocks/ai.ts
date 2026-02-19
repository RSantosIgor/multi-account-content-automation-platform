import { vi } from 'vitest';

export function createOpenAIMock(responseText = '{"text":"Test post #News","hashtags":["#News"]}') {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: responseText } }],
          model: 'gpt-4o-mini',
        }),
      },
    },
  };
}

export function createAnthropicMock(
  responseText = '{"text":"Test post #News","hashtags":["#News"]}',
) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: responseText }],
        model: 'claude-haiku-4-5-20251001',
      }),
    },
  };
}
