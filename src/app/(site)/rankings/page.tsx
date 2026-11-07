import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { EmptyState, PageHeader, Rating } from "@/components/public/primitives";
import { getRankings } from "@/lib/queries/rankings";
import { pad } from "@/lib/utils";
import { GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Personal gaming rankings: all-time favourites, best story, best characters, best gameplay, best soundtracks and more — ordered by hand, defended in writing.",
  openGraph: {
    title: "Rankings — SS AFTERPLAY",
    description: "All-time favourites, best story, best characters, best gameplay, best soundtracks.",
  },
};

export default async function RankingsPage() {
  const categories = await getRankings();
  const populated = categories.filter((category) => category.entries.length > 0);

  return (
    <>
      <PageHeader
        kicker="Rankings"
        title="Ordered by hand. Defended in person."
        intro="No aggregate scores and no algorithm. These are the lists I keep rewriting — favourites, stories, characters, gameplay and soundtracks, ranked because the argument is the fun part."
        meta={[
          { label: "Categories", value: String(populated.length) },
          {
            label: "Entries ranked",
            value: String(populated.reduce((total, category) => total + category.entries.length, 0)),
          },
        ]}
      />

      {populated.length === 0 ? (
        <section className="shell py-14">
          <EmptyState
            title="No rankings published yet."
            description="Create a ranking category in the admin panel, then add games to it."
          />
        </section>
      ) : (
        <>
          <nav className="sticky top-[62px] z-40 border-b border-line bg-void md:top-[72px]">
            <div className="shell scrollbar-none flex items-center gap-6 overflow-x-auto py-3">
              {populated.map((category, index) => (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  className="flex shrink-0 items-baseline gap-2 border-b border-transparent py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:border-blood hover:text-soft"
                >
                  <span className="tabular-nums text-blood/60">{pad(index + 1)}</span>
                  {category.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="shell py-10 md:py-14">
            {populated.map((category, categoryIndex) => (
              <section
                key={category.id}
                id={category.slug}
                className="scroll-mt-32 border-t border-line py-12 first:border-t-0 first:pt-0 md:py-16"
              >
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-32">
                      <div className="flex items-baseline gap-3">
                        <span className="text-[11px] tabular-nums tracking-[0.1em] text-blood">
                          {pad(categoryIndex + 1)}
                        </span>
                        <span className="kicker">Ranking</span>
                      </div>

                      <h2 className="display mt-4 text-[clamp(2rem,3.6vw,2.9rem)] text-soft">
                        {category.title}
                      </h2>

                      {category.description && (
                        <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-silver">
                          {category.description}
                        </p>
                      )}

                      <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-muted">
                        {category.entries.length} {category.entries.length === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-8">
                    <ol className="border-t border-line">
                      {category.entries.map((entry, index) => {
                        const game = entry.games;
                        return (
                          <li key={entry.id} className="border-b border-line">
                            <Link
                              href={game ? `/games/${game.slug}` : "/collection"}
                              className="group grid grid-cols-[2rem_1fr_auto] items-center gap-4 py-4 md:grid-cols-[2.5rem_3rem_1fr_auto_auto] md:gap-5"
                            >
                              <span className="font-serif text-[1.5rem] leading-none text-muted/70 transition-colors group-hover:text-blood">
                                {String(index + 1).padStart(2, "0")}
                              </span>

                              <ArchiveImage
                                src={game?.cover_url ?? null}
                                alt={game?.title ?? "Game"}
                                fallbackLabel={game?.title ?? "SS"}
                                sizes="48px"
                                className="hidden aspect-[3/4] w-12 border border-line md:block"
                              />

                              <div className="min-w-0">
                                <h3 className="truncate font-serif text-[1.25rem] leading-tight text-soft transition-colors group-hover:text-white md:text-[1.45rem]">
                                  {game?.title ?? "Unknown game"}
                                </h3>
                                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[9.5px] uppercase tracking-[0.14em] text-muted">
                                  {game?.release_year && <span>{game.release_year}</span>}
                                  {game?.status && (
                                    <>
                                      <span aria-hidden>/</span>
                                      <span>{GAME_STATUS_LABELS[game.status]}</span>
                                    </>
                                  )}
                                  {entry.note && (
                                    <>
                                      <span aria-hidden>/</span>
                                      <span className="font-serif text-[11.5px] italic normal-case tracking-normal text-silver">
                                        “{entry.note}”
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-4">
                                <Rating value={game?.rating ?? null} />
                                <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="border-t border-line py-12">
            <div className="shell flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Ranked by hand, not by algorithm
              </p>
              <Link href="/collection" className="link-quiet">
                The full collection
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
