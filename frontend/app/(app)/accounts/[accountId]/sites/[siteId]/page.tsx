import { SiteForm } from '@/components/sites/SiteForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ accountId: string; siteId: string }>;
};

async function getSite(accountId: string, siteId: string) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/${accountId}/sites`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch sites');
  }

  const result = await response.json();
  const sites = result.data || [];
  const site = sites.find((s: { id: string }) => s.id === siteId);

  if (!site) {
    notFound();
  }

  return site;
}

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
    throw new Error('Failed to fetch account');
  }

  const result = await response.json();
  return result.data;
}

export default async function EditSitePage({ params }: PageProps) {
  const { accountId, siteId } = await params;
  const [site, account] = await Promise.all([getSite(accountId, siteId), getAccount(accountId)]);

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Edit Site</h1>
        <p className="text-muted-foreground mt-1">
          Editing <span className="font-medium">{site.name}</span> for{' '}
          <span className="font-medium">@{account.username}</span>
        </p>
      </div>

      <SiteForm accountId={accountId} site={site} mode="edit" />
    </div>
  );
}
