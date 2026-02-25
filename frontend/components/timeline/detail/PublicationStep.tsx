'use client';

import { ExternalLink, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Post = {
  id: string;
  content: string;
  status: string;
  xPostUrl: string | null;
  xPostId: string | null;
  publishedAt: string | null;
  createdAt: string;
  errorMessage: string | null;
  suggestionId?: string | null;
};

type PublicationStepProps = {
  post: Post;
};

export function PublicationStep({ post }: PublicationStepProps) {
  const isPublished = post.status === 'published';
  const isFailed = post.status === 'failed';

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Publicação</h3>
        <Badge
          className={
            isPublished
              ? 'border-green-500/40 bg-green-500/20 text-green-300'
              : isFailed
                ? 'border-red-500/40 bg-red-500/20 text-red-300'
                : 'bg-muted text-foreground'
          }
        >
          {isPublished ? 'Publicado' : isFailed ? 'Falhou' : post.status}
        </Badge>
      </div>

      <div className="space-y-4">
        {isPublished && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>Post publicado com sucesso no X!</span>
          </div>
        )}

        {isFailed && post.errorMessage && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-semibold">Erro ao publicar:</div>
              <div>{post.errorMessage}</div>
            </div>
          </div>
        )}

        <div className="bg-background rounded-md border border-white/10 p-4">
          <p className="whitespace-pre-wrap text-base">{post.content}</p>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {post.publishedAt
            ? `Publicado em ${new Date(post.publishedAt).toLocaleString()}`
            : `Criado em ${new Date(post.createdAt).toLocaleString()}`}
        </div>

        {post.xPostUrl && (
          <div>
            <a
              href={post.xPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 inline-flex items-center gap-1 text-sm font-medium"
            >
              Ver post no X <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {post.xPostId && (
          <div className="text-muted-foreground text-xs">
            ID do Post: <code className="bg-muted rounded px-1">{post.xPostId}</code>
          </div>
        )}
      </div>
    </div>
  );
}
