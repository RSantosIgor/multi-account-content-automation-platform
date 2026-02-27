'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { ScraperPreview } from './ScraperPreview';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';

const siteFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  url: z.string().url('Must be a valid URL'),
  scraping_interval_hours: z.coerce
    .number()
    .int()
    .min(1, 'Minimum 1 hour')
    .max(168, 'Maximum 168 hours (1 week)'),
  auto_flow: z.boolean().default(false),
  article_selector: z.string().optional(),
  title_selector: z.string().optional(),
  summary_selector: z.string().optional(),
  link_selector: z.string().optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

type SiteData = {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  feedUrl: string | null;
  scrapingIntervalHours: number;
  autoFlow?: boolean;
  scrapingConfig: {
    article_selector: string;
    title_selector: string;
    summary_selector: string;
    link_selector: string;
  } | null;
};

type SiteFormProps = {
  accountId: string;
  site?: SiteData;
  mode: 'create' | 'edit';
};

export function SiteForm({ accountId, site, mode }: SiteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rssDetectionResult, setRssDetectionResult] = useState<{
    feedUrl: string | null;
    checked: boolean;
  }>({ feedUrl: null, checked: false });

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: site?.name || '',
      url: site?.url || '',
      scraping_interval_hours: site?.scrapingIntervalHours || 4,
      auto_flow: site?.autoFlow ?? false,
      article_selector: site?.scrapingConfig?.article_selector || '',
      title_selector: site?.scrapingConfig?.title_selector || '',
      summary_selector: site?.scrapingConfig?.summary_selector || '',
      link_selector: site?.scrapingConfig?.link_selector || '',
    },
  });

  const handleUrlBlur = async () => {
    const url = form.getValues('url');
    if (!url || rssDetectionResult.checked) return;

    // Simple client-side validation
    try {
      new URL(url);
    } catch {
      return;
    }

    // Auto-detect RSS when creating a new site
    if (mode === 'create') {
      setRssDetectionResult({ feedUrl: null, checked: true });
      toast.info('Checking for RSS feed...');
    }
  };

  const onSubmit = async (values: SiteFormValues) => {
    setIsSubmitting(true);

    try {
      const hasAnySelector =
        !!values.article_selector?.trim() ||
        !!values.title_selector?.trim() ||
        !!values.summary_selector?.trim() ||
        !!values.link_selector?.trim();

      if (
        hasAnySelector &&
        (!values.article_selector?.trim() ||
          !values.title_selector?.trim() ||
          !values.summary_selector?.trim() ||
          !values.link_selector?.trim())
      ) {
        toast.error('All HTML selector fields are required when using custom selectors.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: values.name,
        url: values.url,
        scraping_interval_hours: values.scraping_interval_hours,
        auto_flow: values.auto_flow,
        ...(hasAnySelector
          ? {
              scraping_config: {
                article_selector: values.article_selector!.trim(),
                title_selector: values.title_selector!.trim(),
                summary_selector: values.summary_selector!.trim(),
                link_selector: values.link_selector!.trim(),
              },
            }
          : {}),
      };

      if (mode === 'create') {
        await apiClient(`/api/v1/accounts/${accountId}/sites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Site created successfully');
      } else {
        await apiClient(`/api/v1/accounts/${accountId}/sites/${site!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Site updated successfully');
      }

      router.push(`/accounts/${accountId}/sites`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save site';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., TechCrunch" {...field} />
                </FormControl>
                <FormDescription>A friendly name to identify this news source</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                    onBlur={handleUrlBlur}
                  />
                </FormControl>
                <FormDescription>
                  The homepage of the news site (RSS will be auto-detected)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && rssDetectionResult.checked && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {rssDetectionResult.feedUrl ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      RSS Feed Found
                    </Badge>
                    <span className="text-sm">{new URL(rssDetectionResult.feedUrl).pathname}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No RSS feed found. The site will be scraped using HTML parsing.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {mode === 'edit' && site?.sourceType && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Source Type:</span>
                  <Badge variant="outline" className="uppercase">
                    {site.sourceType}
                  </Badge>
                  {site.feedUrl && (
                    <span className="text-muted-foreground text-sm">
                      Feed: {new URL(site.feedUrl).pathname}
                    </span>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="scraping_interval_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scraping Interval (hours)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={168} {...field} />
                </FormControl>
                <FormDescription>How often to check for new articles (1-168 hours)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auto_flow"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Auto-flow</FormLabel>
                  <FormDescription>
                    Publicar automaticamente sem revisão manual. Artigos elegíveis serão
                    processados, gerados e publicados no X automaticamente.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="bg-muted/20 space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium">HTML Fallback Selectors (Optional)</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Use this when a site does not provide RSS. If you fill one selector, all are
                required.
              </p>
            </div>

            <FormField
              control={form.control}
              name="article_selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Selector</FormLabel>
                  <FormControl>
                    <Input placeholder="article, .post, .news-item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title_selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title Selector</FormLabel>
                  <FormControl>
                    <Input placeholder="h2 a, .title a" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary_selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary Selector</FormLabel>
                  <FormControl>
                    <Input placeholder="p.excerpt, .summary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link_selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Selector</FormLabel>
                  <FormControl>
                    <Input placeholder="a.read-more, a" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Site' : 'Update Site'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/accounts/${accountId}/sites`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {mode === 'edit' && site && (
        <div className="mt-8">
          <ScraperPreview accountId={accountId} siteId={site.id} />
        </div>
      )}
    </div>
  );
}
