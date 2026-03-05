interface TrendIndicatorProps {
  score: number;
  max?: number;
}

export function TrendIndicator({ score, max = 10 }: TrendIndicatorProps) {
  const pct = Math.min((score / max) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
        <div className="bg-gold h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-muted-foreground text-xs">{score.toFixed(1)}</span>
    </div>
  );
}
