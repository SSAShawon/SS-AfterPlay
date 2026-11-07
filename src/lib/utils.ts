import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(value: string | null | undefined, style: "long" | "short" = "long") {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatYear(value: string | null | undefined) {
  const formatted = formatDate(value);
  return formatted ? formatted.split(" ").slice(-1)[0] : null;
}

export function formatRating(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

export function readingTime(content: string | null | undefined) {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function pad(index: number) {
  return String(index).padStart(2, "0");
}

export function truncate(value: string, length = 160) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function toDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function groupByYear<T extends { event_date: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const year = item.event_date.slice(0, 4);
    const existing = map.get(year) ?? [];
    existing.push(item);
    map.set(year, existing);
  }
  return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
}

export const SITE_NAME = "SS AFTERPLAY";
export const SITE_TAGLINE = "The game ends. The memories don't.";
export const SITE_DESCRIPTION =
  "SS AFTERPLAY is a personal cinematic gaming archive: storylines, chapters, characters, memorable moments, ratings, rankings and journal entries from one player's collection.";
