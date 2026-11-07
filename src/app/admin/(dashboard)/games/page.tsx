import Link from "next/link";
import { Pencil, Search } from "lucide-react";

import { AdminHeader, AdminLinkButton } from "@/components/admin/admin-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FlagToggle } from "@/components/admin/toggle-form";
import { deleteGameAction, toggleGameFlagAction } from "@/lib/actions/games";
import { listAdminGames } from "@/lib/queries/admin";
import { cn, formatDate, formatRating } from "@/lib/utils";
import { GAME_STATUSES, GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; state?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { rows, error } = await listAdminGames({
    search: params.q,
    status: params.status,
    state: params.state,
  });

  const filters = [
    { value: "all", label: "All", href: "/admin/games" },
    { value: "published", label: "Published", href: "/admin/games?state=published" },
    { value: "draft", label: "Drafts", href: "/admin/games?state=draft" },
  ];

  return (
    <>
      <AdminHeader
        kicker="Content"
        title="Games"
        description="Every archive entry, published or drafted. Chapters, characters, moments, craft reviews and verdicts are managed inside each game."
        actions={<AdminLinkButton href="/admin/games/new" variant="primary">New game</AdminLinkButton>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/games" className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search games…"
            className="h-10 w-full border border-white/12 bg-white/[0.02] pl-9 pr-3 text-sm text-soft placeholder:text-silver/40 focus:border-blood/60 focus:outline-none"
          />
          {params.state && <input type="hidden" name="state" value={params.state} />}
        </form>

        <div className="flex items-center gap-1">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.href}
              className={cn(
                "border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors",
                (params.state ?? "all") === filter.value
                  ? "border-white/25 bg-soft/[0.06] text-soft"
                  : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 border border-blood/40 bg-blood/[0.06] px-3 py-2 text-[12px] text-[#e58383]">
          {error}
        </p>
      )}

      <div className="border border-white/10 bg-[#0b0c10]">
        <div className="hidden grid-cols-[1fr_120px_110px_90px_140px_150px] gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/40 md:grid">
          <span>Title</span>
          <span>Status</span>
          <span>Rating</span>
          <span>State</span>
          <span>Updated</span>
          <span className="text-right">Actions</span>
        </div>

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-[13px] text-silver/60">No games found.</p>
            <Link
              href="/admin/games/new"
              className="mt-3 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-blood hover:text-blood/80"
            >
              Create the first entry
            </Link>
          </div>
        )}

        <ul className="divide-y divide-white/[0.06]">
          {rows.map((game) => (
            <li
              key={game.id}
              className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_120px_110px_90px_140px_150px] md:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/games/${game.id}`}
                  className="truncate text-[13px] text-soft transition-colors hover:text-white"
                >
                  {game.title}
                </Link>
                <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                  /{game.slug} {game.release_year ? `· ${game.release_year}` : ""}
                </p>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/60">
                {GAME_STATUS_LABELS[game.status]}
              </span>

              <span className="font-mono text-[11px] text-silver/70">
                {game.rating === null ? "—" : `${formatRating(game.rating)}/10`}
              </span>

              <div className="flex flex-wrap gap-1">
                <FlagToggle
                  action={toggleGameFlagAction}
                  id={game.id}
                  field="is_published"
                  value={game.is_published}
                  labelOn="Published"
                  labelOff="Draft"
                />
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-silver/35">
                {formatDate(game.updated_at, "short")}
              </span>

              <div className="flex items-center gap-1 md:justify-end">
                <FlagToggle
                  action={toggleGameFlagAction}
                  id={game.id}
                  field="featured"
                  value={game.featured}
                  labelOn="★ Featured"
                  labelOff="☆ Feature"
                />
                <Link
                  href={`/admin/games/${game.id}`}
                  aria-label="Edit game"
                  className="flex size-8 items-center justify-center border border-white/12 text-silver/60 transition-colors hover:border-white/25 hover:text-soft"
                >
                  <Pencil className="size-3.5" />
                </Link>
                <ConfirmDelete
                  action={deleteGameAction}
                  id={game.id}
                  variant="icon"
                  title={`Delete “${game.title}”?`}
                  description="The game, its chapters, characters, moments, reviews and ranking entries will be removed permanently."
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/30">
        {rows.length} entries · {GAME_STATUSES.length} possible statuses
      </p>
    </>
  );
}
