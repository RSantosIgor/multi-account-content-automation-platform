'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient, ApiError } from '@/lib/api/client';
import { PromptRuleForm, type PromptRule } from './PromptRuleForm';
import { PromptRuleList } from './PromptRuleList';

type PromptRulesResponse = {
  data: PromptRule[];
};

type PromptRulesTabProps = {
  accountId: string;
};

function PromptRulesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function PromptRulesTab({ accountId }: PromptRulesTabProps) {
  const [rules, setRules] = useState<PromptRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<PromptRule | undefined>(undefined);

  async function fetchRules() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient<PromptRulesResponse>(
        `/api/v1/accounts/${accountId}/prompt-rules`,
      );
      setRules(res.data.sort((a, b) => a.priority - b.priority));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao carregar regras';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchRules();
  }, [accountId]);

  function handleNewRule() {
    setEditingRule(undefined);
    setShowForm(true);
  }

  function handleEdit(rule: PromptRule) {
    setEditingRule(rule);
    setShowForm(true);
  }

  function handleSuccess() {
    setShowForm(false);
    setEditingRule(undefined);
    void fetchRules();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingRule(undefined);
  }

  if (isLoading) return <PromptRulesSkeleton />;

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Regras de Prompt Personalizadas</h3>
          <p className="text-muted-foreground text-sm">
            Configure regras para personalizar o comportamento da IA
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleNewRule} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Regra
          </Button>
        )}
      </div>

      {showForm && (
        <PromptRuleForm
          accountId={accountId}
          rule={editingRule}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {!showForm && (
        <PromptRuleList
          accountId={accountId}
          rules={rules}
          onEdit={handleEdit}
          onDelete={fetchRules}
          onToggle={fetchRules}
        />
      )}
    </div>
  );
}
