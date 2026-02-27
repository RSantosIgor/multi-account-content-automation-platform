'use client';

import { CheckCircle } from 'lucide-react';

type AnalysisStepProps = {
  isEligible: boolean;
  articleTitle: string;
};

export function AnalysisStep({ isEligible, articleTitle }: AnalysisStepProps) {
  return (
    <div className="rounded-lg border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Análise de Elegibilidade</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-sm">
            {isEligible
              ? 'Artigo considerado elegível pela IA para publicação.'
              : 'Artigo em análise.'}
          </span>
        </div>

        <div className="text-muted-foreground text-xs">
          A IA analisou o título e resumo de &ldquo;{articleTitle}&rdquo; e determinou que é
          adequado para gerar uma sugestão de tweet.
        </div>
      </div>
    </div>
  );
}
