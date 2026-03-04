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

export type NewsletterSource = {
  id: string;
  x_account_id: string;
  name: string;
  sender_email: string;
  feed_url: string | null;
  webhook_secret: string | null;
  is_active: boolean;
  last_scraped_at: string | null;
  created_at: string;
};

const createSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sender_email: z.string().email('E-mail inválido'),
  feed_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

const editSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sender_email: z.string().email('E-mail inválido'),
  feed_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function CreateDialog({
  accountId,
  onCreated,
}: {
  accountId: string;
  onCreated: (s: NewsletterSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', sender_email: '', feed_url: '' },
  });

  async function onSubmit(values: CreateValues) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        feed_url: values.feed_url || undefined,
      };
      const res = await apiClient<{ data: NewsletterSource }>(
        `/api/v1/accounts/${accountId}/sources/newsletters`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      onCreated(res.data);
      toast.success('Newsletter adicionada');
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar newsletter');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Newsletter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Newsletter / Blog</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="The Pragmatic Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sender_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Remetente</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="newsletter@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Usado para identificar e-mails recebidos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feed_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Feed RSS (opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/feed.xml" {...field} />
                  </FormControl>
                  <FormDescription>
                    Se disponível, o feed RSS será verificado automaticamente
                  </FormDescription>
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
  source: NewsletterSource;
  onUpdated: (s: NewsletterSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: source.name,
      sender_email: source.sender_email,
      feed_url: source.feed_url ?? '',
    },
  });

  async function onSubmit(values: EditValues) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        feed_url: values.feed_url || undefined,
      };
      const res = await apiClient<{ data: NewsletterSource }>(
        `/api/v1/accounts/${accountId}/sources/newsletters/${source.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      onUpdated(res.data);
      toast.success('Newsletter atualizada');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar newsletter');
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
          <DialogTitle>Editar Newsletter</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sender_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Remetente</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feed_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Feed RSS (opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
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
  initialSources: NewsletterSource[];
};

export function NewsletterSourceTable({ accountId, initialSources }: Props) {
  const [sources, setSources] = useState<NewsletterSource[]>(initialSources);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await apiClient<{ data: NewsletterSource }>(
        `/api/v1/accounts/${accountId}/sources/newsletters/${id}`,
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
      await apiClient(`/api/v1/accounts/${accountId}/sources/newsletters/${id}`, {
        method: 'DELETE',
      });
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Newsletter removida');
    } catch {
      toast.error('Erro ao remover newsletter');
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
          <p className="text-muted-foreground">Nenhuma newsletter configurada.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione uma newsletter ou blog para começar a ingerir conteúdo.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Feed RSS</TableHead>
                <TableHead>Última verificação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((src) => (
                <TableRow key={src.id}>
                  <TableCell className="font-medium">{src.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {src.sender_email}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {src.feed_url ? (
                      <a
                        href={src.feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold hover:underline"
                      >
                        {new URL(src.feed_url).hostname}
                      </a>
                    ) : (
                      '—'
                    )}
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
                            <AlertDialogTitle>Remover newsletter?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A newsletter <strong>{src.name}</strong> será removida
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
