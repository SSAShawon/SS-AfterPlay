import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";

export interface ArchiveStats {
  totalGames: number;
  completed: number;
  playing: number;
  onHold: number;
  backlog: number;
  dropped: number;
  totalPosts: number;
  totalMemories: number;
  totalChapters: number;
  totalCharacters: number;
  totalHours: number;
  averageRating: number | null;
  yearsActive: number;
  topGenres: { genre: string; count: number }[];
}

const EMPTY_STATS: ArchiveStats = {
  totalGames: 0,
  completed: 0,
  playing: 0,
  onHold: 0,
  backlog: 0,
  dropped: 0,
  totalPosts: 0,
  totalMemories: 0,
  totalChapters: 0,
  totalCharacters: 0,
  totalHours: 0,
  averageRating: null,
  yearsActive: 0,
  topGenres: [],
};

export async function getArchiveStats(): Promise<ArchiveStats> {
  return safeQuery<ArchiveStats>(
    "stats",
    async () => {
      const supabase = createPublicClient();

      const [games, posts, memories, chapters, characters] = await Promise.all([
        supabase
          .from("games")
          .select("status,rating,playtime_hours,genres,started_on,completed_on")
          .eq("is_published", true),
        supabase.from("journal_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("memories").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("game_chapters").select("id", { count: "exact", head: true }),
        supabase.from("game_characters").select("id", { count: "exact", head: true }),
      ]);

      const rows = (games.data ?? []) as {
        status: string;
        rating: number | null;
        playtime_hours: number | null;
        genres: string[];
        started_on: string | null;
        completed_on: string | null;
      }[];

      const countStatus = (status: string) => rows.filter((row) => row.status === status).length;
      const rated = rows.filter((row) => typeof row.rating === "number");
      const hours = rows.reduce((total, row) => total + Number(row.playtime_hours ?? 0), 0);

      const genreCounts = new Map<string, number>();
      for (const row of rows) {
        for (const genre of row.genres ?? []) {
          genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
        }
      }

      const dates = rows
        .flatMap((row) => [row.started_on, row.completed_on])
        .filter((value): value is string => Boolean(value))
        .map((value) => Number(value.slice(0, 4)))
        .filter((year) => Number.isFinite(year));

      const yearsActive = dates.length
        ? Math.max(...dates) - Math.min(...dates) + 1
        : 0;

      return {
        totalGames: rows.length,
        completed: countStatus("completed"),
        playing: countStatus("playing"),
        onHold: countStatus("on_hold"),
        backlog: countStatus("backlog"),
        dropped: countStatus("dropped"),
        totalPosts: posts.count ?? 0,
        totalMemories: memories.count ?? 0,
        totalChapters: chapters.count ?? 0,
        totalCharacters: characters.count ?? 0,
        totalHours: Math.round(hours),
        averageRating: rated.length
          ? Math.round((rated.reduce((total, row) => total + Number(row.rating), 0) / rated.length) * 10) / 10
          : null,
        yearsActive,
        topGenres: Array.from(genreCounts.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      };
    },
    EMPTY_STATS,
  );
}
