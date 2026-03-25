'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { TrendIndicator } from '@/components/editorial/TrendIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, ArrowRight, CheckCircle } from 'lucide-react';

type ClusterMeta = {
  id: string;
  topic: string;
  trend_score: number;
  tags: string[];
};

type SuggestionSummary = {
  id: string;
  suggestion_text: string | null;
  hashtags: string[];
  status: string;
};

type BriefItem = {
  id: string;
  status: string;
  suggested_angles: { angle: string; rationale: string }[];
  selected_angle: string | null;
  editorial_clusters: ClusterMeta | null;
  ai_suggestions?: SuggestionSummary[];
};

type BriefsResponse = {
  data: BriefItem[];
};

interface TrendingSectionProps {
  accountId: string;
}

export function TrendingSection({ accountId }: TrendingSectionProps) {
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    apiClient<BriefsResponse>(`/api/v1/accounts/${accountId}/editorial/briefs?limit=20`)
      .then((res) => {
        // Show briefs that have suggestions, sorted by trend_score
        const withSuggestions = res.data.filter((b) => (b.ai_suggestions?.length ?? 0) > 0);
        const sorted = [...withSuggestions].sort(
          (a, b) =>
            (b.editorial_clusters?.trend_score ?? 0) - (a.editorial_clusters?.trend_score ?? 0),
        );
        setBriefs(sorted.slice(0, 3));
      })
      .catch(() => setBriefs([]))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading || briefs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="text-gold h-4 w-4" />
          <h2 className="text-sm font-semibold">Em Alta</h2>
          <span className="text-muted-foreground text-xs">Clusters com sugestões geradas</span>
        </div>
        <Link
          href={`/accounts/${accountId}/editorial`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {briefs.map((brief) => {
          const cluster = brief.editorial_clusters;
          const suggestionCount = brief.ai_suggestions?.length ?? 0;
          const pendingCount =
            brief.ai_suggestions?.filter((s) => s.status === 'pending').length ?? 0;
          return (
            <div
              key={brief.id}
              className="bg-card/80 space-y-2 rounded-lg border border-white/10 p-3"
            >
              <p className="line-clamp-2 text-sm font-medium leading-snug">
                {cluster?.topic ?? 'Tópico editorial'}
              </p>
              {cluster && <TrendIndicator score={cluster.trend_score} />}
              {cluster && cluster.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {cluster.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <CheckCircle className="text-gold h-3.5 w-3.5" />
                <span className="text-muted-foreground text-xs">
                  {suggestionCount} sugestões
                  {pendingCount > 0 ? ` (${pendingCount} pendentes)` : ''}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/5 w-full text-xs"
                asChild
              >
                <Link href={`/accounts/${accountId}/editorial`}>Ver Sugestões</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
