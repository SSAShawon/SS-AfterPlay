import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { SearchResultGroup } from "@/lib/types";

const EMPTY: SearchResultGroup = {
  games: [],
  posts: [],
  characters: [],
  memories: [],
  chapters: [],
};

export async function searchArchive(term: string): Promise<SearchResultGroup> {
  const query = term.trim();
  if (query.length < 2) return EMPTY;

  const like = `%${query}%`;

  return safeQuery<SearchResultGroup>(
    "search",
    async () => {
      const supabase = createPublicClient();

      const [games, posts, characters, memories, chapters] = await Promise.all([
        supabase
          .from("games")
          .select("id,slug,title,cover_url,release_year,status")
          .eq("is_published", true)
          .or(`title.ilike.${like},summary.ilike.${like},storyline.ilike.${like}`)
          .limit(6),
        supabase
          .from("journal_posts")
          .select("id,slug,title,excerpt,cover_url")
          .eq("status", "published")
          .or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`)
          .limit(6),
        supabase
          .from("game_characters")
          .select("id,name,role,portrait_url,games!inner(slug,title,is_published)")
          .ilike("name", like)
          .eq("games.is_published", true)
          .limit(6),
        supabase
          .from("memories")
          .select("id,title,description,occurred_on")
          .eq("is_published", true)
          .or(`title.ilike.${like},description.ilike.${like}`)
          .limit(6),
        supabase
          .from("game_chapters")
          .select("id,title,games!inner(slug,title,is_published)")
          .ilike("title", like)
          .eq("games.is_published", true)
          .limit(6),
      ]);

      type CharacterRow = {
        id: string;
        name: string;
        role: string | null;
        portrait_url: string | null;
        games: { slug: string; title: string } | null;
      };
      type ChapterRow = {
        id: string;
        title: string;
        games: { slug: string; title: string } | null;
      };

      return {
        games: games.data ?? [],
        posts: posts.data ?? [],
        characters: ((characters.data ?? []) as unknown as CharacterRow[])
          .filter((row) => row.games)
          .map((row) => ({
            id: row.id,
            name: row.name,
            role: row.role,
            portrait_url: row.portrait_url,
            game_slug: row.games!.slug,
            game_title: row.games!.title,
          })),
        memories: memories.data ?? [],
        chapters: ((chapters.data ?? []) as unknown as ChapterRow[])
          .filter((row) => row.games)
          .map((row) => ({
            id: row.id,
            title: row.title,
            game_slug: row.games!.slug,
            game_title: row.games!.title,
          })),
      };
    },
    EMPTY,
  );
}
