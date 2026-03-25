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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type NewsSiteSource = {
  id: string;
  x_account_id: string;
  site_name: string;
  site_url: string;
  source_type: string;
  feed_url: string | null;
  scraping_config: Record<string, string> | null;
  is_active: boolean;
  auto_flow: boolean;
  scraping_interval_hours: number;
  last_scraped_at: string | null;
  created_at: string;
};

const createSchema = z.object({
  site_name: z.string().min(1, 'Nome é obrigatório').max(100),
  site_url: z.string().url('URL inválida'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).default(4),
  auto_flow: z.boolean().default(false),
});

const editSchema = z.object({
  site_name: z.string().min(1, 'Nome é obrigatório').max(100),
  site_url: z.string().url('URL inválida'),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168),
  auto_flow: z.boolean(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function CreateDialog({
  accountId,
  onCreated,
}: {
  accountId: string;
  onCreated: (s: NewsSiteSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { site_name: '', site_url: '', scraping_interval_hours: 4, auto_flow: false },
  });

  async function onSubmit(values: CreateValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: NewsSiteSource }>(
        `/api/v1/accounts/${accountId}/sources/news-sites`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onCreated(res.data);
      toast.success('Site adicionado');
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar site');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Site de Notícias</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Site</FormLabel>
                  <FormControl>
                    <Input placeholder="TechCrunch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Site</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://techcrunch.com" {...field} />
                  </FormControl>
                  <FormDescription>O RSS será detectado automaticamente</FormDescription>
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
            <FormField
              control={form.control}
              name="auto_flow"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Fluxo Automático</FormLabel>
                    <FormDescription>
                      Artigos elegíveis são publicados automaticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
  source: NewsSiteSource;
  onUpdated: (s: NewsSiteSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      site_name: source.site_name,
      site_url: source.site_url,
      scraping_interval_hours: source.scraping_interval_hours,
      auto_flow: source.auto_flow,
    },
  });

  async function onSubmit(values: EditValues) {
    setSaving(true);
    try {
      const res = await apiClient<{ data: NewsSiteSource }>(
        `/api/v1/accounts/${accountId}/sources/news-sites/${source.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      onUpdated(res.data);
      toast.success('Site atualizado');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar site');
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
          <DialogTitle>Editar Site de Notícias</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Site</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Site</FormLabel>
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
                  <FormLabel>Intervalo (horas)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={168} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="auto_flow"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Fluxo Automático</FormLabel>
                    <FormDescription>
                      Artigos elegíveis são publicados automaticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
  initialSources: NewsSiteSource[];
};

export function NewsSiteSourceTable({ accountId, initialSources }: Props) {
  const [sources, setSources] = useState<NewsSiteSource[]>(initialSources);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await apiClient<{ data: NewsSiteSource }>(
        `/api/v1/accounts/${accountId}/sources/news-sites/${id}`,
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
      await apiClient(`/api/v1/accounts/${accountId}/sources/news-sites/${id}`, {
        method: 'DELETE',
      });
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Site removido');
    } catch {
      toast.error('Erro ao remover site');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRunNow(id: string) {
    setRunningId(id);
    try {
      const res = await apiClient<{ data: { itemsIngested: number; itemsSkipped: number } }>(
        `/api/v1/accounts/${accountId}/sources/news-sites/${id}/run`,
        { method: 'POST' },
      );
      toast.success(
        `Verificação concluída: ${res.data.itemsIngested} item(s) ingerido(s), ${res.data.itemsSkipped} ignorado(s)`,
      );
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, last_scraped_at: new Date().toISOString() } : s)),
      );
    } catch {
      toast.error('Falha ao verificar site');
    } finally {
      setRunningId(null);
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
          <p className="text-muted-foreground">Nenhum site de notícias configurado.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione um site para começar a ingerir artigos via RSS ou HTML.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Tipo</TableHead>
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
                      href={src.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold hover:underline"
                    >
                      {src.site_name}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase">
                      {src.source_type}
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRunNow(src.id)}
                              disabled={runningId === src.id || !src.is_active}
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${runningId === src.id ? 'animate-spin' : ''}`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verificar agora</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                            <AlertDialogTitle>Remover site?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O site <strong>{src.site_name}</strong> será removido permanentemente.
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
