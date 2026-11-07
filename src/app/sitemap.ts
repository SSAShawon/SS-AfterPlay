import type { MetadataRoute } from "next";

import { createPublicClient } from "@/lib/supabase/public";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, priority: 1, changeFrequency: "weekly" },
  { url: `${siteUrl}/collection`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${siteUrl}/journal`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${siteUrl}/memories`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${siteUrl}/rankings`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${siteUrl}/timeline`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${siteUrl}/about`, priority: 0.5, changeFrequency: "yearly" },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createPublicClient();

    const [games, posts] = await Promise.all([
      supabase
        .from("games")
        .select("slug,updated_at")
        .eq("is_published", true),
      supabase
        .from("journal_posts")
        .select("slug,updated_at")
        .eq("status", "published"),
    ]);

    const gameRoutes: MetadataRoute.Sitemap = ((games.data ?? []) as {
      slug: string;
      updated_at: string;
    }[]).map((game) => ({
      url: `${siteUrl}/games/${game.slug}`,
      lastModified: game.updated_at ? new Date(game.updated_at) : undefined,
      priority: 0.8,
      changeFrequency: "monthly",
    }));

    const postRoutes: MetadataRoute.Sitemap = ((posts.data ?? []) as {
      slug: string;
      updated_at: string;
    }[]).map((post) => ({
      url: `${siteUrl}/journal/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
      priority: 0.6,
      changeFrequency: "monthly",
    }));

    return [...STATIC_ROUTES, ...gameRoutes, ...postRoutes];
  } catch {
    return STATIC_ROUTES;
  }
}
