import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { EmptyState, PageHeader, Rating } from "@/components/public/primitives";
import { getRankings } from "@/lib/queries/rankings";
import { cn, pad } from "@/lib/utils";

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
        <section className="shell py-16">
          <EmptyState
            title="No rankings published yet."
            description="Create a ranking category in the admin panel, then add games to it."
          />
        </section>
      ) : (
        <>
          <nav className="sticky top-[68px] z-40 border-b border-white/10 bg-void/92 backdrop-blur-xl md:top-[78px]">
            <div className="shell scrollbar-none flex items-center gap-1 overflow-x-auto py-2">
              {populated.map((category, index) => (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  className="shrink-0 border-b border-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50 transition-colors hover:border-blood hover:text-soft"
                >
                  <span className="mr-1.5 text-blood/50">{pad(index + 1)}</span>
                  {category.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="shell py-14 md:py-20">
            <div className="space-y-20 md:space-y-28">
              {populated.map((category, categoryIndex) => (
                <section key={category.id} id={category.slug} className="scroll-mt-32">
                  <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-blood/80">
                          {pad(categoryIndex + 1)}
                        </span>
                        <span className="h-px w-8 bg-white/20" />
                        <span className="eyebrow">Ranking</span>
                      </div>
                      <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-soft">
                        {category.title}
                      </h2>
                      {category.description && (
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver/70">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/40">
                      {category.entries.length} entries
                    </span>
                  </div>

                  <ol className="mt-6">
                    {category.entries.map((entry, index) => (
                      <li key={entry.id}>
                        <Link
                          href={`/games/${entry.games?.slug}`}
                          className={cn(
                            "group grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 border-b border-white/[0.07] py-5 transition-colors hover:border-blood/40 md:gap-8",
                          )}
                        >
                          <span
                            className={cn(
                              "font-serif text-3xl leading-none md:text-5xl",
                              index === 0
                                ? "text-blood"
                                : index < 3
                                  ? "text-soft/60"
                                  : "text-white/20",
                            )}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <ArchiveImage
                            src={entry.games?.cover_url}
                            alt={entry.games?.title ?? ""}
                            fallbackLabel={entry.games?.title ?? ""}
                            className="aspect-[3/4] w-12 shrink-0 border border-white/10 md:w-14"
                          />

                          <div className="min-w-0">
                            <h3 className="truncate font-serif text-xl text-soft transition-colors group-hover:text-white md:text-2xl">
                              {entry.games?.title}
                            </h3>
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
                              {[entry.games?.release_year, entry.games?.status].filter(Boolean).join(" · ")}
                            </p>
                            {entry.note && (
                              <p className="mt-2 max-w-xl text-xs leading-relaxed text-silver/60">
                                “{entry.note}”
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <Rating value={entry.games?.rating ?? null} />
                            <ArrowUpRight className="hidden size-4 text-silver/25 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-soft md:block" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
