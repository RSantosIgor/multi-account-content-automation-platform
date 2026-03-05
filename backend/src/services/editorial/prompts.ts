/**
 * Editorial Pipeline Prompts (EDT-002)
 *
 * Prompts used by the editorial intelligence layer: tagging, clustering, brief generation.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Tagging prompt
// ---------------------------------------------------------------------------

export function buildTaggingPrompt(): string {
  return [
    'Extract 3-5 thematic tags from the following content.',
    'Tags must be:',
    '- Lowercase, in the same language as the content',
    '- Broad enough to cluster with related content (e.g., "inteligência artificial" not "modelo gpt-4")',
    '- Specific enough to be meaningful (e.g., "regulação de criptomoedas" not "tecnologia")',
    '',
    'Respond ONLY with valid JSON: { "tags": [{ "tag": "nome da tag", "confidence": 0.0 }] }',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Tagging response parser
// ---------------------------------------------------------------------------

const tagEntrySchema = z.object({
  tag: z.string().min(1),
  confidence: z.number().min(0).max(1).default(1.0),
});

const taggingResponseSchema = z.object({
  tags: z.array(tagEntrySchema).min(1),
});

export type TagEntry = z.infer<typeof tagEntrySchema>;

function extractJsonObject(rawText: string): string | null {
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return rawText.slice(firstBrace, lastBrace + 1);
}

// ---------------------------------------------------------------------------
// Brief generation prompt
// ---------------------------------------------------------------------------

export function buildBriefPrompt(): string {
  return [
    'You are an editorial advisor for a social media account on X (Twitter).',
    'Given the following collection of related content items about a topic,',
    'create an editorial brief that includes:',
    '',
    '1. A concise context summary (2-3 sentences) explaining what is happening',
    '2. 2-4 suggested posting angles, each with:',
    '   - A short angle description (1 sentence)',
    '   - A rationale for why this angle works (1 sentence)',
    '',
    'Consider: variety of perspectives, engagement potential, timeliness.',
    'Write in the same language as the content.',
    '',
    'Respond ONLY with valid JSON:',
    '{ "context": "...", "angles": [{ "angle": "...", "rationale": "..." }] }',
  ].join('\n');
}

const angleSchema = z.object({
  angle: z.string().min(1),
  rationale: z.string().min(1),
});

const briefResponseSchema = z.object({
  context: z.string().min(1),
  angles: z.array(angleSchema).min(1).max(4),
});

export type BriefAngle = z.infer<typeof angleSchema>;
export type BriefResponse = z.infer<typeof briefResponseSchema>;

export function parseBriefResponse(rawText: string): BriefResponse | null {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    const result = briefResponseSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tagging response parser
// ---------------------------------------------------------------------------

export function parseTaggingResponse(rawText: string): TagEntry[] {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) return [];

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    const result = taggingResponseSchema.safeParse(parsed);
    if (!result.success) return [];

    // Normalise: lowercase + trim + dedup by tag name
    const seen = new Set<string>();
    return result.data.tags
      .map((t) => ({ tag: t.tag.toLowerCase().trim(), confidence: t.confidence }))
      .filter((t) => {
        if (!t.tag || seen.has(t.tag)) return false;
        seen.add(t.tag);
        return true;
      });
  } catch {
    return [];
  }
}
