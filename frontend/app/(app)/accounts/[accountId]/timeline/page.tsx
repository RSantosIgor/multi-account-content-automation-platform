'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { TimelineFilters, type TimelineFiltersState } from '@/components/timeline/TimelineFilters';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type ArticleSummary = {
  bullets: string[];
};

type TimelineItemData =
  | {
      id: string;
      type: 'suggestion';
      status: string;
      createdAt: string;
      articleTitle: string;
      siteId: string;
      siteName: string | null;
      suggestionText: string;
      hashtags: string[];
      articleSummary: ArticleSummary | null;
    }
  | {
      id: string;
      type: 'post';
      status: string;
      createdAt: string;
      publishedAt: string | null;
      content: string;
      xPostUrl: string | null;
      suggestionId: string | null;
      siteId: string | null;
      siteName: string | null;
    };

type TimelineResponse = {
  data: TimelineItemData[];
  pagination: { page: number; limit: number; total: number };
};

type PageProps = {
  params: Promise<{ accountId: string }>;
};

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="space-y-2 rounded-lg border border-white/10 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function TimelinePage({ params }: PageProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [items, setItems] = useState<TimelineItemData[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TimelineFiltersState>({
    status: 'all',
    siteId: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    params.then((p) => setAccountId(p.accountId));
  }, [params]);

  const fetchPage = async (nextPage: number, reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
      });

      if (filters.status !== 'all') query.set('status', filters.status);
      if (filters.siteId) query.set('site_id', filters.siteId);
      if (filters.from) query.set('from', filters.from);
      if (filters.to) query.set('to', filters.to);

      const res = await apiClient<TimelineResponse>(
        `/api/v1/accounts/${accountId}/timeline?${query.toString()}`,
      );

      setPage(nextPage);
      setTotal(res.pagination.total);
      setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load timeline';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accountId) return;
    void fetchPage(1, true);
  }, [accountId, filters.status, filters.siteId, filters.from, filters.to]);

  const hasMore = items.length < total;

  return (
    <section className="space-y-6">
      <Breadcrumb />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight">Timeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sugestões e posts publicados desta conta.
          </p>
        </div>
      </div>

      <TimelineFilters accountId={accountId} value={filters} onChange={setFilters} />

      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isLoading && items.length === 0 ? <TimelineSkeleton /> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <TimelineItem key={`${item.type}-${item.id}`} item={item} accountId={accountId} />
        ))}
      </div>

      {!isLoading && hasMore && (
        <Button variant="outline" onClick={() => fetchPage(page + 1)} className="w-full">
          Carregar mais
        </Button>
      )}
    </section>
  );
}
