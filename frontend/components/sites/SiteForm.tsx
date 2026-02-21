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
import { Info } from 'lucide-react';

const siteFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  url: z.string().url('Must be a valid URL'),
  scraping_interval_hours: z.coerce
    .number()
    .int()
    .min(1, 'Minimum 1 hour')
    .max(168, 'Maximum 168 hours (1 week)'),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

type SiteData = {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  feedUrl: string | null;
  scrapingIntervalHours: number;
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
      if (mode === 'create') {
        await apiClient(`/api/v1/accounts/${accountId}/sites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        toast.success('Site created successfully');
      } else {
        await apiClient(`/api/v1/accounts/${accountId}/sites/${site!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
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
