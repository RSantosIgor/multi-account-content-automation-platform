'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

type PublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  suggestionId?: string;
  initialContent: string;
  isPremium?: boolean;
  onSuccess?: () => void;
};

export function PublishDialog({
  open,
  onOpenChange,
  accountId,
  suggestionId,
  initialContent,
  isPremium = false,
  onSuccess,
}: PublishDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [open, initialContent]);
  const queryClient = useQueryClient();

  const charLimit = isPremium ? 25000 : 280;
  const characters = content.length;
  const overLimit = characters > charLimit;

  const handlePublish = async () => {
    if (overLimit) {
      toast.error(`O texto excede o limite de ${charLimit.toLocaleString()} caracteres`);
      return;
    }

    setIsPublishing(true);
    try {
      await apiClient(`/api/v1/accounts/${accountId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          content,
        }),
      });

      toast.success('Post publicado com sucesso!');
      onOpenChange(false);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pendingPosts.list(accountId),
      });
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao publicar post';
      toast.error(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Publicar no X</DialogTitle>
          <DialogDescription>
            Revise seu texto antes de publicar. Esta é sua última chance de fazer edições.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
            placeholder="Digite seu post..."
          />
          <div className="flex justify-end">
            <span className={`text-sm ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {characters.toLocaleString()}/{charLimit.toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancelar
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing || overLimit}>
            {isPublishing ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
