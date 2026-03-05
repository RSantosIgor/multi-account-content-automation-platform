'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type Angle = {
  angle: string;
  rationale: string;
};

interface AngleSelectorProps {
  angles: Angle[];
  preselected: string | null;
  briefId: string;
  accountId: string;
  disabled?: boolean;
  onGenerated: (suggestion: { id: string; suggestion_text: string; hashtags: string[] }) => void;
}

export function AngleSelector({
  angles,
  preselected,
  briefId,
  accountId,
  disabled = false,
  onGenerated,
}: AngleSelectorProps) {
  const [selected, setSelected] = useState<string>(preselected ?? angles[0]?.angle ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!selected || loading) return;
    setLoading(true);
    setError(null);

    try {
      // Save the selected angle
      await apiClient<void>(`/api/v1/accounts/${accountId}/editorial/briefs/${briefId}`, {
        method: 'PATCH',
        body: JSON.stringify({ selected_angle: selected }),
      });

      // Generate the suggestion
      const json = await apiClient<{
        data: { id: string; suggestion_text: string; hashtags: string[] };
      }>(`/api/v1/accounts/${accountId}/editorial/briefs/${briefId}/generate`, { method: 'POST' });
      onGenerated(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  if (angles.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum ângulo sugerido disponível.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Escolha um ângulo para o post:</p>

      <div className="space-y-2">
        {angles.map((a) => {
          const isSelected = selected === a.angle;
          return (
            <button
              key={a.angle}
              type="button"
              disabled={disabled || loading}
              onClick={() => setSelected(a.angle)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-gold/60 bg-gold/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5',
                (disabled || loading) && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-start gap-2">
                <CheckCircle
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    isSelected ? 'text-gold' : 'text-muted-foreground',
                  )}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-snug">{a.angle}</p>
                  {a.rationale && <p className="text-muted-foreground text-xs">{a.rationale}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={!selected || disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          'Gerar Post'
        )}
      </Button>
    </div>
  );
}
