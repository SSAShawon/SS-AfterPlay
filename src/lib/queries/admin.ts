import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  FeaturedContent,
  Game,
  GameChapter,
  GameCharacter,
  GameMoment,
  GameReview,
  GameStatus,
  JournalCategory,
  JournalPost,
  Memory,
  RankingCategory,
  Ranking,
  SiteSettings,
  TimelineEvent,
} from "@/lib/types";

/** Admin reads use the session client, so RLS returns drafts and unpublished rows. */

export async function getAdminStats() {
  const supabase = await createClient();

  const [games, posts, memories, timeline, featured] = await Promise.all([
    supabase.from("games").select("id,status,is_published,featured"),
    supabase.from("journal_posts").select("id,status,featured"),
    supabase.from("memories").select("id,is_published"),
    supabase.from("timeline_events").select("id,is_published"),
    supabase.from("featured_content").select("id,slot,is_active"),
  ]);

  const gameRows = (games.data ?? []) as { status: GameStatus; is_published: boolean; featured: boolean }[];
  const postRows = (posts.data ?? []) as { status: string; featured: boolean }[];
  const memoryRows = (memories.data ?? []) as { is_published: boolean }[];
  const timelineRows = (timeline.data ?? []) as { is_published: boolean }[];

  return {
    totalGames: gameRows.length,
    completedGames: gameRows.filter((row) => row.status === "completed").length,
    playingGames: gameRows.filter((row) => row.status === "playing").length,
    publishedGames: gameRows.filter((row) => row.is_published).length,
    draftGames: gameRows.filter((row) => !row.is_published).length,
    featuredGames: gameRows.filter((row) => row.featured).length,
    totalPosts: postRows.length,
    publishedPosts: postRows.filter((row) => row.status === "published").length,
    draftPosts: postRows.filter((row) => row.status === "draft").length,
    featuredPosts: postRows.filter((row) => row.featured).length,
    totalMemories: memoryRows.length,
    publishedMemories: memoryRows.filter((row) => row.is_published).length,
    totalTimeline: timelineRows.length,
    publishedTimeline: timelineRows.filter((row) => row.is_published).length,
    featuredSlots: (featured.data ?? []).length,
    error: games.error?.message ?? posts.error?.message ?? null,
  };
}

