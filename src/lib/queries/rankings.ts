import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { RankingCategory, RankingWithGame } from "@/lib/types";

export interface RankedCategory extends RankingCategory {
  entries: RankingWithGame[];
}

export async function getRankings(): Promise<RankedCategory[]> {
  return safeQuery<RankedCategory[]>(
    "rankings.list",
    async () => {
      const supabase = createPublicClient();

      const [{ data: categories }, { data: entries }] = await Promise.all([
        supabase.from("ranking_categories").select("*").order("sort_order", { ascending: true }),
        supabase
          .from("rankings")
          .select("*, games(slug,title,cover_url,rating,release_year,status)")
          .order("position", { ascending: true }),
      ]);

      const grouped = new Map<string, RankingWithGame[]>();
      for (const entry of (entries ?? []) as unknown as RankingWithGame[]) {
        const list = grouped.get(entry.category_id) ?? [];
        list.push(entry);
        grouped.set(entry.category_id, list);
      }

      return ((categories ?? []) as RankingCategory[]).map((category) => ({
        ...category,
        entries: (grouped.get(category.id) ?? [])
          .filter((entry) => entry.games)
          .sort((a, b) => a.position - b.position),
      }));
    },
    [],
  );
}

export async function getRankingCategories(): Promise<RankingCategory[]> {
  return safeQuery<RankingCategory[]>(
    "rankings.categories",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("ranking_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      return (data ?? []) as RankingCategory[];
    },
    [],
  );
}
