'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export type XFeedSource = {
  id: string;
  x_account_id: string;
  feed_username: string;
  feed_user_id: string | null;
  is_active: boolean;
  scraping_interval_hours: number;
  last_scraped_at: string | null;
  created_at: string;
};

const createSchema = z.object({
  feed_username: z
    .string()
    .min(1, 'Username é obrigatório')
    .regex(/^[A-Za-z0-9_]+$/, 'Username inválido'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).default(4),
});

const editSchema = z.object({
  feed_username: z
    .string()
    .min(1, 'Username é obrigatório')
    .regex(/^[A-Za-z0-9_]+$/, 'Username inválido'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function CreateDialog({
  accountId,
  onCreated,
}: {
  accountId: string;
  onCreated: (s: XFeedSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { feed_username: '', scraping_interval_hours: 4 },
  });

  async function onSubmit(values: CreateValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: XFeedSource }>(
        `/api/v1/accounts/${accountId}/sources/x-feeds`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onCreated(res.data);
      toast.success('Feed do X adicionado');
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar feed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Feed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Feed do X</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feed_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username do X</FormLabel>
                  <FormControl>
                    <Input placeholder="elonmusk" {...field} />
                  </FormControl>
                  <FormDescription>Sem o @</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scraping_interval_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervalo de verificação (horas)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={168} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                Adicionar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  accountId,
  source,
  onUpdated,
}: {
  accountId: string;
  source: XFeedSource;
  onUpdated: (s: XFeedSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      feed_username: source.feed_username,
      scraping_interval_hours: source.scraping_interval_hours,
    },
  });

  async function onSubmit(values: EditValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: XFeedSource }>(
        `/api/v1/accounts/${accountId}/sources/x-feeds/${source.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onUpdated(res.data);
      toast.success('Feed atualizado');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar feed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Feed do X</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feed_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scraping_interval_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervalo (horas)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={168} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  accountId: string;
  initialSources: XFeedSource[];
};

export function XFeedSourceTable({ accountId, initialSources }: Props) {
  const [sources, setSources] = useState<XFeedSource[]>(initialSources);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await apiClient<{ data: XFeedSource }>(
        `/api/v1/accounts/${accountId}/sources/x-feeds/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !current }),
        },
      );
      setSources((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiClient(`/api/v1/accounts/${accountId}/sources/x-feeds/${id}`, {
        method: 'DELETE',
      });
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Feed removido');
    } catch {
      toast.error('Erro ao remover feed');
    } finally {
      setDeletingId(null);
    }
  }

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Nunca';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateDialog accountId={accountId} onCreated={(s) => setSources((prev) => [s, ...prev])} />
      </div>

      {sources.length === 0 ? (
        <div className="bg-card rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Nenhum feed do X configurado.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione um usuário do X para monitorar seus tweets.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Última verificação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((src) => (
                <TableRow key={src.id}>
                  <TableCell className="font-medium">@{src.feed_username}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {src.scraping_interval_hours}h
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(src.last_scraped_at)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={src.is_active}
                      onCheckedChange={() => handleToggle(src.id, src.is_active)}
                      disabled={togglingId === src.id}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EditDialog
                        accountId={accountId}
                        source={src}
                        onUpdated={(updated) =>
                          setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deletingId === src.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover feed?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O feed <strong>@{src.feed_username}</strong> será removido
                              permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(src.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
