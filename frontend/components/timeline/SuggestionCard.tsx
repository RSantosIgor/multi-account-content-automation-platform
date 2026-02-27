'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Clock, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { PublishDialog } from './PublishDialog';

type ArticleSummary = {
  bullets: string[];
};

type SuggestionCardProps = {
  accountId: string;
  suggestion: {
    id: string;
    suggestionText: string | null;
    hashtags: string[];
    status: string;
    articleSummary?: ArticleSummary | null;
  };
};

export function SuggestionCard({ accountId, suggestion }: SuggestionCardProps) {
  const [text, setText] = useState(suggestion.suggestionText ?? '');
  const [localStatus, setLocalStatus] = useState(suggestion.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Use local state so the component reacts immediately after approve/reject
  const isPending = localStatus === 'pending' && !text;

  const updateStatus = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const response = await apiClient<{
        data: { suggestionText: string | null; hashtags: string[] };
      }>(`/api/v1/suggestions/${suggestion.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(status === 'approved' ? 'Sugestão aprovada' : 'Sugestão rejeitada');
      if (status === 'approved') {
        setLocalStatus('approved');
        if (response.data?.suggestionText) {
          setText(response.data.suggestionText);
        }
      } else {
        // After rejection, reload to remove the card from the pending list
        window.location.reload();
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar status';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const characters = text.length;
  const overLimit = characters > 280;

  // Pending state: tweet not yet generated
  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="bg-muted/50 flex items-center gap-3 rounded-md border border-dashed p-4">
          <Clock className="text-muted-foreground h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Aguardando aprovação</p>
            <p className="text-muted-foreground text-xs">
              O tweet será gerado automaticamente quando você aprovar esta sugestão.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => updateStatus('approved')}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Gerando tweet…
              </>
            ) : (
              'Aprovar e Gerar Tweet'
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={isUpdating}
            onClick={() => updateStatus('rejected')}
          >
            Rejeitar
          </Button>
          <Link href={`/accounts/${accountId}/timeline/${suggestion.id}`} className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver Detalhes <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="bg-background border-white/10"
        rows={4}
      />
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div className="flex gap-2">
          {suggestion.hashtags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <span className={overLimit ? 'text-destructive' : ''}>{characters}/280</span>
      </div>

      {suggestion.articleSummary?.bullets && suggestion.articleSummary.bullets.length > 0 && (
        <div className="bg-muted rounded-md p-3">
          <h4 className="mb-2 text-sm font-semibold">Resumo do Artigo</h4>
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

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isUpdating}
          onClick={() => updateStatus('approved')}
        >
          Aprovar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={isUpdating}
          onClick={() => updateStatus('rejected')}
        >
          Rejeitar
        </Button>
        <Link href={`/accounts/${accountId}/timeline/${suggestion.id}`} className="ml-auto">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver Detalhes <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
        <Button
          variant="default"
          size="sm"
          onClick={() => setPublishDialogOpen(true)}
          disabled={overLimit || isUpdating}
        >
          Publicar
        </Button>
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        accountId={accountId}
        suggestionId={suggestion.id}
        initialContent={text}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
