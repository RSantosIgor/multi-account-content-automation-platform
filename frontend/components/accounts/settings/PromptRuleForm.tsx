'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export type PromptRule = {
  id: string;
  rule_type: 'analysis' | 'publication';
  rule_name: string;
  prompt_text: string;
  is_active: boolean;
  priority: number;
};

type PromptRuleFormProps = {
  accountId: string;
  rule?: PromptRule;
  onSuccess: () => void;
  onCancel: () => void;
};

export function PromptRuleForm({ accountId, rule, onSuccess, onCancel }: PromptRuleFormProps) {
  const [ruleType, setRuleType] = useState<'analysis' | 'publication'>(
    rule?.rule_type ?? 'publication',
  );
  const [ruleName, setRuleName] = useState(rule?.rule_name ?? '');
  const [promptText, setPromptText] = useState(rule?.prompt_text ?? '');
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [priority, setPriority] = useState(rule?.priority ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!ruleName.trim() || !promptText.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);

    try {
      if (rule) {
        // Update existing rule
        await apiClient(`/api/v1/accounts/${accountId}/prompt-rules/${rule.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            rule_name: ruleName,
            prompt_text: promptText,
            is_active: isActive,
            priority,
          }),
        });
        toast.success('Regra atualizada com sucesso');
      } else {
        // Create new rule
        await apiClient(`/api/v1/accounts/${accountId}/prompt-rules`, {
          method: 'POST',
          body: JSON.stringify({
            rule_type: ruleType,
            rule_name: ruleName,
            prompt_text: promptText,
            priority,
          }),
        });
        toast.success('Regra criada com sucesso');
      }

      onSuccess();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao salvar regra';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-semibold">{rule ? 'Editar Regra' : 'Nova Regra'}</h3>

      {!rule && (
        <div className="space-y-2">
          <Label htmlFor="rule-type">Tipo de Regra</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="publication"
                checked={ruleType === 'publication'}
                onChange={(e) => setRuleType(e.target.value as 'publication')}
                className="text-gold focus:ring-gold"
              />
              <span className="text-sm">Publicação</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="analysis"
                checked={ruleType === 'analysis'}
                onChange={(e) => setRuleType(e.target.value as 'analysis')}
                className="text-gold focus:ring-gold"
              />
              <span className="text-sm">Análise</span>
            </label>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rule-name">Nome da Regra *</Label>
        <Input
          id="rule-name"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          placeholder="Ex: Tom informal"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-text">Texto do Prompt *</Label>
        <Textarea
          id="prompt-text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ex: Use linguagem informal e descontraída"
          rows={4}
          maxLength={2000}
          className="resize-none"
        />
        <div className="text-muted-foreground text-right text-xs">{promptText.length}/2000</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioridade</Label>
        <Input
          id="priority"
          type="number"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
          min={0}
          max={999}
        />
        <p className="text-muted-foreground text-xs">
          Regras com menor prioridade são aplicadas primeiro
        </p>
      </div>

      {rule && (
        <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
          <Label htmlFor="is-active" className="text-sm">
            Regra Ativa
          </Label>
          <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : rule ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
