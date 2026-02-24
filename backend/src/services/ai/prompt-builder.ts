import { supabase } from '../../lib/supabase.js';

/**
 * Load active prompt rules for an account and combine with base prompt
 */
export async function buildAnalysisPrompt(xAccountId: string, basePrompt: string): Promise<string> {
  try {
    // Load active analysis rules ordered by priority
    const { data: rules, error } = await supabase
      .from('prompt_rules')
      .select('rule_name, prompt_text, priority')
      .eq('x_account_id', xAccountId)
      .eq('rule_type', 'analysis')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('[Prompt Builder] Error loading analysis rules:', error);
      return basePrompt;
    }

    if (!rules || rules.length === 0) {
      return basePrompt;
    }

    // Combine base prompt with custom rules
    const customRules = rules
      .map((rule) => `**${rule.rule_name}**:\n${rule.prompt_text}`)
      .join('\n\n');

    return `${basePrompt}\n\n## Additional Rules:\n\n${customRules}`;
  } catch (error) {
    console.error('[Prompt Builder] Error building analysis prompt:', error);
    return basePrompt;
  }
}

/**
 * Load active publication rules for an account and combine with base prompt
 */
export async function buildPublicationPrompt(
  xAccountId: string,
  basePrompt: string,
): Promise<string> {
  try {
    // Load active publication rules ordered by priority
    const { data: rules, error } = await supabase
      .from('prompt_rules')
      .select('rule_name, prompt_text, priority')
      .eq('x_account_id', xAccountId)
      .eq('rule_type', 'publication')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('[Prompt Builder] Error loading publication rules:', error);
      return basePrompt;
    }

    if (!rules || rules.length === 0) {
      return basePrompt;
    }

    // Combine base prompt with custom rules
    const customRules = rules
      .map((rule) => `**${rule.rule_name}**:\n${rule.prompt_text}`)
      .join('\n\n');

    return `${basePrompt}\n\n## Additional Rules:\n\n${customRules}`;
  } catch (error) {
    console.error('[Prompt Builder] Error building publication prompt:', error);
    return basePrompt;
  }
}
