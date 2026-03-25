'use client';

import { useState } from 'react';
import {
  ExternalLink,
  Calendar,
  Building,
  Sparkles,
  Loader2,
  PlaySquare,
  AtSign,
  Mail,
  User,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

type ArticleSummary = {
  bullets: string[];
};

type Article = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  fullContent: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
};

type OriginalArticleStepProps = {
  article: Article | null;
  hasSuggestion?: boolean;
  itemId?: string;
  sourceType?: string;
  sourceMetadata?: Record<string, unknown> | null;
};

export function OriginalArticleStep({
  article,
  hasSuggestion = true,
  itemId,
  sourceType = 'news_article',
  sourceMetadata = null,
}: OriginalArticleStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Try to parse article_summary from the summary field if it's JSON
  let summaryBullets: string[] | null = null;
  try {
    if (article?.summary && article.summary.startsWith('{')) {
      const parsed = JSON.parse(article.summary) as ArticleSummary;
      summaryBullets = parsed.bullets;
    }
  } catch {
    // Not JSON, use as plain text
  }

  async function handleProcessArticle() {
    if (!itemId || !article) return;

    setIsProcessing(true);
    try {
      const suggestRes = await apiClient<{ data: { id: string } }>(
        `/api/v1/ai/suggest/${article.id}`,
        { method: 'POST' },
      );
      await apiClient(`/api/v1/suggestions/${suggestRes.data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      toast.success('Artigo processado! Tweet gerado com sucesso.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao processar artigo';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  // Derive title and link from either article or metadata
  const title = article?.title ?? (sourceMetadata?.title as string | undefined) ?? 'Sem título';
  const url = article?.url ?? (sourceMetadata?.url as string | undefined) ?? null;

  const stepLabel =
    sourceType === 'youtube_video'
      ? 'Vídeo YouTube'
      : sourceType === 'x_post'
        ? 'Tweet Original'
        : sourceType === 'newsletter'
          ? 'Newsletter'
          : 'Artigo Original';

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <h3 className="mb-4 text-lg font-semibold">{stepLabel}</h3>

      <div className="space-y-4">
        <h4 className="text-xl font-bold">{title}</h4>

        {/* news_article: site info */}
        {sourceType === 'news_article' && article?.sourceName && (
          <div className="flex items-center gap-2">
            <Building className="text-muted-foreground h-4 w-4" />
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 text-sm"
              >
                {article.sourceName}
              </a>
            ) : (
              <span className="text-muted-foreground text-sm">{article.sourceName}</span>
            )}
          </div>
        )}

        {/* youtube_video: channel + duration */}
        {sourceType === 'youtube_video' && sourceMetadata && (
          <div className="space-y-2">
            {sourceMetadata.channelTitle && (
              <div className="flex items-center gap-2">
                <PlaySquare className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  {String(sourceMetadata.channelTitle)}
                </span>
              </div>
            )}
            {sourceMetadata.duration && (
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  Duração: {Math.floor(Number(sourceMetadata.duration) / 60)}m{' '}
                  {Number(sourceMetadata.duration) % 60}s
                </span>
              </div>
            )}
          </div>
        )}

        {/* x_post: author + engagement */}
        {sourceType === 'x_post' && sourceMetadata && (
          <div className="space-y-2">
            {sourceMetadata.authorUsername && (
              <div className="flex items-center gap-2">
                <AtSign className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  @{String(sourceMetadata.authorUsername)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              {sourceMetadata.likes !== undefined && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Hash className="h-3.5 w-3.5" />
                  {Number(sourceMetadata.likes).toLocaleString()} likes
                </div>
              )}
              {sourceMetadata.retweets !== undefined && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Hash className="h-3.5 w-3.5" />
                  {Number(sourceMetadata.retweets).toLocaleString()} retweets
                </div>
              )}
            </div>
          </div>
        )}

        {/* newsletter: author + feed */}
        {sourceType === 'newsletter' && sourceMetadata && (
          <div className="space-y-2">
            {sourceMetadata.authorName && (
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  {String(sourceMetadata.authorName)}
                </span>
              </div>
            )}
            {sourceMetadata.feedTitle && (
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  {String(sourceMetadata.feedTitle)}
                </span>
              </div>
            )}
            {Array.isArray(sourceMetadata.categories) && sourceMetadata.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(sourceMetadata.categories as string[]).map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Published date (news_article / newsletter) */}
        {article?.publishedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              Publicado em {new Date(article.publishedAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* External link */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 inline-flex items-center gap-1 text-sm"
          >
            {sourceType === 'youtube_video'
              ? 'Ver vídeo'
              : sourceType === 'x_post'
                ? 'Ver tweet'
                : sourceType === 'newsletter'
                  ? 'Ver newsletter'
                  : 'Ver artigo completo'}{' '}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Summary (news_article / newsletter) */}
        {summaryBullets && summaryBullets.length > 0 && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <h5 className="mb-2 text-sm font-semibold">Resumo</h5>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {summaryBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!summaryBullets && article?.summary && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <p className="text-muted-foreground text-sm">{article.summary}</p>
          </div>
        )}

        {!hasSuggestion && itemId && article && (
          <Button
            onClick={handleProcessArticle}
            disabled={isProcessing}
            size="sm"
            className="mt-4 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Processar Artigo
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
