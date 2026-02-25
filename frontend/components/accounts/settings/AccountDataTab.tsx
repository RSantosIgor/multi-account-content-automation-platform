'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type AccountData = {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type AccountResponse = {
  data: AccountData;
};

type AccountDataTabProps = {
  accountId: string;
};

function AccountDataSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function AccountDataTab({ accountId }: AccountDataTabProps) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient<AccountResponse>(`/api/v1/accounts/${accountId}`);
        setAccount(res.data);
        setIsActive(res.data.isActive);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao carregar dados da conta';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAccount();
  }, [accountId]);

  async function handleToggleActive() {
    if (!account) return;

    setIsSaving(true);
    try {
      await apiClient(`/api/v1/accounts/${accountId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !isActive }),
      });

      setIsActive(!isActive);
      toast.success(isActive ? 'Conta desativada' : 'Conta ativada');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar status';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <AccountDataSkeleton />;

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 p-6">
        <div className="mb-6 flex items-center gap-4">
          {account.profileImageUrl && (
            <img
              src={account.profileImageUrl}
              alt={account.username}
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">@{account.username}</h2>
            {account.displayName && (
              <p className="text-muted-foreground text-sm">{account.displayName}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Username</Label>
            <div className="mt-1 text-base">@{account.username}</div>
          </div>

          {account.displayName && (
            <div>
              <Label className="text-muted-foreground text-sm">Nome de Exibição</Label>
              <div className="mt-1 text-base">{account.displayName}</div>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground text-sm">Conectada em</Label>
            <div className="mt-1 text-base">{new Date(account.createdAt).toLocaleString()}</div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active-switch" className="text-base">
                Conta Ativa
              </Label>
              <div className="text-muted-foreground text-sm">
                {isActive
                  ? 'A conta está ativa e coletando notícias'
                  : 'A conta está pausada e não está coletando notícias'}
              </div>
            </div>
            <Switch
              id="active-switch"
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <div className="bg-card/50 rounded-lg border border-white/10 p-6">
        <h3 className="mb-2 font-semibold">Desconectar Conta</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Ao desconectar, todos os sites e dados associados a esta conta serão removidos.
        </p>
        <Button variant="destructive" size="sm" disabled>
          Desconectar Conta (Em breve)
        </Button>
      </div>
    </div>
  );
}
