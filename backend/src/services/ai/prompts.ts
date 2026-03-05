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

export function buildSystemPrompt(language = 'pt-BR'): string {
  return [
    'You are a social media expert specializing in news content.',
    'Given a news article title and summary, generate a compelling post for X (Twitter).',
    '',
    'Rules:',
    '- The post must be <= 280 characters (including hashtags)',
    '- Be engaging and informative',
    '- Do not use emojis unless the brand voice calls for it',
    '',
    `IMPORTANT: Generate all content in the following language: ${language}`,
    'Ensure the tone and vocabulary are appropriate for native speakers of that language.',
    '',
    'Respond ONLY with valid JSON: { "text": "...", "hashtags": ["...", "..."] }',
  ].join('\n');
}

export function buildUserPrompt(title: string, summary: string): string {
  return ['Title:', title.trim(), '', 'Summary:', summary.trim()].join('\n');
}

/**
 * Build user prompt using full article content (used on approval / auto-flow).
 * Falls back to summary if full content is empty.
 */
export function buildFullContentUserPrompt(
  title: string,
  fullContent: string,
  summary?: string,
): string {
  const body = fullContent.trim() || summary?.trim() || '';
  return ['Title:', title.trim(), '', 'Full article:', body].join('\n');
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

// --- Analysis Phase (FLOW-003) ---

const analysisResponseSchema = z.object({
  eligible: z.boolean(),
  reason: z.string().optional().default(''),
});

export type AnalysisResult = { eligible: boolean; reason: string };

export function buildAnalysisSystemPrompt(language = 'pt-BR'): string {
  return [
    'You are a content editor. Evaluate if the following news article is suitable for posting on X (Twitter).',
    'Consider: relevance, timeliness, engagement potential, and appropriateness.',
    '',
    `The target audience communicates in: ${language}`,
    '',
    'Respond ONLY with valid JSON: { "eligible": true, "reason": "brief explanation" }',
    'or { "eligible": false, "reason": "brief explanation" }',
  ].join('\n');
}

export function parseAnalysisResponse(rawText: string): AnalysisResult {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    // Default to eligible when we can't parse — don't discard articles silently
    return { eligible: true, reason: 'Failed to parse analysis response' };
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    const result = analysisResponseSchema.safeParse(parsed);
    if (!result.success) {
      return { eligible: true, reason: 'Invalid analysis response format' };
    }
    return { eligible: result.data.eligible, reason: result.data.reason };
  } catch {
    return { eligible: true, reason: 'Analysis response is not valid JSON' };
  }
}

// --- Contextual Publication (EDT-006) ---

/**
 * System prompt for multi-source contextual tweet generation.
 * Used when generating suggestions from editorial briefs.
 */
export function buildContextualPublicationPrompt(): string {
  return [
    'You are a social media expert writing for X (Twitter).',
    'You have been given:',
    '1. An editorial context about a trending topic',
    '2. A specific angle to take',
    '3. Full content from multiple source articles',
    '',
    'Generate an engaging tweet that:',
    '- Takes the specified angle on the topic',
    '- Synthesizes information from MULTIPLE sources (not just one)',
    '- Feels authentic and informed, not like a generic news reshare',
    '- Is at most 280 characters (including hashtags)',
    '- Includes 1–3 relevant hashtags if naturally fitting, or none if not',
    '',
    'Respond ONLY with valid JSON: { "text": "...", "hashtags": ["...", "..."] }',
  ].join('\n');
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
