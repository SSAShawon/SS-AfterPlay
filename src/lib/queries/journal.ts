import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { JournalCategory, JournalPost, JournalPostWithCategory } from "@/lib/types";

const POST_COLUMNS =
  "id,slug,title,excerpt,cover_url,category_id,reading_minutes,status,featured,published_at,created_at,updated_at";

export interface JournalListResult {
  items: JournalPostWithCategory[];
  total: number;
  page: number;
  totalPages: number;
  categories: JournalCategory[];
}

export async function getJournalPosts(
  options: { search?: string; category?: string; page?: number; perPage?: number; featuredFirst?: boolean } = {},
): Promise<JournalListResult> {
  const { search = "", category = "", page = 1, perPage = 9, featuredFirst = false } = options;

  return safeQuery<JournalListResult>(
    "journal.list",
    async () => {
      const supabase = createPublicClient();

      let query = supabase
        .from("journal_posts")
        .select(`${POST_COLUMNS}, journal_categories(name,slug)`, { count: "exact" })
        .eq("status", "published");

      if (search.trim()) query = query.ilike("title", `%${search.trim()}%`);
      if (category) {
        const { data: cat } = await supabase
          .from("journal_categories")
          .select("id")
          .eq("slug", category)
          .maybeSingle();
        if (cat?.id) query = query.eq("category_id", cat.id);
      }

      if (featuredFirst) query = query.order("featured", { ascending: false });
      query = query.order("published_at", { ascending: false, nullsFirst: false });

      const from = (page - 1) * perPage;
      const { data, count } = await query.range(from, from + perPage - 1);

      const { data: categories } = await supabase
        .from("journal_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      const total = count ?? 0;

      return {
        items: (data ?? []) as unknown as JournalPostWithCategory[],
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        categories: (categories ?? []) as JournalCategory[],
      };
    },
    { items: [], total: 0, page: 1, totalPages: 1, categories: [] },
  );
}

export async function getJournalCategories(): Promise<JournalCategory[]> {
  return safeQuery<JournalCategory[]>(
    "journal.categories",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("journal_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      return (data ?? []) as JournalCategory[];
    },
    [],
  );
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPostWithCategory | null> {
  return safeQuery<JournalPostWithCategory | null>(
    "journal.detail",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("journal_posts")
        .select("*, journal_categories(name,slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      return (data as unknown as JournalPostWithCategory) ?? null;
    },
    null,
  );
}

export async function getLatestJournalPosts(limit = 3): Promise<JournalPostWithCategory[]> {
  return safeQuery<JournalPostWithCategory[]>(
    "journal.latest",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("journal_posts")
        .select(`${POST_COLUMNS}, journal_categories(name,slug)`)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(limit);
      return (data ?? []) as unknown as JournalPostWithCategory[];
    },
    [],
  );
}

export async function getFeaturedJournalPost(): Promise<JournalPostWithCategory | null> {
  return safeQuery<JournalPostWithCategory | null>(
    "journal.featured",
    async () => {
      const supabase = createPublicClient();

      const { data: slot } = await supabase
        .from("featured_content")
        .select("journal_post_id")
        .eq("slot", "featured_journal")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      let query = supabase
        .from("journal_posts")
        .select("*, journal_categories(name,slug)")
        .eq("status", "published");

      if (slot?.journal_post_id) query = query.eq("id", slot.journal_post_id);
      else query = query.eq("featured", true);

      const { data } = await query
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      return (data as unknown as JournalPostWithCategory) ?? null;
    },
    null,
  );
}

export async function getJournalPostsForSelect(): Promise<Pick<JournalPost, "id" | "title" | "slug" | "status">[]> {
  return safeQuery<Pick<JournalPost, "id" | "title" | "slug" | "status">[]>(
    "journal.select",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("journal_posts")
        .select("id,title,slug,status")
        .order("title");
      return (data ?? []) as Pick<JournalPost, "id" | "title" | "slug" | "status">[];
    },
    [],
  );
}
