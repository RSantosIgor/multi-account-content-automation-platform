'use client';

import { useState } from 'react';
import { Calendar, User, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { PublishDialog } from '@/components/timeline/PublishDialog';
import { queryKeys } from '@/lib/query-keys';

type ArticleSummary = {
  bullets: string[];
};

type Suggestion = {
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
};

type Article = {
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

type SuggestionStepProps = {
  suggestion: Suggestion;
  article: Article;
  accountId: string;
  itemId: string;
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  approved: 'bg-green-500/20 text-green-300 border-green-500/40',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/40',
  posted: 'bg-green-500/20 text-green-300 border-green-500/40',
};

export function SuggestionStep({ suggestion, article, accountId, itemId }: SuggestionStepProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: accountData } = useQuery({
    queryKey: queryKeys.accounts.detail(accountId),
    queryFn: () => apiClient<{ data: { isPremium: boolean } }>(`/api/v1/accounts/${accountId}`),
    enabled: !!accountId,
  });
  const isPremium = accountData?.data?.isPremium ?? false;

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'approved' | 'rejected') =>
      apiClient(`/api/v1/suggestions/${suggestion.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_data, status) => {
      toast.success(status === 'approved' ? 'Aprovado! Gerando tweet…' : 'Sugestão rejeitada');
      void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar status';
      toast.error(msg);
    },
  });

  const isUpdating = updateStatusMutation.isPending;
  const badgeClass = statusColor[suggestion.status] ?? 'bg-muted text-foreground';

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sugestão de IA</h3>
        <Badge className={badgeClass}>{suggestion.status}</Badge>
      </div>

      <div className="space-y-4">
        {suggestion.suggestionText ? (
          <div className="bg-background rounded-md border border-white/10 p-4">
            <p className="text-base">{suggestion.suggestionText}</p>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-md border border-dashed p-4">
            <p className="text-muted-foreground text-sm">
              Tweet ainda não gerado. Será criado automaticamente ao aprovar a sugestão.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {suggestion.hashtags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {suggestion.articleSummary?.bullets && suggestion.articleSummary.bullets.length > 0 && (
          <div className="bg-muted rounded-md p-4">
            <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Resumo Gerado pela IA
            </h5>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {suggestion.articleSummary.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          Criado em {new Date(suggestion.createdAt).toLocaleString()}
        </div>

        {suggestion.reviewedAt && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            Revisado em {new Date(suggestion.reviewedAt).toLocaleString()}
          </div>
        )}

        {/* Pending: approve to generate tweet */}
        {suggestion.status === 'pending' && article && (
          <div className="bg-muted/50 mt-4 rounded-md border border-dashed border-white/20 p-4">
            <p className="text-muted-foreground mb-3 text-sm">
              Aprove esta sugestão para gerar o tweet com o conteúdo completo do artigo.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => updateStatusMutation.mutate('approved')}
                disabled={isUpdating}
                size="sm"
                className="gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando tweet…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Aprovar e Gerar Tweet
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => updateStatusMutation.mutate('rejected')}
                disabled={isUpdating}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        )}

        {/* Approved: show Publish button */}
        {suggestion.status === 'approved' && suggestion.suggestionText && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setPublishDialogOpen(true)}>
              Publicar no X
            </Button>
          </div>
        )}
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        accountId={accountId}
        suggestionId={suggestion.id}
        initialContent={suggestion.suggestionText ?? ''}
        isPremium={isPremium}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
        }}
      />
    </div>
  );
}
