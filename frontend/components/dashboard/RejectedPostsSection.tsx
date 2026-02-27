'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type RejectedSuggestion = {
  id: string;
  status: string;
  createdAt: string;
  articleTitle: string;
  siteName: string | null;
  suggestionText: string | null;
  hashtags: string[];
};

type TimelineResponse = {
  data: Array<{
    id: string;
    type: 'suggestion' | 'post';
    status: string;
    createdAt: string;
    articleTitle?: string;
    siteName?: string | null;
    suggestionText?: string | null;
    hashtags?: string[];
  }>;
};

type RejectedPostsSectionProps = {
  accountId: string;
};

function RejectedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="rounded-lg border border-white/10 p-4">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export function RejectedPostsSection({ accountId }: RejectedPostsSectionProps) {
  const [suggestions, setSuggestions] = useState<RejectedSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    async function fetchRejected() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient<TimelineResponse>(
          `/api/v1/accounts/${accountId}/timeline?status=rejected&limit=50`,
        );

        const rejectedSuggestions = res.data
          .filter((item) => item.type === 'suggestion')
          .map((item) => ({
            id: item.id,
            status: item.status,
            createdAt: item.createdAt,
            articleTitle: item.articleTitle ?? '',
            siteName: item.siteName ?? null,
            suggestionText: item.suggestionText ?? null,
            hashtags: item.hashtags ?? [],
          }));

        setSuggestions(rejectedSuggestions);
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : 'Falha ao carregar sugestões rejeitadas';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchRejected();
  }, [accountId]);

  if (isLoading) return <RejectedSkeleton />;

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
        <h3 className="font-display text-xl">Nenhuma sugestão rejeitada</h3>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Sugestões rejeitadas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="rounded-lg border border-white/10 p-4 opacity-60">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-muted-foreground text-sm">
              {suggestion.siteName ?? 'Sem site'} ·{' '}
              {new Date(suggestion.createdAt).toLocaleString()}
            </div>
            <Badge className="border-red-500/40 bg-red-500/20 text-red-300">rejeitado</Badge>
          </div>
          <div className="mb-2 text-sm font-medium">{suggestion.articleTitle}</div>
          <div className="bg-background rounded-md border border-white/10 p-3 text-sm">
            {suggestion.suggestionText ?? (
              <span className="text-muted-foreground italic">
                Tweet não gerado (rejeitado antes da geração)
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {suggestion.hashtags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link href={`/accounts/${accountId}/timeline/${suggestion.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                Ver Detalhes <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
