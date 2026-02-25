'use client';

import { useState } from 'react';
import { Calendar, User, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

type ArticleSummary = {
  bullets: string[];
};

type Suggestion = {
  id: string;
  articleId: string;
  xAccountId: string;
  status: string;
  suggestionText: string;
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
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  approved: 'bg-green-500/20 text-green-300 border-green-500/40',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/40',
  posted: 'bg-green-500/20 text-green-300 border-green-500/40',
};

export function SuggestionStep({
  suggestion,
  article,
  accountId: _accountId,
}: SuggestionStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleProcessArticle() {
    if (!article) {
      toast.error('Artigo não encontrado');
      return;
    }

    setIsProcessing(true);

    try {
      await apiClient(`/api/v1/ai/suggest/${article.id}`, {
        method: 'POST',
      });

      toast.success('Artigo processado! Recarregue a página para ver o resultado.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao processar artigo';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  const badgeClass = statusColor[suggestion.status] ?? 'bg-muted text-foreground';

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sugestão de IA</h3>
        <Badge className={badgeClass}>{suggestion.status}</Badge>
      </div>

      <div className="space-y-4">
        <div className="bg-background rounded-md border border-white/10 p-4">
          <p className="text-base">{suggestion.suggestionText}</p>
        </div>

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

        {suggestion.status === 'pending' && article && (
          <div className="bg-muted/50 mt-4 rounded-md border border-dashed border-white/20 p-4">
            <p className="text-muted-foreground mb-3 text-sm">
              Este artigo ainda não foi processado pela IA. Clique abaixo para gerar uma nova
              sugestão.
            </p>
            <Button
              onClick={handleProcessArticle}
              disabled={isProcessing}
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isProcessing ? 'Processando...' : 'Processar Artigo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
