'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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

export type YoutubeSource = {
  id: string;
  x_account_id: string;
  channel_id: string;
  channel_name: string;
  channel_url: string;
  is_active: boolean;
  scraping_interval_hours: number;
  last_scraped_at: string | null;
  created_at: string;
};

const createSchema = z.object({
  channel_id: z.string().min(1, 'Channel ID é obrigatório'),
  channel_name: z.string().min(1, 'Nome é obrigatório'),
  channel_url: z.string().url('URL inválida'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).default(6),
});

const editSchema = z.object({
  channel_name: z.string().min(1, 'Nome é obrigatório'),
  channel_url: z.string().url('URL inválida'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function CreateDialog({
  accountId,
  onCreated,
}: {
  accountId: string;
  onCreated: (s: YoutubeSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      channel_id: '',
      channel_name: '',
      channel_url: '',
      scraping_interval_hours: 6,
    },
  });

  async function onSubmit(values: CreateValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: YoutubeSource }>(
        `/api/v1/accounts/${accountId}/sources/youtube`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onCreated(res.data);
      toast.success('Canal YouTube adicionado');
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar canal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Canal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Canal YouTube</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel ID</FormLabel>
                  <FormControl>
                    <Input placeholder="UCxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Canal</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech News Daily" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Canal</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://youtube.com/@..." {...field} />
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
  source: YoutubeSource;
  onUpdated: (s: YoutubeSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      channel_name: source.channel_name,
      channel_url: source.channel_url,
      scraping_interval_hours: source.scraping_interval_hours,
    },
  });

  async function onSubmit(values: EditValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: YoutubeSource }>(
        `/api/v1/accounts/${accountId}/sources/youtube/${source.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onUpdated(res.data);
      toast.success('Canal atualizado');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar canal');
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
          <DialogTitle>Editar Canal YouTube</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channel_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Canal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Canal</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
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
  initialSources: YoutubeSource[];
};

export function YouTubeSourceTable({ accountId, initialSources }: Props) {
  const [sources, setSources] = useState<YoutubeSource[]>(initialSources);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await apiClient<{ data: YoutubeSource }>(
        `/api/v1/accounts/${accountId}/sources/youtube/${id}`,
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
      await apiClient(`/api/v1/accounts/${accountId}/sources/youtube/${id}`, {
        method: 'DELETE',
      });
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Canal removido');
    } catch {
      toast.error('Erro ao remover canal');
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
          <p className="text-muted-foreground">Nenhum canal YouTube configurado.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione um canal para começar a ingerir vídeos.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Channel ID</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Última verificação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((src) => (
                <TableRow key={src.id}>
                  <TableCell className="font-medium">
                    <a
                      href={src.channel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold hover:underline"
                    >
                      {src.channel_name}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {src.channel_id.length > 12
                        ? `${src.channel_id.slice(0, 12)}…`
                        : src.channel_id}
                    </Badge>
                  </TableCell>
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
                            <AlertDialogTitle>Remover canal?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O canal <strong>{src.channel_name}</strong> será removido
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
