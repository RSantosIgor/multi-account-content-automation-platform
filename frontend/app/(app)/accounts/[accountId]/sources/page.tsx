import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SourceTabs } from '@/components/sources/SourceTabs';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

async function fetchAllSources(accountId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const headers = { Authorization: `Bearer ${session.access_token}` };
  const base = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/${accountId}/sources`;

  const [youtubeRes, xFeedsRes, newslettersRes] = await Promise.all([
    fetch(`${base}/youtube`, { headers, cache: 'no-store' }),
    fetch(`${base}/x-feeds`, { headers, cache: 'no-store' }),
    fetch(`${base}/newsletters`, { headers, cache: 'no-store' }),
  ]);

  const [youtube, xFeeds, newsletters] = await Promise.all([
    youtubeRes.ok ? youtubeRes.json().then((r: { data: unknown[] }) => r.data) : [],
    xFeedsRes.ok ? xFeedsRes.json().then((r: { data: unknown[] }) => r.data) : [],
    newslettersRes.ok ? newslettersRes.json().then((r: { data: unknown[] }) => r.data) : [],
  ]);

  return { youtube, xFeeds, newsletters };
}

async function getAccount(accountId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/${accountId}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) redirect('/dashboard');
  const result = await res.json();
  return result.data;
}

export default async function SourcesPage({ params }: PageProps) {
  const { accountId } = await params;
  const [{ youtube, xFeeds, newsletters }, account] = await Promise.all([
    fetchAllSources(accountId),
    getAccount(accountId),
  ]);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Breadcrumb />

      <div>
        <h1 className="font-display text-3xl font-bold">Fontes de Conteúdo</h1>
        <p className="text-muted-foreground mt-1">
          Fontes adicionais para <span className="font-medium">@{account.username}</span>: YouTube,
          X e newsletters.
        </p>
      </div>

      <SourceTabs
        accountId={accountId}
        youtubeSources={youtube as Parameters<typeof SourceTabs>[0]['youtubeSources']}
        xFeedSources={xFeeds as Parameters<typeof SourceTabs>[0]['xFeedSources']}
        newsletterSources={newsletters as Parameters<typeof SourceTabs>[0]['newsletterSources']}
      />
    </div>
  );
}
