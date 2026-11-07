import { AdminHeader } from "@/components/admin/admin-header";
import { HomepageManager } from "@/components/admin/homepage-manager";
import { getAdminFeatured, getAdminMemoryOptions } from "@/lib/queries/admin";
import { getAdminGames } from "@/lib/queries/admin-homepage";
import { getAdminJournalList } from "@/lib/queries/admin-homepage";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [featured, games, posts, memories] = await Promise.all([
    getAdminFeatured(),
    getAdminGames(),
    getAdminJournalList(),
    getAdminMemoryOptions(),
  ]);

  return (
    <>
      <AdminHeader
        kicker="Curation"
        title="Homepage"
        description="Pick the hero game, the featured essay and the featured memory. Everything else on the homepage updates itself from published content."
      />
      <HomepageManager
        featured={featured}
        games={games.map((game) => ({ id: game.id, title: `${game.title}${game.is_published ? "" : " (draft)"}` }))}
        posts={posts.map((post) => ({ id: post.id, title: `${post.title}${post.status === "published" ? "" : " (draft)"}` }))}
        memories={memories}
      />
    </>
  );
}
