import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BookOpen, Gamepad2, Sparkles } from "lucide-react";

import { AdminHeader, AdminLinkButton } from "@/components/admin/admin-header";
import { getAdminRecentActivity, getAdminStats } from "@/lib/queries/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const KIND_STYLES = {
  game: { label: "Game", className: "border-line-strong text-silver/60", icon: Gamepad2 },
  journal: { label: "Journal", className: "border-[#8f7fd0]/35 text-[#b0a4e2]", icon: BookOpen },
  memory: { label: "Memory", className: "border-blood/35 text-[#e28b8b]", icon: Sparkles },
} as const;

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getAdminStats(), getAdminRecentActivity()]);

  const cards = [
    { label: "Total games", value: stats.totalGames, sub: `${stats.publishedGames} published` },
    { label: "Completed", value: stats.completedGames, sub: `${stats.playingGames} in progress` },
    { label: "Journal entries", value: stats.totalPosts, sub: `${stats.draftPosts} drafts` },
    { label: "Memories", value: stats.totalMemories, sub: `${stats.publishedMemories} published` },
    { label: "Draft content", value: stats.draftGames + stats.draftPosts, sub: "not on the public site" },
    { label: "Timeline events", value: stats.totalTimeline, sub: `${stats.publishedTimeline} published` },
  ];

  return (
    <>
      <AdminHeader
        kicker="Control room"
        title="Everything in one place"
        description="Every published entry here appears on the public archive immediately. Drafts stay invisible until you publish them."
        actions={
          <>
            <AdminLinkButton href="/" >View site</AdminLinkButton>
            <AdminLinkButton href="/admin/games/new" variant="primary">
              New game
            </AdminLinkButton>
          </>
        }
      />

      {stats.error && (
        <div className="mb-6 flex items-start gap-3 border border-[#c99a4b]/40 bg-[#c99a4b]/[0.06] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#dcb069]" />
          <div>
            <p className="text-[12px] text-[#dcb069]">Database connection issue</p>
            <p className="mt-1 text-[11px] leading-relaxed text-silver/60">{stats.error}</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-charcoal p-4 md:p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/45">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-4xl leading-none text-soft">{card.value}</p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/35">
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="border border-line bg-charcoal lg:col-span-2">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-serif text-lg text-soft">Recent updates</h2>
            <Link
              href="/admin/games"
              className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50 hover:text-soft"
            >
              All content
            </Link>
          </header>

          <ul className="divide-y divide-white/[0.06]">
            {activity.length === 0 && (
              <li className="px-5 py-8 text-[12px] text-silver/50">
                Nothing has been edited yet. Create your first entry.
              </li>
            )}
            {activity.map((item) => {
              const style = KIND_STYLES[item.kind];
              const Icon = style.icon;
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-charcoal"
                  >
                    <Icon className="size-3.5 text-silver/40" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-soft">{item.title}</span>
                    <span
                      className={`hidden border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] sm:inline-flex ${style.className}`}
                    >
                      {item.meta}
                    </span>
                    <span className="w-24 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-silver/35">
                      {formatDate(item.updated_at, "short")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="border border-line bg-charcoal p-5">
            <h2 className="font-serif text-lg text-soft">Quick actions</h2>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/admin/games/new", label: "Add a game" },
                { href: "/admin/journal/new", label: "Write a journal entry" },
                { href: "/admin/memories", label: "Add a memory" },
                { href: "/admin/rankings", label: "Reorder rankings" },
                { href: "/admin/timeline", label: "Add a timeline event" },
                { href: "/admin/homepage", label: "Curate the homepage" },
                { href: "/admin/settings", label: "Site settings & password" },
              ].map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="group flex items-center justify-between border-b border-line py-2 text-[12px] text-silver/65 transition-colors hover:text-soft"
                  >
                    {action.label}
                    <ArrowUpRight className="size-3 text-silver/25 transition-colors group-hover:text-blood" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-line bg-charcoal p-5">
            <h2 className="font-serif text-lg text-soft">Publishing rules</h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-silver/50">
              <li>· Drafts never appear on the public site.</li>
              <li>· Featured games drive the homepage featured file.</li>
              <li>· Unpublishing removes content immediately.</li>
              <li>· Every save revalidates public routes.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
