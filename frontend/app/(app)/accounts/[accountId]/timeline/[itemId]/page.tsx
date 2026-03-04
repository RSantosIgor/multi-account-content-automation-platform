'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DetailStepper } from '@/components/timeline/detail/DetailStepper';
import { queryKeys } from '@/lib/query-keys';

type ArticleSummary = {
  bullets: string[];
};

type TimelineItemDetail = {
  type: 'suggestion' | 'post';
  suggestion: {
    id: string;
    articleId: string;
    xAccountId: string;
    status: string;
    suggestionText: string | null;
    hashtags: string[];
    articleSummary: ArticleSummary | null;
    createdAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
  } | null;
  article: {
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
  } | null;
  post: {
    id: string;
    content: string;
    status: string;
    xPostUrl: string | null;
    xPostId: string | null;
    publishedAt: string | null;
    createdAt: string;
    errorMessage: string | null;
    suggestionId?: string | null;
  } | null;
};

type ItemDetailResponse = {
  data: TimelineItemDetail;
};

type PageProps = {
  params: Promise<{ accountId: string; itemId: string }>;
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function TimelineItemDetailPage({ params }: PageProps) {
  const { accountId, itemId } = use(params);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.timeline.item(itemId),
    queryFn: () => apiClient<ItemDetailResponse>(`/api/v1/timeline/items/${itemId}`),
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <DetailSkeleton />
      </section>
    );
  }

  if (error || !data) {
    const msg = error instanceof ApiError ? error.message : 'Falha ao carregar detalhes';
    return (
      <section className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          {msg}
        </div>
      </section>
    );
  }

  const item = data.data;

  return (
    <section className="space-y-6">
      <Breadcrumb />

      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Timeline
      </Button>

      <div>
        <h1 className="font-display text-3xl leading-tight">
          {item.article?.title ?? 'Detalhes do Item'}
        </h1>
        {item.article?.site && (
          <p className="text-muted-foreground mt-1 text-sm">Fonte: {item.article.site.name}</p>
        )}
      </div>

      <DetailStepper item={item} accountId={accountId} itemId={itemId} />
    </section>
  );
}
