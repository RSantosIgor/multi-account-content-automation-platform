'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Youtube, Twitter, Mail } from 'lucide-react';
import { NewsSiteSourceTable, type NewsSiteSource } from './NewsSiteSourceTable';
import { YouTubeSourceTable, type YoutubeSource } from './YouTubeSourceTable';
import { XFeedSourceTable, type XFeedSource } from './XFeedSourceTable';
import { NewsletterSourceTable, type NewsletterSource } from './NewsletterSourceTable';

type SourceTabsProps = {
  accountId: string;
  newsSiteSources: NewsSiteSource[];
  youtubeSources: YoutubeSource[];
  xFeedSources: XFeedSource[];
  newsletterSources: NewsletterSource[];
};

export function SourceTabs({
  accountId,
  newsSiteSources,
  youtubeSources,
  xFeedSources,
  newsletterSources,
}: SourceTabsProps) {
  return (
    <Tabs defaultValue="news-sites">
      <TabsList className="mb-6">
        <TabsTrigger value="news-sites" className="gap-2">
          <Globe className="h-4 w-4" />
          Sites
          {newsSiteSources.length > 0 && (
            <span className="bg-muted ml-1 rounded px-1.5 text-xs">{newsSiteSources.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="youtube" className="gap-2">
          <Youtube className="h-4 w-4" />
          YouTube
          {youtubeSources.length > 0 && (
            <span className="bg-muted ml-1 rounded px-1.5 text-xs">{youtubeSources.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="x-feeds" className="gap-2">
          <Twitter className="h-4 w-4" />
          Feeds do X
          {xFeedSources.length > 0 && (
            <span className="bg-muted ml-1 rounded px-1.5 text-xs">{xFeedSources.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="newsletters" className="gap-2">
          <Mail className="h-4 w-4" />
          Newsletters
          {newsletterSources.length > 0 && (
            <span className="bg-muted ml-1 rounded px-1.5 text-xs">{newsletterSources.length}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="news-sites">
        <NewsSiteSourceTable accountId={accountId} initialSources={newsSiteSources} />
      </TabsContent>

      <TabsContent value="youtube">
        <YouTubeSourceTable accountId={accountId} initialSources={youtubeSources} />
      </TabsContent>

      <TabsContent value="x-feeds">
        <XFeedSourceTable accountId={accountId} initialSources={xFeedSources} />
      </TabsContent>

      <TabsContent value="newsletters">
        <NewsletterSourceTable accountId={accountId} initialSources={newsletterSources} />
      </TabsContent>
    </Tabs>
  );
}
