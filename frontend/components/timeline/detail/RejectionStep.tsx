'use client';

import { Calendar, User, XCircle } from 'lucide-react';

type Suggestion = {
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type RejectionStepProps = {
  suggestion: Suggestion;
};

export function RejectionStep({ suggestion }: RejectionStepProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
      <div className="mb-4 flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-400" />
        <h3 className="text-lg font-semibold text-red-300">Sugestão Rejeitada</h3>
      </div>

      <div className="text-muted-foreground space-y-3 text-sm">
        <p>Esta sugestão foi revisada e rejeitada. Nenhum post foi publicado.</p>

        {suggestion.reviewedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Rejeitado em {new Date(suggestion.reviewedAt).toLocaleString()}</span>
          </div>
        )}

        {suggestion.reviewedBy && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Por {suggestion.reviewedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}
