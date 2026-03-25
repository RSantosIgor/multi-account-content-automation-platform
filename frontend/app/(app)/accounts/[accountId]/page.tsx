import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RunClusteringButton } from '@/components/editorial/RunClusteringButton';
import {
  Newspaper,
  FileText,
  Clock,
  Settings,
  BarChart3,
  ArrowRight,
  Radio,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

async function getAccount(accountId: string) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/${accountId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/dashboard');
  }

  const result = await response.json();
  return result.data;
}

export default async function AccountPage({ params }: PageProps) {
  const { accountId } = await params;
  const account = await getAccount(accountId);

  const sections = [
    {
      title: 'Fontes',
      description: 'Sites, YouTube, X feeds e newsletters',
      icon: Radio,
      href: `/accounts/${accountId}/sources`,
      count: account.sitesCount,
      countLabel: 'fontes',
    },
    {
      title: 'Timeline',
      description: 'Review AI suggestions and post history',
      icon: Clock,
      href: `/accounts/${accountId}/timeline`,
      count: account.postsCount,
      countLabel: 'posts',
    },
    {
      title: 'Statistics',
      description: 'View posting activity and metrics',
      icon: BarChart3,
      href: `/accounts/${accountId}/stats`,
      count: 0,
      countLabel: '',
    },
    {
      title: 'Settings',
      description: 'Configure account and AI prompt rules',
      icon: Settings,
      href: `/accounts/${accountId}/settings`,
      count: 0,
      countLabel: '',
    },
    {
      title: 'Editorial',
      description: 'Topic clusters, briefs and contextual post generation',
      icon: BookOpen,
      href: `/accounts/${accountId}/editorial`,
      count: 0,
      countLabel: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="from-card via-card/95 to-gold/5 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 sm:p-8">
        {/* Top accent line */}
        <div className="via-gold/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Account identity */}
          <div className="flex items-center gap-4">
            <Avatar className="ring-gold/30 ring-offset-card h-14 w-14 ring-2 ring-offset-2 sm:h-16 sm:w-16">
              <AvatarImage src={account.profileImageUrl ?? undefined} alt={account.username} />
              <AvatarFallback className="bg-gold/10 text-gold text-xl">
                {account.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">@{account.username}</h1>
                <Badge
                  variant={account.isActive ? 'default' : 'secondary'}
                  className={
                    account.isActive
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                      : ''
                  }
                >
                  {account.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {account.displayName && (
                <p className="text-muted-foreground mt-0.5 text-sm">{account.displayName}</p>
              )}
            </div>
          </div>

          {/* Quick stats pills + actions */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            <div className="bg-card/60 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
              <Newspaper className="text-gold h-4 w-4" />
              <span className="text-sm font-semibold">{account.sitesCount}</span>
              <span className="text-muted-foreground text-xs">sites</span>
            </div>
            <div className="bg-card/60 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
              <FileText className="text-gold h-4 w-4" />
              <span className="text-sm font-semibold">{account.postsCount}</span>
              <span className="text-muted-foreground text-xs">posts</span>
            </div>
            <RunClusteringButton accountId={accountId} />
          </div>
        </div>
      </div>

      {/* Navigation grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <div className="bg-card/60 hover:bg-card/90 hover:border-gold/30 flex h-full flex-col gap-3 rounded-xl border border-white/10 p-5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="bg-gold/10 rounded-lg p-2.5">
                  <section.icon className="text-gold h-5 w-5" />
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-gold h-4 w-4 transition-colors" />
              </div>
              <div>
                <h2 className="font-medium">{section.title}</h2>
                <p className="text-muted-foreground mt-0.5 text-sm">{section.description}</p>
              </div>
              {section.count > 0 && (
                <p className="text-muted-foreground mt-auto text-xs">
                  {section.count} {section.countLabel}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
