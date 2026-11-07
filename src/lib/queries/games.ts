import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery, unwrap } from "@/lib/queries/runner";
import type {
  Game,
  GameCardData,
  GameChapter,
  GameCharacter,
  GameMoment,
  GameReview,
  GameStatus,
  RankingWithGame,
} from "@/lib/types";

const CARD_COLUMNS =
  "id,slug,title,cover_url,status,rating,release_year,genres,platforms,summary";

export type GameSort = "recent" | "rating" | "title" | "release" | "playtime";

export interface GameFilters {
  search?: string;
  genre?: string;
  status?: GameStatus | "all";
  sort?: GameSort;
  page?: number;
  perPage?: number;
}

export interface GameListResult {
  items: GameCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  genres: string[];
}

export async function getGames(filters: GameFilters = {}): Promise<GameListResult> {
  const { search = "", genre = "", status = "all", sort = "recent", page = 1, perPage = 12 } = filters;

  return safeQuery<GameListResult>(
    "games.list",
    async () => {
      const supabase = createPublicClient();

      let query = supabase
        .from("games")
        .select(CARD_COLUMNS, { count: "exact" })
        .eq("is_published", true);

      if (search.trim()) query = query.ilike("title", `%${search.trim()}%`);
      if (genre) query = query.contains("genres", [genre]);
      if (status && status !== "all") query = query.eq("status", status);

      switch (sort) {
        case "rating":
          query = query.order("rating", { ascending: false, nullsFirst: false });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        case "release":
          query = query.order("release_year", { ascending: false, nullsFirst: false });
          break;
        case "playtime":
          query = query.order("playtime_hours", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("published_at", { ascending: false, nullsFirst: false });
      }

      const from = (page - 1) * perPage;
      const { data, count } = await query.range(from, from + perPage - 1);

      const { data: genreRows } = await supabase
        .from("games")
        .select("genres")
        .eq("is_published", true);

      const genres = Array.from(
        new Set(((genreRows ?? []) as { genres: string[] }[]).flatMap((row) => row.genres ?? [])),
      ).sort((a, b) => a.localeCompare(b));

      const total = count ?? 0;

      return {
        items: (data ?? []) as GameCardData[],
        total,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        genres,
      };
    },
    { items: [], total: 0, page: 1, perPage, totalPages: 1, genres: [] },
  );
}

export interface GameDetail extends Game {
  chapters: GameChapter[];
  characters: GameCharacter[];
  moments: GameMoment[];
  reviews: GameReview[];
  related: Pick<Game, "id" | "slug" | "title" | "cover_url" | "rating" | "release_year" | "status">[];
}

export async function getGameBySlug(slug: string): Promise<GameDetail | null> {
  return safeQuery<GameDetail | null>(
    "games.detail",
    async () => {
      const supabase = createPublicClient();

      const { data: game, error } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!game) return null;

      const typed = game as Game;

      const [chapters, characters, moments, reviews, relatedRows] = await Promise.all([
        supabase
          .from("game_chapters")
          .select("*")
          .eq("game_id", typed.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("game_characters")
          .select("*")
          .eq("game_id", typed.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("game_memorable_moments")
          .select("*")
          .eq("game_id", typed.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("game_reviews")
          .select("*")
          .eq("game_id", typed.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("game_related")
          .select("related_game_id,sort_order")
          .eq("game_id", typed.id)
          .order("sort_order", { ascending: true }),
      ]);

      const relatedIds = (relatedRows.data ?? []).map((row) => row.related_game_id as string);
      let related: GameDetail["related"] = [];

      if (relatedIds.length) {
        const { data: relatedGames } = await supabase
          .from("games")
          .select("id,slug,title,cover_url,rating,release_year,status")
          .in("id", relatedIds)
          .eq("is_published", true);
        const map = new Map((relatedGames ?? []).map((row) => [row.id as string, row]));
        related = relatedIds
          .map((id) => map.get(id))
          .filter(Boolean) as GameDetail["related"];
      }

      return {
        ...typed,
        chapters: (chapters.data ?? []) as GameChapter[],
        characters: (characters.data ?? []) as GameCharacter[],
        moments: (moments.data ?? []) as GameMoment[],
        reviews: (reviews.data ?? []) as GameReview[],
        related,
      };
    },
    null,
  );
}

export async function getGamesBySlugs(slugs: string[]): Promise<GameCardData[]> {
  if (!slugs.length) return [];
  return safeQuery<GameCardData[]>(
    "games.bySlugs",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("games")
        .select(CARD_COLUMNS)
        .in("slug", slugs)
        .eq("is_published", true);
      const map = new Map(((data ?? []) as GameCardData[]).map((g) => [g.slug, g]));
      return slugs.map((slug) => map.get(slug)).filter(Boolean) as GameCardData[];
    },
    [],
  );
}

export async function getFeaturedGames(limit = 3): Promise<GameCardData[]> {
  return safeQuery<GameCardData[]>(
    "games.featured",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("games")
        .select(CARD_COLUMNS)
        .eq("is_published", true)
        .eq("featured", true)
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(limit);
      return (data ?? []) as GameCardData[];
    },
    [],
  );
}

export async function getRecentCompletions(limit = 4): Promise<GameCardData[]> {
  return safeQuery<GameCardData[]>(
    "games.recentCompletions",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("games")
        .select(CARD_COLUMNS)
        .eq("is_published", true)
        .eq("status", "completed")
        .order("completed_on", { ascending: false, nullsFirst: false })
        .limit(limit);
      return (data ?? []) as GameCardData[];
    },
    [],
  );
}

export async function getNowPlaying(limit = 3): Promise<GameCardData[]> {
  return safeQuery<GameCardData[]>(
    "games.nowPlaying",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("games")
        .select(CARD_COLUMNS)
        .eq("is_published", true)
        .eq("status", "playing")
        .order("started_on", { ascending: false, nullsFirst: false })
        .limit(limit);
      return (data ?? []) as GameCardData[];
    },
    [],
  );
}

export async function getHeroGame(): Promise<GameDetail | null> {
  const supabase = () => createPublicClient();

  return safeQuery<GameDetail | null>(
    "games.hero",
    async () => {
      const client = supabase();
      const { data: slot } = await client
        .from("featured_content")
        .select("game_id,headline,subline")
        .eq("slot", "hero")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      const slugQuery = slot?.game_id
        ? client.from("games").select("slug").eq("id", slot.game_id).maybeSingle()
        : null;
      const fallbackQuery = client
        .from("games")
        .select("slug")
        .eq("is_published", true)
        .eq("featured", true)
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      const resolved = slugQuery ? await slugQuery : await fallbackQuery;
      const slug = (resolved?.data as { slug?: string } | null)?.slug;
      if (!slug) return null;

      const detail = await getGameBySlug(slug);
      return detail;
    },
    null,
  );
}

export async function getRankedGames(): Promise<RankingWithGame[]> {
  return safeQuery<RankingWithGame[]>(
    "games.ranked",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("rankings")
        .select("*, games(slug,title,cover_url,rating,release_year,status)")
        .order("position", { ascending: true });
      return unwrap<RankingWithGame[]>({ data: (data ?? []) as RankingWithGame[], error: null }, "rankings");
    },
    [],
  );
}

export async function getGameOptions() {
  return safeQuery<{ id: string; title: string; slug: string }[]>(
    "games.options",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase.from("games").select("id,title,slug").order("title");
      return (data ?? []) as { id: string; title: string; slug: string }[];
    },
    [],
  );
}
