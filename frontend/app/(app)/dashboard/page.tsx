'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { AccountSelector, type AccountOption } from '@/components/dashboard/AccountSelector';
import { PendingPostsSection } from '@/components/dashboard/PendingPostsSection';
import { PublishedPostsSection } from '@/components/dashboard/PublishedPostsSection';
import { RejectedPostsSection } from '@/components/dashboard/RejectedPostsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type AccountsResponse = {
  data: Array<{
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  }>;
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient<AccountsResponse>('/api/v1/accounts');
        setAccounts(response.data);

        // Select first account by default
        if (response.data.length > 0) {
          setSelectedAccountId(response.data[0].id);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar as contas.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadAccounts();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-3xl leading-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Revise e publique sugestões de posts.
          </p>
        </div>
        <DashboardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-3xl leading-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Revise e publique sugestões de posts.
          </p>
        </div>
        <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (accounts.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-3xl leading-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Revise e publique sugestões de posts.
          </p>
        </div>
        <div className="bg-card/70 rounded-xl border border-dashed border-white/15 p-8 text-center">
          <h2 className="font-display text-2xl">Nenhuma conta conectada</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Conecte uma conta do X para começar a ver sugestões de posts aqui.
          </p>
          <div className="mt-5">
            <Link
              href="/accounts"
              className="bg-gold hover:bg-gold/90 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-black"
            >
              Gerenciar Contas
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Revise e publique sugestões de posts.
          </p>
        </div>
      </div>

      <AccountSelector
        accounts={accounts}
        selected={selectedAccountId}
        onChange={setSelectedAccountId}
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <PendingPostsSection accountId={selectedAccountId} />
        </TabsContent>

        <TabsContent value="published" className="mt-4">
          <PublishedPostsSection accountId={selectedAccountId} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <RejectedPostsSection accountId={selectedAccountId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
