import { AdminHeader } from "@/components/admin/admin-header";
import { RankingManager } from "@/components/admin/ranking-manager";
import { getAdminRankings } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminRankingsPage() {
  const { categories, entries, games } = await getAdminRankings();

  return (
    <>
      <AdminHeader
        kicker="Content"
        title="Rankings"
        description="Custom categories, ordered by hand. Use the arrows to move a game up or down within its category."
      />
      <RankingManager categories={categories} entries={entries} games={games} />
    </>
  );
}
