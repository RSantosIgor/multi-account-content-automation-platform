'use client';

import { useState } from 'react';
import { ExternalLink, Calendar, Building, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

type ArticleSummary = {
  bullets: string[];
};

type Article = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  fullContent: string | null;
  site: {
    id: string;
    name: string;
    url: string;
  } | null;
};

type OriginalArticleStepProps = {
  article: Article;
  hasSuggestion?: boolean;
  itemId?: string;
};

export function OriginalArticleStep({
  article,
  hasSuggestion = true,
  itemId,
}: OriginalArticleStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Try to parse article_summary from the summary field if it's JSON
  let summaryBullets: string[] | null = null;
  try {
    if (article.summary && article.summary.startsWith('{')) {
      const parsed = JSON.parse(article.summary) as ArticleSummary;
      summaryBullets = parsed.bullets;
    }
  } catch {
    // Not JSON, use as plain text
  }

  async function handleProcessArticle() {
    if (!itemId) return;

    setIsProcessing(true);
    try {
      // Step 1: create suggestion (analysis phase)
      const suggestRes = await apiClient<{ data: { id: string } }>(
        `/api/v1/ai/suggest/${article.id}`,
        { method: 'POST' },
      );

      // Step 2: approve immediately → triggers full-content fetch + tweet generation
      await apiClient(`/api/v1/suggestions/${suggestRes.data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      toast.success('Artigo processado! Tweet gerado com sucesso.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao processar artigo';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <h3 className="mb-4 text-lg font-semibold">Artigo Original</h3>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-xl font-bold">{article.title}</h4>
        </div>

        {article.site && (
          <div className="flex items-center gap-2">
            <Building className="text-muted-foreground h-4 w-4" />
            <a
              href={article.site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 text-sm"
            >
              {article.site.name}
            </a>
          </div>
        )}

        {article.publishedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              Publicado em {new Date(article.publishedAt).toLocaleString()}
            </span>
          </div>
        )}

        <div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 inline-flex items-center gap-1 text-sm"
          >
            Ver artigo completo <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {summaryBullets && summaryBullets.length > 0 && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <h5 className="mb-2 text-sm font-semibold">Resumo do Artigo</h5>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {summaryBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!summaryBullets && article.summary && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <p className="text-muted-foreground text-sm">{article.summary}</p>
          </div>
        )}

        {!hasSuggestion && itemId && (
          <Button
            onClick={handleProcessArticle}
            disabled={isProcessing}
            size="sm"
            className="mt-4 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Processar Artigo
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
