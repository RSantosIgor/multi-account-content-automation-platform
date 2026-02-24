'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SiteOption = { id: string; name: string };

export type TimelineFiltersState = {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'posted' | 'published' | 'failed';
  siteId: string;
  from: string;
  to: string;
};

type TimelineFiltersProps = {
  accountId: string;
  value: TimelineFiltersState;
  onChange: (next: TimelineFiltersState) => void;
};

export function TimelineFilters({ accountId, value, onChange }: TimelineFiltersProps) {
  const [sites, setSites] = useState<SiteOption[]>([]);

  useEffect(() => {
    if (!accountId) return;
    apiClient<{ data: Array<{ id: string; name: string }> }>(`/api/v1/accounts/${accountId}/sites`)
      .then((res) => setSites(res.data.map((s) => ({ id: s.id, name: s.name }))))
      .catch(() => setSites([]));
  }, [accountId]);

  const reset = () =>
    onChange({
      status: 'all',
      siteId: '',
      from: '',
      to: '',
    });

  return (
    <div className="bg-card/70 space-y-4 rounded-lg border border-white/10 p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Select
          value={value.status}
          onValueChange={(v) => onChange({ ...value, status: v as TimelineFiltersState['status'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
            <SelectItem value="posted">Postados</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.siteId || 'all'}
          onValueChange={(v) => onChange({ ...value, siteId: v === 'all' ? '' : v })}
          disabled={sites.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os sites</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          placeholder="De"
        />
        <Input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          placeholder="Até"
        />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={reset}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
