'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { AccountCard, type AccountCardData } from '@/components/accounts/AccountCard';
import { ConnectXButton } from '@/components/accounts/ConnectXButton';
import { Skeleton } from '@/components/ui/skeleton';

type AccountsResponse = {
  data: Array<{
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
    sitesCount: number;
    postsCount: number;
    isActive: boolean;
  }>;
};

function AccountsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-card/90 rounded-xl border border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Array<AccountCardData>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient<AccountsResponse>('/api/v1/accounts');
        setAccounts(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('It was not possible to load connected accounts.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadAccounts();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight">X Accounts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie contas conectadas e acompanhe sites e posts por perfil.
          </p>
        </div>
        <ConnectXButton />
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      ) : null}

      {isLoading ? <AccountsSkeleton /> : null}

      {!isLoading && accounts.length === 0 ? (
        <div className="bg-card/70 rounded-xl border border-dashed border-white/15 p-8 text-center">
          <h2 className="font-display text-2xl">Nenhuma conta conectada</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Conecte sua primeira conta do X para iniciar a coleta de noticias, gerar sugestoes e
            publicar no feed.
          </p>
          <div className="mt-5">
            <ConnectXButton />
          </div>
        </div>
      ) : null}

      {!isLoading && accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
