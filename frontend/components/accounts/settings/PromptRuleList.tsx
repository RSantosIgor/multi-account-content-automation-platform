'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import type { PromptRule } from './PromptRuleForm';

type PromptRuleListProps = {
  accountId: string;
  rules: PromptRule[];
  onEdit: (rule: PromptRule) => void;
  onDelete: () => void;
  onToggle: () => void;
};

export function PromptRuleList({
  accountId,
  rules,
  onEdit,
  onDelete,
  onToggle,
}: PromptRuleListProps) {
  async function handleToggle(rule: PromptRule) {
    try {
      await apiClient(`/api/v1/accounts/${accountId}/prompt-rules/${rule.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: !rule.is_active,
        }),
      });
      toast.success(rule.is_active ? 'Regra desativada' : 'Regra ativada');
      onToggle();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar regra';
      toast.error(msg);
    }
  }

  async function handleDelete(rule: PromptRule) {
    if (!confirm(`Tem certeza que deseja excluir a regra "${rule.rule_name}"?`)) {
      return;
    }

    try {
      await apiClient(`/api/v1/accounts/${accountId}/prompt-rules/${rule.id}`, {
        method: 'DELETE',
      });
      toast.success('Regra excluída com sucesso');
      onDelete();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao excluir regra';
      toast.error(msg);
    }
  }

  if (rules.length === 0) {
    return (
      <div className="bg-card/70 rounded-xl border border-dashed border-white/15 p-8 text-center">
        <h3 className="font-display text-xl">Nenhuma regra configurada</h3>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Crie sua primeira regra de prompt para personalizar as sugestões de IA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-white/10 p-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{rule.rule_name}</h4>
              <Badge variant={rule.rule_type === 'publication' ? 'default' : 'secondary'}>
                {rule.rule_type === 'publication' ? 'Publicação' : 'Análise'}
              </Badge>
              {!rule.is_active && (
                <Badge variant="outline" className="opacity-50">
                  Inativa
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm">{rule.prompt_text}</p>

            <div className="text-muted-foreground flex items-center gap-4 text-xs">
              <span>Prioridade: {rule.priority}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={rule.is_active}
              onCheckedChange={() => handleToggle(rule)}
              aria-label="Ativar/Desativar regra"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(rule)}
              aria-label="Editar regra"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(rule)}
              aria-label="Excluir regra"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
