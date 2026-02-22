import { config } from '../../config.js';
import { AnthropicProvider } from './anthropic.js';
import { DeepseekProvider } from './deepseek.js';
import { OpenAiProvider } from './openai.js';

export type AiSuggestionOutput = {
  text: string;
  hashtags: string[];
};

export interface AiProvider {
  generateSuggestion(title: string, summary: string): Promise<AiSuggestionOutput>;
}

export function createAiProvider(): AiProvider {
  if (config.AI_PROVIDER === 'anthropic') {
    return new AnthropicProvider();
  }

  if (config.AI_PROVIDER === 'deepseek') {
    return new DeepseekProvider();
  }

  return new OpenAiProvider();
}
