'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type PublishedPost = {
  id: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  content: string;
  xPostUrl: string | null;
  siteName: string | null;
};

type TimelineResponse = {
  data: Array<{
    id: string;
    type: 'suggestion' | 'post';
    status: string;
    createdAt: string;
    publishedAt?: string | null;
    content?: string;
    xPostUrl?: string | null;
    siteName?: string | null;
  }>;
};

type PublishedPostsSectionProps = {
  accountId: string;
};

function PublishedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="rounded-lg border border-white/10 p-4">
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PublishedPostsSection({ accountId }: PublishedPostsSectionProps) {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    async function fetchPublished() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient<TimelineResponse>(
          `/api/v1/accounts/${accountId}/timeline?status=posted&limit=50`,
        );

        const publishedPosts = res.data
          .filter((item) => item.type === 'post')
          .map((item) => ({
            id: item.id,
            status: item.status,
            createdAt: item.createdAt,
            publishedAt: item.publishedAt ?? null,
            content: item.content ?? '',
            xPostUrl: item.xPostUrl ?? null,
            siteName: item.siteName ?? null,
          }));

        setPosts(publishedPosts);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao carregar posts publicados';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPublished();
  }, [accountId]);

  if (isLoading) return <PublishedSkeleton />;

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-card/70 rounded-xl border border-dashed border-white/15 p-8 text-center">
        <h3 className="font-display text-xl">Nenhum post publicado</h3>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Posts publicados aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border border-white/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-muted-foreground text-sm">
              {post.siteName ?? 'Sem site'} ·{' '}
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleString()
                : new Date(post.createdAt).toLocaleString()}
            </div>
            <Badge className="border-green-500/40 bg-green-500/20 text-green-300">publicado</Badge>
          </div>
          <div className="bg-background mb-3 rounded-md border border-white/10 p-3 text-sm">
            {post.content}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/accounts/${accountId}/timeline/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                Ver Detalhes <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
            {post.xPostUrl && (
              <a
                href={post.xPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 inline-flex items-center gap-1 text-sm"
              >
                Ver no X <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
