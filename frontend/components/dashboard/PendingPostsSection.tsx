'use client';

import { AlertCircle, Newspaper, PlaySquare, AtSign, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';

const sourceIcons: Record<string, React.ElementType> = {
  news_article: Newspaper,
  youtube_video: PlaySquare,
  x_post: AtSign,
  newsletter: Mail,
};

const sourceLabels: Record<string, string> = {
  news_article: 'Notícia',
  youtube_video: 'YouTube',
  x_post: 'X',
  newsletter: 'Newsletter',
};
import { SuggestionCard } from '@/components/timeline/SuggestionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/query-keys';

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
  sourceType: string;
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
    sourceType?: string;
  }>;
};

type PendingPostsSectionProps = {
  accountId: string;
};

async function fetchPendingData(accountId: string) {
  const [timelineRes, accountRes] = await Promise.all([
    apiClient<TimelineResponse>(`/api/v1/accounts/${accountId}/timeline?status=pending&limit=50`),
    apiClient<{ data: { isPremium: boolean } }>(`/api/v1/accounts/${accountId}`),
  ]);

  const isPremium = accountRes.data.isPremium;
  const suggestions: PendingSuggestion[] = timelineRes.data
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
      sourceType: item.sourceType ?? 'news_article',
    }));

  return { isPremium, suggestions };
}

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
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.pendingPosts.list(accountId),
    queryFn: () => fetchPendingData(accountId),
    enabled: !!accountId,
  });

  if (isLoading) return <PendingSkeleton />;

  if (error) {
    const msg = error instanceof ApiError ? error.message : 'Falha ao carregar sugestões pendentes';
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="h-4 w-4" />
        {msg}
      </div>
    );
  }

  const suggestions = data?.suggestions ?? [];
  const isPremium = data?.isPremium ?? false;

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
      {suggestions.map((suggestion) => {
        const SourceIcon = sourceIcons[suggestion.sourceType] ?? sourceIcons.news_article;
        const sourceLabel = sourceLabels[suggestion.sourceType] ?? suggestion.sourceType;
        return (
          <div key={suggestion.id} className="rounded-lg border border-white/10 p-4">
            <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-sm">
              <SourceIcon className="h-3.5 w-3.5" />
              <span>{sourceLabel}</span>
              {suggestion.siteName && <span>· {suggestion.siteName}</span>}
              <span>· {new Date(suggestion.createdAt).toLocaleString()}</span>
            </div>
            <div className="mb-3 text-sm font-medium">{suggestion.articleTitle}</div>
            <SuggestionCard accountId={accountId} isPremium={isPremium} suggestion={suggestion} />
          </div>
        );
      })}
    </div>
  );
}
