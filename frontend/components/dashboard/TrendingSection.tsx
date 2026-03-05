'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { TrendIndicator } from '@/components/editorial/TrendIndicator';
import { AngleSelector } from '@/components/editorial/AngleSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flame, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

type ClusterMeta = {
  id: string;
  topic: string;
  trend_score: number;
  tags: string[];
};

type BriefItem = {
  id: string;
  status: string;
  suggested_angles: { angle: string; rationale: string }[];
  selected_angle: string | null;
  editorial_clusters: ClusterMeta | null;
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
  const [dialogBrief, setDialogBrief] = useState<BriefItem | null>(null);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    apiClient<BriefsResponse>(
      `/api/v1/accounts/${accountId}/editorial/briefs?status=draft&limit=20`,
    )
      .then((res) => {
        // Sort by trend_score descending, take top 3
        const sorted = [...res.data].sort(
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
          <span className="text-muted-foreground text-xs">Clusters com briefs prontos</span>
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
              <Button
                size="sm"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/5 w-full text-xs"
                onClick={() => setDialogBrief(brief)}
              >
                Gerar Post
              </Button>
            </div>
          );
        })}
      </div>

      {/* Angle selector dialog */}
      <Dialog open={!!dialogBrief} onOpenChange={(open) => !open && setDialogBrief(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {dialogBrief?.editorial_clusters?.topic ?? 'Gerar Post Editorial'}
            </DialogTitle>
          </DialogHeader>
          {dialogBrief && (
            <AngleSelector
              angles={dialogBrief.suggested_angles}
              preselected={dialogBrief.selected_angle}
              briefId={dialogBrief.id}
              accountId={accountId}
              onGenerated={() => {
                setDialogBrief(null);
                // Remove the used brief from the list
                setBriefs((prev) => prev.filter((b) => b.id !== dialogBrief.id));
                toast.success('Post gerado! Disponível na aba Pendentes.');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
