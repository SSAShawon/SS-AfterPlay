import { AdminHeader } from "@/components/admin/admin-header";
import { MemoryManager } from "@/components/admin/memory-manager";
import { getAdminMemoryOptions, listAdminMemories } from "@/lib/queries/admin";
import { listAdminGames } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminMemoriesPage() {
  const [memories, games] = await Promise.all([listAdminMemories(), listAdminGames()]);

  await getAdminMemoryOptions();

  return (
    <>
      <AdminHeader
        kicker="Content"
        title="Memories"
        description="The curated moments collection. Featured entries lead the homepage and the memories page."
      />
      <MemoryManager
        memories={memories}
        games={games.rows.map((game) => ({ id: game.id, title: game.title }))}
      />
    </>
  );
}
