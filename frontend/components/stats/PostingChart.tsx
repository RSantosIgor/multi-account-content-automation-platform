'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DailyPost = {
  date: string;
  count: number;
};

type PostingChartProps = {
  data: DailyPost[];
};

export function PostingChart({ data }: PostingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card flex h-[300px] items-center justify-center rounded-lg border border-white/10">
        <p className="text-muted-foreground text-sm">
          Nenhum dado disponível para o período selecionado
        </p>
      </div>
    );
  }

  // Format date for display (DD/MM)
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  return (
    <div className="bg-card rounded-lg border border-white/10 p-6">
      <h3 className="mb-4 text-lg font-semibold">Atividade de Publicação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="displayDate"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
            fontSize={12}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
            fontSize={12}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
