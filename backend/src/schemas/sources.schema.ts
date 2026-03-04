import { z } from 'zod';

// ── YouTube sources ───────────────────────────────────────────────────────────

export const createYoutubeSourceSchema = z.object({
  channel_id: z.string().min(1),
  channel_name: z.string().min(1),
  channel_url: z.string().url(),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).default(6),
});

export const updateYoutubeSourceSchema = z.object({
  channel_name: z.string().min(1).optional(),
  channel_url: z.string().url().optional(),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).optional(),
  is_active: z.boolean().optional(),
});

// ── X feed sources ────────────────────────────────────────────────────────────

export const createXFeedSourceSchema = z.object({
  feed_username: z.string().min(1),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).default(4),
});

export const updateXFeedSourceSchema = z.object({
  feed_username: z.string().min(1).optional(),
  scraping_interval_hours: z.coerce.number().int().min(1).max(168).optional(),
  is_active: z.boolean().optional(),
});

// ── Newsletter sources ────────────────────────────────────────────────────────

export const createNewsletterSourceSchema = z.object({
  name: z.string().min(1),
  sender_email: z.string().email(),
  feed_url: z.string().url().optional(),
});

export const updateNewsletterSourceSchema = z.object({
  name: z.string().min(1).optional(),
  sender_email: z.string().email().optional(),
  feed_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});
