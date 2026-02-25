import OpenAI from 'openai';
import { config } from '../../config.js';
import { buildSystemPrompt, buildUserPrompt, parseAiSuggestionResponse } from './prompts.js';
import type { AiProvider, AiSuggestionOutput } from './provider.js';

const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

function fallbackSuggestion(title: string): AiSuggestionOutput {
  return {
    text: title.trim().slice(0, 280),
    hashtags: [],
  };
}

export class DeepseekProvider implements AiProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(model: string = DEFAULT_DEEPSEEK_MODEL) {
    this.client = new OpenAI({
      apiKey: config.DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
    this.model = model;
  }

  async generateSuggestion(title: string, summary: string): Promise<AiSuggestionOutput> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(title, summary) },
        ],
      });

      const rawContent = completion.choices[0]?.message?.content ?? '';
      const parsed = parseAiSuggestionResponse(rawContent);

      if (!parsed.ok) {
        return fallbackSuggestion(title);
      }

      return parsed.data;
    } catch {
      return fallbackSuggestion(title);
    }
  }

  async generateRaw(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return completion.choices[0]?.message?.content ?? '';
    } catch (error) {
      throw error;
    }
  }
}
