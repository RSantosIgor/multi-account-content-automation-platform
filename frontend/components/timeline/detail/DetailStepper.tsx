'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OriginalArticleStep } from './OriginalArticleStep';
import { SuggestionStep } from './SuggestionStep';
import { PublicationStep } from './PublicationStep';

type ArticleSummary = {
  bullets: string[];
};

type TimelineItemDetail = {
  type: 'suggestion' | 'post';
  suggestion: {
    id: string;
    articleId: string;
    xAccountId: string;
    status: string;
    suggestionText: string;
    hashtags: string[];
    articleSummary: ArticleSummary | null;
    createdAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
  } | null;
  article: {
    id: string;
    url: string;
    title: string;
    summary: string | null;
    publishedAt: string | null;
    fullContent: string | null;
    site: {
      id: string;
      name: string;
      url: string;
    } | null;
  } | null;
  post: {
    id: string;
    content: string;
    status: string;
    xPostUrl: string | null;
    xPostId: string | null;
    publishedAt: string | null;
    createdAt: string;
    errorMessage: string | null;
    suggestionId?: string | null;
  } | null;
};

type DetailStepperProps = {
  item: TimelineItemDetail;
  accountId: string;
};

type Step = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  component: React.ReactNode;
};

export function DetailStepper({ item, accountId }: DetailStepperProps) {
  const hasSuggestion = item.suggestion !== null;
  const hasPost = item.post !== null;
  const hasArticle = item.article !== null;

  const steps: Step[] = [
    {
      id: 1,
      title: 'Artigo Original',
      description: 'Artigo coletado da fonte',
      isCompleted: true,
      isCurrent: !hasSuggestion && !hasPost,
      component:
        hasArticle && item.article ? (
          <OriginalArticleStep article={item.article} />
        ) : (
          <div>Sem artigo</div>
        ),
    },
    {
      id: 2,
      title: 'Sugestão de IA',
      description: 'Post gerado pela IA',
      isCompleted: hasSuggestion,
      isCurrent: hasSuggestion && !hasPost,
      component: hasSuggestion ? (
        <SuggestionStep
          suggestion={item.suggestion!}
          article={item.article}
          accountId={accountId}
        />
      ) : (
        <div className="text-muted-foreground text-sm">Sugestão não gerada ainda</div>
      ),
    },
    {
      id: 3,
      title: 'Publicação',
      description: 'Post publicado no X',
      isCompleted: hasPost,
      isCurrent: hasPost,
      component: hasPost ? (
        <PublicationStep post={item.post!} />
      ) : (
        <div className="text-muted-foreground text-sm">Post não publicado ainda</div>
      ),
    },
  ];

  return (
    <div className="flex gap-8">
      {/* Vertical stepper indicator */}
      <div className="flex flex-col gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  step.isCompleted
                    ? 'border-gold bg-gold/20 text-gold'
                    : step.isCurrent
                      ? 'border-gold bg-background text-gold'
                      : 'border-muted bg-background text-muted-foreground',
                )}
              >
                {step.isCompleted ? <Check className="h-5 w-5" /> : <Circle className="h-3 w-3" />}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'my-1 w-0.5 flex-1',
                    steps[index + 1].isCompleted || steps[index + 1].isCurrent
                      ? 'bg-gold'
                      : 'bg-muted',
                  )}
                  style={{ minHeight: '100px' }}
                />
              )}
            </div>

            {/* Step label */}
            <div className="ml-4 pb-12">
              <div className="mb-1 font-semibold">{step.title}</div>
              <div className="text-muted-foreground text-sm">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 space-y-8">
        {steps.map((step) => (
          <div key={step.id} id={`step-${step.id}`}>
            {step.component}
          </div>
        ))}
      </div>
    </div>
  );
}
