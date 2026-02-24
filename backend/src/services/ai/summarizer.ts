import type { AiProvider } from './provider.js';
import { parseAiJsonResponse } from './prompts.js';

export interface ArticleSummary {
  bullets: string[];
}

const SUMMARIZE_PROMPT = `You are a professional editor. Given an article, create a concise summary with 3-5 bullet points in the same language as the article.

Rules:
- Each bullet point should be a complete sentence
- Focus on key facts and takeaways
- Keep each bullet under 100 characters
- Write in the same language as the article
- Do NOT include the bullet symbol (•, -, *) - just the text

Respond ONLY with valid JSON: { "bullets": ["point 1", "point 2", ...] }`;

/**
 * Generate bullet-point summary using AI provider
 */
export async function generateArticleSummary(
  aiProvider: AiProvider,
  title: string,
  content: string,
): Promise<ArticleSummary> {
  try {
    // Truncate content to prevent token limit issues (keep first 3000 chars)
    const truncatedContent = content.length > 3000 ? content.substring(0, 3000) + '...' : content;

    // Prepare user message
    const userMessage = `Article Title: ${title}\n\nArticle Content:\n${truncatedContent}`;

    // Call AI provider (reuse generateSuggestion but with different prompt)
    // We'll need to adapt the provider interface - for now, use a workaround
    const response = await callAiForSummary(aiProvider, userMessage);

    // Parse JSON response
    const parsed = parseAiJsonResponse(response);

    // Validate structure
    if (!parsed.bullets || !Array.isArray(parsed.bullets)) {
      throw new Error('Invalid summary format: missing bullets array');
    }

    // Ensure we have 3-5 bullets
    const bullets = parsed.bullets.slice(0, 5);

    if (bullets.length === 0) {
      // Fallback: use title as single bullet
      return { bullets: [title] };
    }

    return {
      bullets: bullets.map((b: string) => b.substring(0, 150)), // Clamp length
    };
  } catch (error) {
    console.error('[Summarizer] Error generating summary:', error);
    // Fallback: return title as single bullet
    return { bullets: [title] };
  }
}

/**
 * Helper to call AI provider with custom prompt
 */
async function callAiForSummary(aiProvider: AiProvider, content: string): Promise<string> {
  return await aiProvider.generateRaw(SUMMARIZE_PROMPT, content);
}
