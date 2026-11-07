import { z } from "zod";

import { GAME_STATUSES, PUBLICATION_STATES, TIMELINE_EVENT_TYPES } from "@/lib/types";

const emptyToNull = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value ?? null;
};

export const nullableString = z.preprocess(emptyToNull, z.string().max(200_000).nullable());

export const optionalUrl = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(2048)
    .refine((value) => /^https?:\/\/\S+$/i.test(value), "Enter a full https:// or http:// image URL")
    .nullable(),
);

export const nullableNumber = z.preprocess((value) => {
  const cleaned = emptyToNull(value);
  if (cleaned === null) return null;
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? cleaned : parsed;
}, z.number().nullable());

export const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const slug = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : ""),
  z
    .string()
    .min(1, "A slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens"),
);

export const requiredString = (label: string, max = 400) =>
  z.string().trim().min(1, `${label} is required`).max(max);

export const gameSchema = z.object({
  title: requiredString("Title", 200),
  slug,
  tagline: nullableString,
  developer: nullableString,
  publisher: nullableString,
  release_year: nullableNumber,
  genres: nullableString,
  platforms: nullableString,
  status: z.enum(GAME_STATUSES),
  rating: nullableNumber,
  cover_url: optionalUrl,
  hero_url: optionalUrl,
  summary: nullableString,
  setting: nullableString,
  gameplay_type: nullableString,
  main_theme: nullableString,
  why_archived: nullableString,
  storyline: nullableString,
  best_aspect: nullableString,
  biggest_weakness: nullableString,
  recommendation: nullableString,
  replay_recommendation: nullableString,
  final_verdict: nullableString,
  playtime_hours: nullableNumber,
  started_on: nullableString,
  completed_on: nullableString,
  featured: checkbox,
  is_published: checkbox,
});

export type GameInput = z.infer<typeof gameSchema>;

export const postSchema = z.object({
  title: requiredString("Title", 220),
  slug,
  excerpt: nullableString,
  content: nullableString,
  cover_url: optionalUrl,
  category_id: z.preprocess(emptyToNull, z.string().uuid().nullable()),
  reading_minutes: nullableNumber,
  status: z.enum(PUBLICATION_STATES),
  featured: checkbox,
  published_at: nullableString,
});

export const categorySchema = z.object({
  name: requiredString("Name", 120),
  slug,
  description: nullableString,
  sort_order: nullableNumber,
});

export const memorySchema = z.object({
  title: requiredString("Title", 200),
  game_id: z.preprocess(emptyToNull, z.string().uuid().nullable()),
  description: nullableString,
  timeframe: nullableString,
  occurred_on: nullableString,
  image_url: optionalUrl,
  featured: checkbox,
  is_published: checkbox,
  sort_order: nullableNumber,
});

export const timelineSchema = z.object({
  title: requiredString("Title", 200),
  description: nullableString,
  event_date: requiredString("Date", 40),
  event_type: z.enum(TIMELINE_EVENT_TYPES),
  game_id: z.preprocess(emptyToNull, z.string().uuid().nullable()),
  is_published: checkbox,
});

export const rankingCategorySchema = z.object({
  title: requiredString("Title", 140),
  slug,
  description: nullableString,
  sort_order: nullableNumber,
});

export const settingsSchema = z.object({
  site_name: requiredString("Site name", 120),
  tagline: requiredString("Tagline", 200),
  hero_kicker: nullableString,
  hero_headline: nullableString,
  hero_subline: nullableString,
  about_content: nullableString,
  footer_note: nullableString,
  contact_email: z.preprocess(
    emptyToNull,
    z.string().email("Enter a valid email address").nullable(),
  ),
  social_links: nullableString,
});

export const childSchemas = {
  chapter: z.object({
    title: requiredString("Chapter title", 220),
    summary: nullableString,
    important_events: nullableString,
    story_developments: nullableString,
  }),
  character: z.object({
    name: requiredString("Character name", 160),
    portrait_url: optionalUrl,
    role: nullableString,
    personality: nullableString,
    background: nullableString,
    development: nullableString,
    analysis: nullableString,
  }),
  moment: z.object({
    title: requiredString("Moment title", 220),
    description: nullableString,
    why_memorable: nullableString,
    image_url: optionalUrl,
  }),
  review: z.object({
    category: requiredString("Category key", 60),
    label: requiredString("Label", 120),
    score: nullableNumber,
    body: nullableString,
  }),
} as const;

export type ChildKind = keyof typeof childSchemas;

export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function flattenIssues(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
