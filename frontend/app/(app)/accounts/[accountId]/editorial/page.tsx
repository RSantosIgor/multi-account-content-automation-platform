'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { ClusterCard } from '@/components/editorial/ClusterCard';
import { BriefDetail } from '@/components/editorial/BriefDetail';
import { apiClient } from '@/lib/api/client';
import type { BriefItem } from '@/components/editorial/ClusterCard';
import { Newspaper } from 'lucide-react';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

type BriefsResponse = {
  data: BriefItem[];
  pagination: { page: number; limit: number; total: number };
};

export default function EditorialPage({ params }: PageProps) {
  const [accountId, setAccountId] = useState<string>('');
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<BriefItem | null>(null);

  useEffect(() => {
    params.then((p) => setAccountId(p.accountId));
  }, [params]);

  useEffect(() => {
    if (!accountId) return;

    setLoading(true);
    apiClient<BriefsResponse>(`/api/v1/accounts/${accountId}/editorial/briefs?limit=50`)
      .then((res) => setBriefs(res.data))
      .catch(() => setBriefs([]))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="font-display text-3xl leading-tight">Painel Editorial</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Clusters de tendências detectados automaticamente. Selecione um ângulo e gere posts
          contextuais.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 py-20 text-center">
          <Newspaper className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">Nenhum cluster editorial detectado ainda.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Os clusters são gerados automaticamente a cada 2 horas com base no conteúdo ingerido.
          </p>
        </div>
      ) : (
        <div className={selectedBrief ? 'flex flex-col gap-6 xl:flex-row' : ''}>
          {/* Cluster grid */}
          <div
            className={
              selectedBrief
                ? 'grid auto-rows-min gap-4 sm:grid-cols-2 xl:flex-1'
                : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {briefs.map((brief) => (
              <ClusterCard
                key={brief.id}
                brief={brief}
                isSelected={selectedBrief?.id === brief.id}
                onSelect={setSelectedBrief}
              />
            ))}
          </div>

          {/* Detail panel */}
          {selectedBrief && (
            <div className="bg-card/90 h-fit w-full rounded-xl border border-white/10 p-5 xl:max-w-md xl:shrink-0">
              <BriefDetail brief={selectedBrief} accountId={accountId} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
