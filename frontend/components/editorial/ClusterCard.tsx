'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendIndicator } from './TrendIndicator';
import { Layers, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BriefItem = {
  id: string;
  status: 'draft' | 'approved' | 'used' | 'dismissed';
  brief_text: string | null;
  suggested_angles: { angle: string; rationale: string }[];
  selected_angle: string | null;
  created_at: string;
  updated_at: string;
  editorial_clusters: {
    id: string;
    topic: string;
    tags: string[];
    trend_score: number;
    item_count: number;
    source_type_count: number;
    time_window_start: string;
    time_window_end: string;
  } | null;
};

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  used: 'bg-muted text-muted-foreground',
  dismissed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  approved: 'Aprovado',
  used: 'Usado',
  dismissed: 'Descartado',
};

interface ClusterCardProps {
  brief: BriefItem;
  isSelected: boolean;
  onSelect: (brief: BriefItem) => void;
}

export function ClusterCard({ brief, isSelected, onSelect }: ClusterCardProps) {
  const cluster = brief.editorial_clusters;

  return (
    <Card
      className={cn(
        'bg-card/90 cursor-pointer border-white/10 transition-all',
        isSelected ? 'border-gold/60 ring-gold/20 ring-2' : 'hover:border-white/20',
        brief.status === 'used' && 'opacity-60',
      )}
      onClick={() => onSelect(brief)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            {cluster?.topic ?? '(sem tópico)'}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs', statusColors[brief.status] ?? '')}
          >
            {statusLabels[brief.status] ?? brief.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Trend score */}
        {cluster && <TrendIndicator score={cluster.trend_score} />}

        {/* Cluster metadata */}
        {cluster && (
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {cluster.item_count} itens
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {cluster.source_type_count} tipos de fonte
            </span>
          </div>
        )}

        {/* Tags */}
        {cluster && cluster.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cluster.tags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Brief angles count */}
        {brief.suggested_angles.length > 0 && (
          <p className="text-muted-foreground text-xs">
            {brief.suggested_angles.length} ângulos sugeridos
          </p>
        )}

        <Button
          size="sm"
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(brief);
          }}
        >
          {brief.status === 'used' ? 'Ver Brief' : 'Selecionar Ângulo'}
        </Button>
      </CardContent>
    </Card>
  );
}
