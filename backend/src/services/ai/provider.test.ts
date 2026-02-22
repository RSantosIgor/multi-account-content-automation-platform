import { describe, expect, it, vi } from 'vitest';

describe('createAiProvider', () => {
  it('returns OpenAiProvider when AI_PROVIDER is openai', async () => {
    vi.resetModules();

    vi.doMock('../../config.js', () => ({
      config: {
        AI_PROVIDER: 'openai',
        OPENAI_API_KEY: 'sk-test',
        ANTHROPIC_API_KEY: 'sk-ant-test',
        DEEPSEEK_API_KEY: 'sk-deepseek-test',
      },
    }));

    const { createAiProvider } = await import('./provider.js');
    const provider = createAiProvider();

    expect(provider.constructor.name).toBe('OpenAiProvider');
  });

  it('returns AnthropicProvider when AI_PROVIDER is anthropic', async () => {
    vi.resetModules();

    vi.doMock('../../config.js', () => ({
      config: {
        AI_PROVIDER: 'anthropic',
        OPENAI_API_KEY: 'sk-test',
        ANTHROPIC_API_KEY: 'sk-ant-test',
        DEEPSEEK_API_KEY: 'sk-deepseek-test',
      },
    }));

    const { createAiProvider } = await import('./provider.js');
    const provider = createAiProvider();

    expect(provider.constructor.name).toBe('AnthropicProvider');
  });

  it('returns DeepseekProvider when AI_PROVIDER is deepseek', async () => {
    vi.resetModules();

    vi.doMock('../../config.js', () => ({
      config: {
        AI_PROVIDER: 'deepseek',
        OPENAI_API_KEY: 'sk-test',
        ANTHROPIC_API_KEY: 'sk-ant-test',
        DEEPSEEK_API_KEY: 'sk-deepseek-test',
      },
    }));

    const { createAiProvider } = await import('./provider.js');
    const provider = createAiProvider();

    expect(provider.constructor.name).toBe('DeepseekProvider');
  });
});
