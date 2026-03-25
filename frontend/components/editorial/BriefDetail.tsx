'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendIndicator } from './TrendIndicator';
import { ExternalLink, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { BriefItem } from './ClusterCard';
import { apiClient } from '@/lib/api/client';

type ContentItemRow = {
  content_item_id: string;
  relevance_score: number;
  content_items: {
    id: string;
    title: string;
    summary: string | null;
    source_type: string;
    url: string;
    published_at: string | null;
  } | null;
};

type GeneratedSuggestion = {
  id: string;
  suggestion_text: string | null;
  hashtags: string[];
  status: string;
  article_summary: { bullets: string[] } | null;
  created_at: string;
};

type BriefDetailData = BriefItem & {
  editorial_clusters: NonNullable<BriefItem['editorial_clusters']> & {
    cluster_items: ContentItemRow[];
  };
  ai_suggestions: GeneratedSuggestion[];
};

const suggestionStatusConfig: Record<
  string,
  { icon: typeof CheckCircle; label: string; color: string }
> = {
  pending: { icon: Clock, label: 'Pendente', color: 'text-yellow-400' },
  approved: { icon: CheckCircle, label: 'Aprovado', color: 'text-blue-400' },
  posted: { icon: CheckCircle, label: 'Publicado', color: 'text-green-400' },
  rejected: { icon: XCircle, label: 'Rejeitado', color: 'text-red-400' },
};

interface BriefDetailProps {
  brief: BriefItem;
  accountId: string;
}

export function BriefDetail({ brief, accountId }: BriefDetailProps) {
  const [detail, setDetail] = useState<BriefDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDetail(null);
    setLoading(true);

    apiClient<{ data: BriefDetailData }>(
      `/api/v1/accounts/${accountId}/editorial/briefs/${brief.id}`,
    )
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [brief.id, accountId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!detail) {
    return <p className="text-muted-foreground text-sm">Não foi possível carregar o brief.</p>;
  }

  const cluster = detail.editorial_clusters;
  const suggestions = detail.ai_suggestions ?? [];

  return (
    <div className="space-y-5">
      {/* Cluster header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="text-gold h-4 w-4" />
          <h3 className="font-semibold">{cluster.topic}</h3>
        </div>
        <TrendIndicator score={cluster.trend_score} />
        <div className="flex flex-wrap gap-1 pt-1">
          {cluster.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Editorial context */}
      {detail.brief_text && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Contexto editorial</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{detail.brief_text}</p>
        </div>
      )}

      {/* Source items */}
      {cluster.cluster_items.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Fontes ({cluster.cluster_items.length})</p>
          <ul className="space-y-2">
            {cluster.cluster_items.slice(0, 5).map((ci) => {
              const item = ci.content_items;
              if (!item) return null;
              return (
                <li key={ci.content_item_id} className="bg-muted/30 rounded-md p-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-snug">{item.title}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {item.summary && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                      {item.summary}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-1 text-xs">
                    {item.source_type}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Separator />

      {/* Auto-generated suggestions (EDT-009) */}
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Sugestões geradas ({suggestions.length})</p>
          {suggestions.map((sug) => {
            const config = suggestionStatusConfig[sug.status] ?? suggestionStatusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div
                key={sug.id}
                className="bg-muted/40 space-y-2 rounded-lg border border-white/10 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>
                {sug.suggestion_text ? (
                  <p className="text-sm leading-relaxed">{sug.suggestion_text}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Aguardando geração...</p>
                )}
                {sug.hashtags.length > 0 && (
                  <p className="text-muted-foreground text-xs">{sug.hashtags.join(' ')}</p>
                )}
              </div>
            );
          })}
          <p className="text-muted-foreground text-xs">
            Disponíveis na Timeline para revisão e publicação.
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Nenhuma sugestão gerada ainda.</p>
      )}
    </div>
  );
}
