import { AdminHeader } from "@/components/admin/admin-header";
import { TimelineManager } from "@/components/admin/timeline-manager";
import { listAdminGames, listAdminTimeline } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const [events, games] = await Promise.all([listAdminTimeline(), listAdminGames()]);

  return (
    <>
      <AdminHeader
        kicker="Content"
        title="Timeline"
        description="Games started, games completed, milestones and journal events — the chronological spine of the archive."
      />
      <TimelineManager
        events={events}
        games={games.rows.map((game) => ({ id: game.id, title: game.title }))}
      />
    </>
  );
}
