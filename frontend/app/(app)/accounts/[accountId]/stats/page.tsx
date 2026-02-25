'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DateRangeFilter, type DateRange } from '@/components/stats/DateRangeFilter';
import { MetricsCards } from '@/components/stats/MetricsCards';
import { PostingChart } from '@/components/stats/PostingChart';
import { Skeleton } from '@/components/ui/skeleton';

type DailyPost = {
  date: string;
  count: number;
};

type Metrics = {
  totalPosts: number;
  avgPerDay: number;
  avgPerWeek: number;
  avgPerMonth: number;
};

type StatsResponse = {
  data: {
    dailyPosts: DailyPost[];
    metrics: Metrics;
  };
};

type PageProps = {
  params: Promise<{ accountId: string }>;
};

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function StatsPage({ params }: PageProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: '',
    to: '',
  });

  useEffect(() => {
    params.then((p) => setAccountId(p.accountId));
  }, [params]);

  useEffect(() => {
    if (!accountId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (dateRange.from) query.set('from', dateRange.from);
        if (dateRange.to) query.set('to', dateRange.to);

        const res = await apiClient<StatsResponse>(
          `/api/v1/accounts/${accountId}/stats?${query.toString()}`,
        );

        setStats(res.data);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao carregar estatísticas';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, [accountId, dateRange]);

  return (
    <section className="space-y-6">
      <Breadcrumb />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight">Estatísticas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Métricas e atividade de publicação desta conta.
          </p>
        </div>
      </div>

      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="space-y-6">
          <MetricsCards metrics={stats.metrics} />
          <PostingChart data={stats.dailyPosts} />
        </div>
      ) : null}
    </section>
  );
}
