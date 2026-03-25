'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type TimelineFiltersState = {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'posted' | 'published' | 'failed';
  sourceType: string;
  from: string;
  to: string;
};

type TimelineFiltersProps = {
  accountId: string;
  value: TimelineFiltersState;
  onChange: (next: TimelineFiltersState) => void;
};

export function TimelineFilters({ value, onChange }: TimelineFiltersProps) {
  const reset = () =>
    onChange({
      status: 'all',
      sourceType: '',
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
          value={value.sourceType || 'all'}
          onValueChange={(v) => onChange({ ...value, sourceType: v === 'all' ? '' : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fontes</SelectItem>
            <SelectItem value="news_article">Sites de Notícias</SelectItem>
            <SelectItem value="youtube_video">YouTube</SelectItem>
            <SelectItem value="x_post">X (Twitter)</SelectItem>
            <SelectItem value="newsletter">Newsletters</SelectItem>
            <SelectItem value="editorial">Editorial</SelectItem>
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
