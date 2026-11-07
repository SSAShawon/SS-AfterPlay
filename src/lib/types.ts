export const GAME_STATUSES = [
  "completed",
  "playing",
  "on_hold",
  "dropped",
  "backlog",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  completed: "Completed",
  playing: "Currently Playing",
  on_hold: "On Hold",
  dropped: "Dropped",
  backlog: "Backlog",
};

export const PUBLICATION_STATES = ["draft", "published"] as const;
export type PublicationState = (typeof PUBLICATION_STATES)[number];

export const TIMELINE_EVENT_TYPES = [
  "game_started",
  "game_completed",
  "milestone",
  "journal",
  "other",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  game_started: "Game started",
  game_completed: "Game completed",
  milestone: "Milestone",
  journal: "Journal",
  other: "Other",
};

export const FEATURED_SLOTS = [
  "hero",
  "featured_game",
  "featured_memory",
  "featured_journal",
] as const;

export type FeaturedSlot = (typeof FEATURED_SLOTS)[number];

export const STORY_CRITERIA = [
  { value: "gameplay", label: "Gameplay" },
  { value: "graphics", label: "Graphics" },
  { value: "sound", label: "Sound Design" },
  { value: "music", label: "Music" },
  { value: "open_world", label: "Open World" },
  { value: "storytelling", label: "Storytelling" },
] as const;

export interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  developer: string | null;
  publisher: string | null;
  release_year: number | null;
  genres: string[];
  platforms: string[];
  status: GameStatus;
  rating: number | null;
  cover_url: string | null;
  hero_url: string | null;
  summary: string | null;
  setting: string | null;
  gameplay_type: string | null;
  main_theme: string | null;
  why_archived: string | null;
  storyline: string | null;
  best_aspect: string | null;
  biggest_weakness: string | null;
  recommendation: string | null;
  replay_recommendation: string | null;
  final_verdict: string | null;
  playtime_hours: number | null;
  started_on: string | null;
  completed_on: string | null;
  featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameChapter {
  id: string;
  game_id: string;
  title: string;
  summary: string | null;
  important_events: string | null;
  story_developments: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GameCharacter {
  id: string;
  game_id: string;
  name: string;
  portrait_url: string | null;
  role: string | null;
  personality: string | null;
  background: string | null;
  development: string | null;
  analysis: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GameMoment {
  id: string;
  game_id: string;
  title: string;
  description: string | null;
  why_memorable: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GameReview {
  id: string;
  game_id: string;
  category: string;
  label: string;
  score: number | null;
  body: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  category_id: string | null;
  reading_minutes: number | null;
  status: PublicationState;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  title: string;
  game_id: string | null;
  description: string | null;
  timeframe: string | null;
  occurred_on: string | null;
  image_url: string | null;
  featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RankingCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  category_id: string;
  game_id: string;
  position: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: TimelineEventType;
  game_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  hero_kicker: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  about_content: string | null;
  footer_note: string | null;
  contact_email: string | null;
  social_links: SocialLink[];
  updated_at: string;
}

export interface FeaturedContent {
  id: string;
  slot: FeaturedSlot;
  game_id: string | null;
  memory_id: string | null;
  journal_post_id: string | null;
  headline: string | null;
  subline: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type JournalPostWithCategory = JournalPost & {
  journal_categories: Pick<JournalCategory, "name" | "slug"> | null;
};

export type MemoryWithGame = Memory & {
  games: Pick<Game, "slug" | "title" | "cover_url"> | null;
};

export type TimelineEventWithGame = TimelineEvent & {
  games: Pick<Game, "slug" | "title"> | null;
};

export type RankingWithGame = Ranking & {
  games: Pick<Game, "slug" | "title" | "cover_url" | "rating" | "release_year" | "status"> | null;
};

export type GameCardData = Pick<
  Game,
  | "id"
  | "slug"
  | "title"
  | "cover_url"
  | "status"
  | "rating"
  | "release_year"
  | "genres"
  | "platforms"
  | "summary"
>;

export interface SearchResultGroup {
  games: Pick<Game, "id" | "slug" | "title" | "cover_url" | "release_year" | "status">[];
  posts: Pick<JournalPost, "id" | "slug" | "title" | "excerpt" | "cover_url">[];
  characters: {
    id: string;
    name: string;
    role: string | null;
    portrait_url: string | null;
    game_slug: string;
    game_title: string;
  }[];
  memories: Pick<Memory, "id" | "title" | "description" | "occurred_on">[];
  chapters: {
    id: string;
    title: string;
    game_slug: string;
    game_title: string;
  }[];
}
