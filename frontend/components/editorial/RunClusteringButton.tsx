'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface RunClusteringButtonProps {
  accountId: string;
  size?: 'sm' | 'default';
  className?: string;
  onDone?: (briefsGenerated: number) => void;
}

export function RunClusteringButton({
  accountId,
  size = 'sm',
  className,
  onDone,
}: RunClusteringButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  async function handleRun() {
    setIsRunning(true);
    try {
      const result = await apiClient<{ data: { itemsTagged: number; briefsGenerated: number } }>(
        `/api/v1/accounts/${accountId}/editorial/run`,
        { method: 'POST' },
      );
      const { itemsTagged, briefsGenerated } = result.data;
      if (briefsGenerated > 0) {
        toast.success(
          `${briefsGenerated} brief${briefsGenerated > 1 ? 's' : ''} gerado${briefsGenerated > 1 ? 's' : ''}` +
            (itemsTagged > 0 ? ` (${itemsTagged} itens tagueados)` : ''),
        );
      } else if (itemsTagged > 0) {
        toast.info(`${itemsTagged} itens tagueados — aguardando mais conteúdo para clusterizar`);
      } else {
        toast.info('Nenhum conteúdo novo para processar');
      }
      onDone?.(briefsGenerated);
    } catch {
      toast.error('Falha ao rodar o clustering. Tente novamente.');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={cn('gap-2', className)}
      onClick={handleRun}
      disabled={isRunning}
    >
      <RefreshCw className={cn('h-4 w-4', isRunning && 'animate-spin')} />
      {isRunning ? 'Processando...' : 'Gerar Clusters'}
    </Button>
  );
}
