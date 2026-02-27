import { z } from 'zod';

/**
 * Scraping configuration for HTML-based sites
 */
export const scrapingConfigSchema = z.object({
  article_selector: z.string().min(1),
  title_selector: z.string().min(1),
  summary_selector: z.string().min(1),
  link_selector: z.string().min(1),
});

/**
 * Schema for creating a news site
 */
export const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  scraping_interval_hours: z.number().int().min(1).max(168).default(4),
  scraping_config: scrapingConfigSchema.optional(),
  auto_flow: z.boolean().default(false),
});

/**
 * Schema for updating a news site
 */
export const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  scraping_interval_hours: z.number().int().min(1).max(168).optional(),
  scraping_config: scrapingConfigSchema.optional(),
  is_active: z.boolean().optional(),
  auto_flow: z.boolean().optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type ScrapingConfig = z.infer<typeof scrapingConfigSchema>;
