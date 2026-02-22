import { supabase } from '../../lib/supabase.js';
import { createAiProvider } from './provider.js';

type ProcessingSummary = {
  processed: number;
  created: number;
  failed: number;
};

const DEFAULT_BATCH_SIZE = 5;

export class AiSuggestionService {
  static async processNewArticles(
    xAccountId: string,
    batchSize: number = DEFAULT_BATCH_SIZE,
  ): Promise<ProcessingSummary> {
    const provider = createAiProvider();
    const summary: ProcessingSummary = { processed: 0, created: 0, failed: 0 };

    const { data: sites, error: sitesError } = await supabase
      .from('news_sites')
      .select('id')
      .eq('x_account_id', xAccountId);

    if (sitesError || !sites || sites.length === 0) {
      return summary;
    }

    const siteIds = sites.map((site) => site.id);

    const { data: articles, error: articlesError } = await supabase
      .from('scraped_articles')
      .select('id, title, summary, news_site_id')
      .eq('is_processed', false)
      .in('news_site_id', siteIds)
      .order('created_at', { ascending: true });

    if (articlesError || !articles || articles.length === 0) {
      return summary;
    }

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      for (const article of batch) {
        try {
          const suggestion = await provider.generateSuggestion(
            article.title,
            article.summary ?? '',
          );

          const { error: insertError } = await supabase.from('ai_suggestions').insert({
            article_id: article.id,
            x_account_id: xAccountId,
            suggestion_text: suggestion.text,
            hashtags: suggestion.hashtags,
            status: 'pending',
          });

          if (insertError) {
            throw new Error(insertError.message);
          }

          const { error: updateError } = await supabase
            .from('scraped_articles')
            .update({ is_processed: true })
            .eq('id', article.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          summary.processed += 1;
          summary.created += 1;
        } catch {
          summary.failed += 1;
        }
      }
    }

    return summary;
  }

  static async suggestForArticle(articleId: string): Promise<{
    id: string;
    articleId: string;
    xAccountId: string;
    suggestionText: string;
    hashtags: string[];
    status: 'pending' | 'approved' | 'rejected' | 'posted';
    reviewedAt: string | null;
    reviewedBy: string | null;
    createdAt: string;
    updatedAt: string;
  }> {
    const { data: article, error: articleError } = await supabase
      .from('scraped_articles')
      .select('id, title, summary, news_site_id')
      .eq('id', articleId)
      .maybeSingle();

    if (articleError) {
      throw new Error(articleError.message);
    }

    if (!article) {
      throw new Error('Article not found');
    }

    const { data: site, error: siteError } = await supabase
      .from('news_sites')
      .select('x_account_id')
      .eq('id', article.news_site_id)
      .maybeSingle();

    if (siteError) {
      throw new Error(siteError.message);
    }

    if (!site) {
      throw new Error('News site not found');
    }

    const provider = createAiProvider();
    const suggestion = await provider.generateSuggestion(article.title, article.summary ?? '');

    const { data: inserted, error: insertError } = await supabase
      .from('ai_suggestions')
      .insert({
        article_id: article.id,
        x_account_id: site.x_account_id,
        suggestion_text: suggestion.text,
        hashtags: suggestion.hashtags,
        status: 'pending',
      })
      .select(
        'id, article_id, x_account_id, suggestion_text, hashtags, status, reviewed_at, reviewed_by, created_at, updated_at',
      )
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Failed to insert suggestion');
    }

    await supabase.from('scraped_articles').update({ is_processed: true }).eq('id', article.id);

    return {
      id: inserted.id,
      articleId: inserted.article_id,
      xAccountId: inserted.x_account_id,
      suggestionText: inserted.suggestion_text,
      hashtags: inserted.hashtags,
      status: inserted.status,
      reviewedAt: inserted.reviewed_at,
      reviewedBy: inserted.reviewed_by,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }
}
