'use client';

import Link from 'next/link';
import { ExternalLink, Newspaper, PlaySquare, AtSign, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SuggestionCard } from './SuggestionCard';
import { PostCard } from './PostCard';

const sourceIcons: Record<string, React.ElementType> = {
  news_article: Newspaper,
  youtube_video: PlaySquare,
  x_post: AtSign,
  newsletter: Mail,
};

const sourceLabels: Record<string, string> = {
  news_article: 'Notícia',
  youtube_video: 'YouTube',
  x_post: 'X',
  newsletter: 'Newsletter',
};

type ArticleSummary = {
  bullets: string[];
};

type TimelineItemProps = {
  accountId: string;
  item:
    | {
        id: string;
        type: 'suggestion';
        status: string;
        createdAt: string;
        articleTitle: string;
        siteId: string;
        siteName: string | null;
        suggestionText: string | null;
        hashtags: string[];
        articleSummary: ArticleSummary | null;
        sourceType?: string;
      }
    | {
        id: string;
        type: 'post';
        status: string;
        createdAt: string;
        publishedAt: string | null;
        content: string;
        xPostUrl: string | null;
        suggestionId: string | null;
        siteId: string | null;
        siteName: string | null;
      };
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  approved: 'bg-green-500/20 text-green-300 border-green-500/40',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/40',
  posted: 'bg-green-500/20 text-green-300 border-green-500/40',
  published: 'bg-green-500/20 text-green-300 border-green-500/40',
  failed: 'bg-red-500/20 text-red-300 border-red-500/40',
};

export function TimelineItem({ item, accountId }: TimelineItemProps) {
  const badgeClass = statusColor[item.status] ?? 'bg-muted text-foreground';

  if (item.type === 'suggestion') {
    const sourceType = item.sourceType ?? 'news_article';
    const SourceIcon = sourceIcons[sourceType] ?? Newspaper;
    const sourceLabel = sourceLabels[sourceType] ?? sourceType;

    return (
      <div className="space-y-2 rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <SourceIcon className="h-3.5 w-3.5" />
              <span>{sourceLabel}</span>
              {item.siteName && <span>· {item.siteName}</span>}
              <span>· {new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <Link href={`/accounts/${accountId}/timeline/${item.id}`}>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                Ver Detalhes <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <Badge className={badgeClass}>{item.status}</Badge>
        </div>
        <div className="text-sm font-medium">{item.articleTitle}</div>
        <SuggestionCard accountId={accountId} suggestion={item} />
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground text-sm">
            {item.siteName ?? 'Sem site'} · {new Date(item.createdAt).toLocaleString()}
          </div>
          <Link href={`/accounts/${accountId}/timeline/${item.id}`}>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              Ver Detalhes <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <Badge className={badgeClass}>{item.status}</Badge>
      </div>
      <PostCard post={item} />
    </div>
  );
}
