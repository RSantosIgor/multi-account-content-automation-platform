'use client';

import { ExternalLink, Calendar, Building } from 'lucide-react';

type ArticleSummary = {
  bullets: string[];
};

type Article = {
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
};

type OriginalArticleStepProps = {
  article: Article;
};

export function OriginalArticleStep({ article }: OriginalArticleStepProps) {
  // Try to parse article_summary from the summary field if it's JSON
  let summaryBullets: string[] | null = null;
  try {
    if (article.summary && article.summary.startsWith('{')) {
      const parsed = JSON.parse(article.summary) as ArticleSummary;
      summaryBullets = parsed.bullets;
    }
  } catch {
    // Not JSON, use as plain text
  }

  return (
    <div className="rounded-lg border border-white/10 p-6">
      <h3 className="mb-4 text-lg font-semibold">Artigo Original</h3>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-xl font-bold">{article.title}</h4>
        </div>

        {article.site && (
          <div className="flex items-center gap-2">
            <Building className="text-muted-foreground h-4 w-4" />
            <a
              href={article.site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 text-sm"
            >
              {article.site.name}
            </a>
          </div>
        )}

        {article.publishedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              Publicado em {new Date(article.publishedAt).toLocaleString()}
            </span>
          </div>
        )}

        <div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 inline-flex items-center gap-1 text-sm"
          >
            Ver artigo completo <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {summaryBullets && summaryBullets.length > 0 && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <h5 className="mb-2 text-sm font-semibold">Resumo do Artigo</h5>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {summaryBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!summaryBullets && article.summary && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <p className="text-muted-foreground text-sm">{article.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
