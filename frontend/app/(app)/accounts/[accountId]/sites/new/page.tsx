import { SiteForm } from '@/components/sites/SiteForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    throw new Error('Failed to fetch account');
  }

  const result = await response.json();
  return result.data;
}

export default async function NewSitePage({ params }: PageProps) {
  const { accountId } = await params;
  const account = await getAccount(accountId);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Add News Site</h1>
        <p className="text-muted-foreground mt-1">
          Add a new news source for <span className="font-medium">@{account.username}</span>
        </p>
      </div>

      <SiteForm accountId={accountId} mode="create" />
    </div>
  );
}
