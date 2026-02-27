'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { SuggestionCard } from '@/components/timeline/SuggestionCard';
import { Skeleton } from '@/components/ui/skeleton';

type ArticleSummary = {
  bullets: string[];
};

type PendingSuggestion = {
  id: string;
  status: string;
  createdAt: string;
  articleTitle: string;
  siteId: string;
  siteName: string | null;
  suggestionText: string | null;
  hashtags: string[];
  articleSummary: ArticleSummary | null;
};

type TimelineResponse = {
  data: Array<{
    id: string;
    type: 'suggestion' | 'post';
    status: string;
    createdAt: string;
    articleTitle?: string;
    siteId?: string;
    siteName?: string | null;
    suggestionText?: string | null;
    hashtags?: string[];
    articleSummary?: ArticleSummary | null;
  }>;
};

type PendingPostsSectionProps = {
  accountId: string;
};

function PendingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="rounded-lg border border-white/10 p-4">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PendingPostsSection({ accountId }: PendingPostsSectionProps) {
  const [suggestions, setSuggestions] = useState<PendingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    async function fetchPending() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient<TimelineResponse>(
          `/api/v1/accounts/${accountId}/timeline?status=pending&limit=50`,
        );

        const pendingSuggestions = res.data
          .filter((item) => item.type === 'suggestion')
          .map((item) => ({
            id: item.id,
            status: item.status,
            createdAt: item.createdAt,
            articleTitle: item.articleTitle ?? '',
            siteId: item.siteId ?? '',
            siteName: item.siteName ?? null,
            suggestionText: item.suggestionText ?? null,
            hashtags: item.hashtags ?? [],
            articleSummary: item.articleSummary ?? null,
          }));

        setSuggestions(pendingSuggestions);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao carregar sugestões pendentes';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPending();
  }, [accountId]);

  if (isLoading) return <PendingSkeleton />;

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-card/70 rounded-xl border border-dashed border-white/15 p-8 text-center">
        <h3 className="font-display text-xl">Nenhuma sugestão pendente</h3>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Todas as sugestões foram revisadas. Aguarde novos artigos serem coletados!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="rounded-lg border border-white/10 p-4">
          <div className="text-muted-foreground mb-2 text-sm">
            {suggestion.siteName ?? 'Sem site'} · {new Date(suggestion.createdAt).toLocaleString()}
          </div>
          <div className="mb-3 text-sm font-medium">{suggestion.articleTitle}</div>
          <SuggestionCard accountId={accountId} suggestion={suggestion} />
        </div>
      ))}
    </div>
  );
}
