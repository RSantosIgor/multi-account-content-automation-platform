'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountDataTab } from '@/components/accounts/settings/AccountDataTab';
import { PromptRulesTab } from '@/components/accounts/settings/PromptRulesTab';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default function AccountSettingsPage({ params }: PageProps) {
  const [accountId, setAccountId] = useState<string>('');

  useEffect(() => {
    params.then((p) => setAccountId(p.accountId));
  }, [params]);

  if (!accountId) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="font-display text-3xl leading-tight">Configurações da Conta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie dados da conta e regras de prompt personalizadas.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Dados da Conta</TabsTrigger>
          <TabsTrigger value="prompts">Regras de Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountDataTab accountId={accountId} />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptRulesTab accountId={accountId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
