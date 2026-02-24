import { z } from 'zod';

const aiSuggestionSchema = z.object({
  text: z.string().min(1),
  hashtags: z.array(z.string()),
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;

export type ParsedAiSuggestionResult =
  | { ok: true; data: AiSuggestion }
  | { ok: false; error: string };

const MAX_POST_LENGTH = 280;

function normalizeHashtags(hashtags: string[]): string[] {
  const normalized = hashtags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

  return Array.from(new Set(normalized));
}

function clampText(text: string): string {
  return text.trim().slice(0, MAX_POST_LENGTH);
}

function extractJsonObject(rawText: string): string | null {
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return rawText.slice(firstBrace, lastBrace + 1);
}

export function buildSystemPrompt(): string {
  return [
    'You are a social media expert specializing in news content.',
    'Given a news article title and summary, generate a compelling post for X (Twitter).',
    '',
    'Rules:',
    '- The post must be <= 280 characters (including hashtags)',
    '- Write in the same language as the article',
    '- End with 2-3 relevant hashtags',
    '- Be engaging and informative',
    '- Do not use emojis unless the brand voice calls for it',
    '',
    'Respond ONLY with valid JSON: { "text": "...", "hashtags": ["...", "..."] }',
  ].join('\n');
}

export function buildUserPrompt(title: string, summary: string): string {
  return ['Title:', title.trim(), '', 'Summary:', summary.trim()].join('\n');
}

export function parseAiSuggestionResponse(rawText: string): ParsedAiSuggestionResult {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    return { ok: false, error: 'No JSON object found in AI response' };
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    const result = aiSuggestionSchema.safeParse(parsed);

    if (!result.success) {
      return { ok: false, error: 'AI response JSON does not match expected schema' };
    }

    return {
      ok: true,
      data: {
        text: clampText(result.data.text),
        hashtags: normalizeHashtags(result.data.hashtags),
      },
    };
  } catch {
    return { ok: false, error: 'AI response is not valid JSON' };
  }
}

/**
 * Parse generic JSON response from AI (for article summaries, etc.)
 */
export function parseAiJsonResponse(rawText: string): { bullets?: string[] } {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    throw new Error('No JSON object found in AI response');
  }

  try {
    return JSON.parse(jsonText) as { bullets?: string[] };
  } catch {
    throw new Error('AI response is not valid JSON');
  }
}