export async function getAdminRecentActivity() {
  const supabase = await createClient();

  const [games, posts, memories] = await Promise.all([
    supabase
      .from("games")
      .select("id,title,slug,updated_at,is_published,status")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("journal_posts")
      .select("id,title,slug,updated_at,status")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("memories")
      .select("id,title,updated_at,is_published")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  type Activity = {
    id: string;
    title: string;
    updated_at: string;
    kind: "game" | "journal" | "memory";
    href: string;
    meta: string;
  };

  const rows: Activity[] = [
    ...((games.data ?? []) as { id: string; title: string; updated_at: string; is_published: boolean; status: string }[]).map(
      (row) => ({
        id: row.id,
        title: row.title,
        updated_at: row.updated_at,
        kind: "game" as const,
        href: `/admin/games/${row.id}`,
        meta: row.is_published ? row.status : "draft",
      }),
    ),
    ...((posts.data ?? []) as { id: string; title: string; updated_at: string; status: string }[]).map((row) => ({
      id: row.id,
      title: row.title,
      updated_at: row.updated_at,
      kind: "journal" as const,
      href: `/admin/journal/${row.id}`,
      meta: row.status,
    })),
    ...((memories.data ?? []) as { id: string; title: string; updated_at: string; is_published: boolean }[]).map(
      (row) => ({
        id: row.id,
        title: row.title,
        updated_at: row.updated_at,
        kind: "memory" as const,
        href: `/admin/memories`,
        meta: row.is_published ? "published" : "draft",
      }),
    ),
  ];

  return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8);
}

export interface AdminGameRow {
  id: string;
  title: string;
  slug: string;
  status: GameStatus;
  rating: number | null;
  featured: boolean;
  is_published: boolean;
  updated_at: string;
  release_year: number | null;
  cover_url: string | null;
}

export async function listAdminGames(options: { search?: string; status?: string; state?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("games")
    .select("id,title,slug,status,rating,featured,is_published,updated_at,release_year,cover_url")
    .order("updated_at", { ascending: false });

  if (options.search?.trim()) query = query.ilike("title", `%${options.search.trim()}%`);
  if (options.status && options.status !== "all") query = query.eq("status", options.status);
  if (options.state === "published") query = query.eq("is_published", true);
  if (options.state === "draft") query = query.eq("is_published", false);

  const { data, error } = await query;
  return { rows: (data ?? []) as AdminGameRow[], error: error?.message ?? null };
}

export async function getAdminGame(id: string) {
  const supabase = await createClient();

  const { data: game } = await supabase.from("games").select("*").eq("id", id).maybeSingle();
  if (!game) return null;

  const [chapters, characters, moments, reviews, related] = await Promise.all([
    supabase.from("game_chapters").select("*").eq("game_id", id).order("sort_order"),
    supabase.from("game_characters").select("*").eq("game_id", id).order("sort_order"),
    supabase.from("game_memorable_moments").select("*").eq("game_id", id).order("sort_order"),
    supabase.from("game_reviews").select("*").eq("game_id", id).order("sort_order"),
    supabase.from("game_related").select("related_game_id,sort_order").eq("game_id", id).order("sort_order"),
  ]);

  return {
    game: game as Game,
    chapters: (chapters.data ?? []) as GameChapter[],
    characters: (characters.data ?? []) as GameCharacter[],
    moments: (moments.data ?? []) as GameMoment[],
    reviews: (reviews.data ?? []) as GameReview[],
    relatedIds: (related.data ?? []).map((row) => row.related_game_id as string),
  };
}

export async function listAdminPosts(options: { search?: string; state?: string; category?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("journal_posts")
    .select("id,title,slug,status,featured,published_at,updated_at,reading_minutes,cover_url,journal_categories(name)")
    .order("updated_at", { ascending: false });

  if (options.search?.trim()) query = query.ilike("title", `%${options.search.trim()}%`);
  if (options.state === "published") query = query.eq("status", "published");
  if (options.state === "draft") query = query.eq("status", "draft");
  if (options.category && options.category !== "all") query = query.eq("category_id", options.category);

  const { data, error } = await query;
  return {
    rows: (data ?? []) as unknown as (Pick<
      JournalPost,
      "id" | "title" | "slug" | "status" | "featured" | "published_at" | "updated_at" | "reading_minutes" | "cover_url"
    > & { journal_categories: { name: string } | null })[],
    error: error?.message ?? null,
  };
}

export async function getAdminPost(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("journal_posts").select("*").eq("id", id).maybeSingle();
  return (data as JournalPost) ?? null;
}

export async function getAdminCategories(): Promise<JournalCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("journal_categories").select("*").order("sort_order");
  return (data ?? []) as JournalCategory[];
}

export async function listAdminMemories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Memory[];
}

export async function listAdminTimeline() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .order("event_date", { ascending: false });
  return (data ?? []) as TimelineEvent[];
}

export async function getAdminRankings() {
  const supabase = await createClient();

  const [categories, entries, games] = await Promise.all([
    supabase.from("ranking_categories").select("*").order("sort_order"),
    supabase.from("rankings").select("*, games(title,slug,cover_url)").order("position"),
    supabase.from("games").select("id,title,slug,is_published").order("title"),
  ]);

  return {
    categories: (categories.data ?? []) as RankingCategory[],
    entries: (entries.data ?? []) as unknown as (Ranking & { games: { title: string; slug: string; cover_url: string | null } | null })[],
    games: (games.data ?? []) as { id: string; title: string; slug: string; is_published: boolean }[],
  };
}

export async function getAdminSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings) ?? null;
}

export async function getAdminFeatured(): Promise<FeaturedContent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("featured_content")
    .select("*")
    .order("slot")
    .order("sort_order");
  return (data ?? []) as FeaturedContent[];
}

export async function getAdminMemoryOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("memories").select("id,title").order("title");
  return (data ?? []) as { id: string; title: string }[];
}
