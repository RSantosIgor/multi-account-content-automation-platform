'use client';

import { Badge } from '@/components/ui/badge';
import { SuggestionCard } from './SuggestionCard';
import { PostCard } from './PostCard';

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
        suggestionText: string;
        hashtags: string[];
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
    return (
      <div className="space-y-2 rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-muted-foreground text-sm">
            {item.siteName ?? 'Sem site'} · {new Date(item.createdAt).toLocaleString()}
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
        <div className="text-muted-foreground text-sm">
          {item.siteName ?? 'Sem site'} · {new Date(item.createdAt).toLocaleString()}
        </div>
        <Badge className={badgeClass}>{item.status}</Badge>
      </div>
      <PostCard post={item} />
    </div>
  );
}
