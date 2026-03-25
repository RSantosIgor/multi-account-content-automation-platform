'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendIndicator } from './TrendIndicator';
import { Layers, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BriefSuggestionSummary = {
  id: string;
  suggestion_text: string | null;
  hashtags: string[];
  status: string;
};

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
  ai_suggestions?: BriefSuggestionSummary[];
};

/** Returns a badge describing the aggregate status of suggestions for this brief. */
function SuggestionStatusBadge({ suggestions }: { suggestions: BriefSuggestionSummary[] }) {
  if (suggestions.length === 0) return null;

  const pending = suggestions.filter((s) => s.status === 'pending').length;
  const posted = suggestions.filter((s) => s.status === 'posted').length;
  const approved = suggestions.filter((s) => s.status === 'approved').length;

  if (pending > 0) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-400"
      >
        {pending} pendente{pending > 1 ? 's' : ''}
      </Badge>
    );
  }
  if (approved > 0) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-blue-500/20 bg-blue-500/10 text-xs text-blue-400"
      >
        {approved} aprovada{approved > 1 ? 's' : ''}
      </Badge>
    );
  }
  if (posted > 0) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-green-500/20 bg-green-500/10 text-xs text-green-400"
      >
        {posted} publicada{posted > 1 ? 's' : ''}
      </Badge>
    );
  }
  // All rejected
  return (
    <Badge variant="outline" className="text-muted-foreground shrink-0 border-white/10 text-xs">
      rejeitadas
    </Badge>
  );
}

interface ClusterCardProps {
  brief: BriefItem;
  isSelected: boolean;
  onSelect: (brief: BriefItem) => void;
}

export function ClusterCard({ brief, isSelected, onSelect }: ClusterCardProps) {
  const cluster = brief.editorial_clusters;
  const suggestions = brief.ai_suggestions ?? [];
  const isDismissed = brief.status === 'dismissed';

  return (
    <Card
      className={cn(
        'bg-card/90 cursor-pointer border-white/10 transition-all',
        isSelected ? 'border-gold/60 ring-gold/20 ring-2' : 'hover:border-white/20',
        isDismissed && 'opacity-50',
      )}
      onClick={() => onSelect(brief)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            {cluster?.topic ?? '(sem tópico)'}
          </CardTitle>
          {suggestions.length > 0 ? (
            <SuggestionStatusBadge suggestions={suggestions} />
          ) : isDismissed ? (
            <Badge
              variant="outline"
              className="shrink-0 border-red-500/20 bg-red-500/10 text-xs text-red-400"
            >
              Descartado
            </Badge>
          ) : null}
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

        {/* Suggestion count */}
        {suggestions.length > 0 ? (
          <p className="text-muted-foreground text-xs">{suggestions.length} sugestões geradas</p>
        ) : brief.suggested_angles.length > 0 ? (
          <p className="text-muted-foreground text-xs">
            {brief.suggested_angles.length} ângulos sugeridos
          </p>
        ) : null}

        <Button
          size="sm"
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(brief);
          }}
        >
          {suggestions.length > 0 ? 'Ver Sugestões' : 'Ver Brief'}
        </Button>
      </CardContent>
    </Card>
  );
}
