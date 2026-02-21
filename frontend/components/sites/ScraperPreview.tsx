'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PreviewArticle = {
  url: string;
  title: string;
  summary: string | null;
  published_at: string | null;
};

type ScraperPreviewProps = {
  accountId: string;
  siteId: string;
};

export function ScraperPreview({ accountId, siteId }: ScraperPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<PreviewArticle[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [message, setMessage] = useState<string>('');

  const fetchPreview = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiClient<{
        data?: { preview?: PreviewArticle[]; message?: string; note?: string };
      }>(`/api/v1/accounts/${accountId}/sites/${siteId}/test`, {
        method: 'POST',
      });

      setArticles(response.data?.preview || []);
      setMessage(response.data?.message || '');
      setHasLoaded(true);

      if (response.data?.preview?.length === 0) {
        toast.info(response.data?.note || 'No articles found in preview');
      } else {
        toast.success(`Found ${response.data?.preview?.length || 0} articles`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch preview';
      toast.error(message);
      setArticles([]);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraper Preview</CardTitle>
        <CardDescription>Test the scraper to see which articles would be collected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchPreview} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Scraper
              </>
            )}
          </Button>

          {message && (
            <div className="text-muted-foreground bg-muted rounded-md p-3 text-sm">{message}</div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ))}
            </div>
          )}

          {hasLoaded && !isLoading && articles.length > 0 && (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.url} className="border-gold space-y-1 border-l-2 py-2 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-tight">{article.title}</h4>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {article.summary && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">{article.summary}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {formatDate(article.published_at)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {hasLoaded && !isLoading && articles.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <p className="text-sm">No articles found in preview.</p>
              <p className="mt-1 text-xs">
                The scraper implementation will be available after SCRAPER-001 and SCRAPER-002 are
                completed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
