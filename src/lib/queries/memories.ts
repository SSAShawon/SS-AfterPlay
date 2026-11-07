import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { Memory, MemoryWithGame } from "@/lib/types";

const MEMORY_COLUMNS = "*, games(slug,title,cover_url)";

export async function getMemories(options: { featuredOnly?: boolean; limit?: number } = {}): Promise<MemoryWithGame[]> {
  const { featuredOnly = false, limit } = options;

  return safeQuery<MemoryWithGame[]>(
    "memories.list",
    async () => {
      const supabase = createPublicClient();
      let query = supabase
        .from("memories")
        .select(MEMORY_COLUMNS)
        .eq("is_published", true)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true });

      if (featuredOnly) query = query.eq("featured", true);
      if (limit) query = query.limit(limit);

      const { data } = await query;
      return (data ?? []) as unknown as MemoryWithGame[];
    },
    [],
  );
}

export async function getFeaturedMemory(): Promise<MemoryWithGame | null> {
  return safeQuery<MemoryWithGame | null>(
    "memories.featured",
    async () => {
      const supabase = createPublicClient();
      const { data: slot } = await supabase
        .from("featured_content")
        .select("memory_id")
        .eq("slot", "featured_memory")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (slot?.memory_id) {
        const { data } = await supabase
          .from("memories")
          .select(MEMORY_COLUMNS)
          .eq("id", slot.memory_id)
          .eq("is_published", true)
          .maybeSingle();
        if (data) return data as unknown as MemoryWithGame;
      }

      const { data } = await supabase
        .from("memories")
        .select(MEMORY_COLUMNS)
        .eq("is_published", true)
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      return (data as unknown as MemoryWithGame) ?? null;
    },
    null,
  );
}

export type MemoryOption = Pick<Memory, "id" | "title">;

export async function getMemoryOptions(): Promise<MemoryOption[]> {
  return safeQuery<MemoryOption[]>(
    "memories.options",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("memories")
        .select("id,title")
        .eq("is_published", true)
        .order("title");
      return (data ?? []) as MemoryOption[];
    },
    [],
  );
}
