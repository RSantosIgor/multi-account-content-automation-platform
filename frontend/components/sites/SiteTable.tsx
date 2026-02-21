'use client';

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
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

export type Site = {
  id: string;
  xAccountId: string;
  name: string;
  url: string;
  sourceType: 'rss' | 'html' | 'auto';
  feedUrl: string | null;
  scrapingConfig: Record<string, string> | null;
  scrapingIntervalHours: number;
  isActive: boolean;
  lastScrapedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SiteTableProps = {
  accountId: string;
  sites: Site[];
};

export function SiteTable({ accountId, sites: initialSites }: SiteTableProps) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (siteId: string) => {
    setDeletingId(siteId);
    try {
      await apiClient(`/api/v1/accounts/${accountId}/sites/${siteId}`, {
        method: 'DELETE',
      });
      toast.success('Site deleted successfully');
      setSites((prev) => prev.filter((site) => site.id !== siteId));
    } catch {
      toast.error('Failed to delete site');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (siteId: string, currentStatus: boolean) => {
    setTogglingId(siteId);
    const newStatus = !currentStatus;

    try {
      await apiClient(`/api/v1/accounts/${accountId}/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      setSites((prev) =>
        prev.map((site) => (site.id === siteId ? { ...site, isActive: newStatus } : site)),
      );
      toast.success(newStatus ? 'Site activated' : 'Site deactivated');
    } catch {
      toast.error('Failed to update site status');
    } finally {
      setTogglingId(null);
    }
  };

  const getSourceTypeBadge = (type: 'rss' | 'html' | 'auto') => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      rss: 'default',
      html: 'secondary',
      auto: 'outline',
    };

    return (
      <Badge variant={variants[type] || 'outline'} className="uppercase">
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sites.length === 0) {
    return (
      <div className="bg-card rounded-lg border py-12 text-center">
        <p className="text-muted-foreground">No sites configured yet.</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Add your first news site to start collecting articles.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Scraped</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell className="font-medium">{site.name}</TableCell>
              <TableCell>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm hover:underline"
                >
                  {new URL(site.url).hostname}
                </a>
              </TableCell>
              <TableCell>{getSourceTypeBadge(site.sourceType)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(site.lastScrapedAt)}
              </TableCell>
              <TableCell>
                <Switch
                  checked={site.isActive}
                  onCheckedChange={() => handleToggle(site.id, site.isActive)}
                  disabled={togglingId === site.id}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/accounts/${accountId}/sites/${site.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={deletingId === site.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{site.name}</strong> and all
                          associated articles. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(site.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
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
  );
}
