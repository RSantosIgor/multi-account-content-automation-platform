import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config.js';
import { buildSystemPrompt, buildUserPrompt, parseAiSuggestionResponse } from './prompts.js';
import type { AiProvider, AiSuggestionOutput } from './provider.js';

const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';

function fallbackSuggestion(title: string): AiSuggestionOutput {
  return {
    text: title.trim().slice(0, 280),
    hashtags: [],
  };
}

function getTextContent(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

export class AnthropicProvider implements AiProvider {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(model: string = DEFAULT_ANTHROPIC_MODEL) {
    this.client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    this.model = model;
  }

  async generateSuggestion(title: string, summary: string): Promise<AiSuggestionOutput> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        temperature: 0.4,
        system: buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(title, summary),
          },
        ],
      });

      const rawContent = getTextContent(response.content);
      const parsed = parseAiSuggestionResponse(rawContent);

      if (!parsed.ok) {
        return fallbackSuggestion(title);
      }

      return parsed.data;
    } catch {
      return fallbackSuggestion(title);
    }
  }
}
