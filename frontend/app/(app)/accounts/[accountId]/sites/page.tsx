import { Button } from '@/components/ui/button';
import { SiteTable } from '@/components/sites/SiteTable';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

async function getSites(accountId: string) {
  const supabase = await createClient();

  // Get session to get JWT
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch sites from backend API
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
  return result.data || [];
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

export default async function SitesPage({ params }: PageProps) {
  const { accountId } = await params;
  const [sites, account] = await Promise.all([getSites(accountId), getAccount(accountId)]);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Breadcrumb />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">News Sites</h1>
          <p className="text-muted-foreground mt-1">
            Manage news sources for <span className="font-medium">@{account.username}</span>
          </p>
        </div>
        <Link href={`/accounts/${accountId}/sites/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Site
          </Button>
        </Link>
      </div>

      <SiteTable accountId={accountId} sites={sites} />
    </div>
  );
}
