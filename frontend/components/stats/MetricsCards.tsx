'use client';

import { TrendingUp, Calendar, CalendarRange, CalendarClock } from 'lucide-react';

type Metrics = {
  totalPosts: number;
  avgPerDay: number;
  avgPerWeek: number;
  avgPerMonth: number;
};

type MetricsCardsProps = {
  metrics: Metrics;
};

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total de Posts',
      value: metrics.totalPosts.toString(),
      icon: TrendingUp,
      description: 'Posts publicados no período',
    },
    {
      title: 'Média por Dia',
      value: metrics.avgPerDay.toFixed(2),
      icon: Calendar,
      description: 'Posts por dia',
    },
    {
      title: 'Média por Semana',
      value: metrics.avgPerWeek.toFixed(2),
      icon: CalendarRange,
      description: 'Posts por semana',
    },
    {
      title: 'Média por Mês',
      value: metrics.avgPerMonth.toFixed(1),
      icon: CalendarClock,
      description: 'Posts por mês',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-card rounded-lg border border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-2">
              <div className="text-muted-foreground text-sm font-medium">{card.title}</div>
              <Icon className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
