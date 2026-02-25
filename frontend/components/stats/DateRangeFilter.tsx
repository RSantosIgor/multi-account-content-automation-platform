'use client';

import { Button } from '@/components/ui/button';

export type DateRange = {
  from: string;
  to: string;
};

type DateRangeFilterProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    onChange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={value.from && value.to ? 'outline' : 'default'}
        size="sm"
        onClick={() => handlePreset(7)}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant={value.from && value.to ? 'outline' : 'default'}
        size="sm"
        onClick={() => handlePreset(30)}
      >
        Últimos 30 dias
      </Button>
      <Button
        variant={value.from && value.to ? 'outline' : 'default'}
        size="sm"
        onClick={() => handlePreset(90)}
      >
        Últimos 90 dias
      </Button>
      <Button variant="outline" size="sm" onClick={() => onChange({ from: '', to: '' })}>
        Todos
      </Button>
    </div>
  );
}
