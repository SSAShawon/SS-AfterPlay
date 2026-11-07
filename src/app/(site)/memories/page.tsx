import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { EmptyState, MetaRow, PageHeader } from "@/components/public/primitives";
import { getFeaturedMemory, getMemories } from "@/lib/queries/memories";
import { formatDate, pad } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Memories",
  description:
    "A curated collection of gaming moments worth keeping — the scenes, rides and quiet rooms that stayed long after the credits.",
  openGraph: {
    title: "Memories — SS AFTERPLAY",
    description: "The scenes, rides and quiet rooms that stayed after the credits.",
  },
};

export default async function MemoriesPage() {
  const [memories, featured] = await Promise.all([getMemories(), getFeaturedMemory()]);
  const rest = featured ? memories.filter((memory) => memory.id !== featured.id) : memories;

  const years = memories
    .map((memory) => memory.occurred_on?.slice(0, 4))
    .filter((year): year is string => Boolean(year))
    .sort();

  return (
    <>
      <PageHeader
        kicker="Memories"
        title="The moments that outlived their games."
        intro="Not the best levels, not the highest scores — the moments that landed and refused to leave. Some are enormous. Most are quiet."
        meta={[
          { label: "Memories kept", value: String(memories.length) },
          {
            label: "Span",
            value: years.length ? `${years[0]} — ${years[years.length - 1]}` : "—",
          },
        ]}
      />

      {memories.length === 0 ? (
        <section className="shell py-14">
          <EmptyState
            title="No memories published yet."
            description="Memories added in the admin panel appear here."
          />
        </section>
      ) : (
        <>
          {featured && (
            <section className="border-b border-line py-12 md:py-16">
              <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                  <div className="frame border border-line">
                    <ArchiveImage
                      src={featured.image_url ?? featured.games?.cover_url ?? null}
                      alt={featured.title}
                      fallbackLabel={featured.title}
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="aspect-[16/10] w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="archivedot" aria-hidden />
                    <p className="kicker text-blood/90">Featured memory</p>
                  </div>

                  <h2 className="display mt-4 text-[clamp(2rem,4.2vw,3.2rem)] text-soft">
                    {featured.title}
                  </h2>

                  <MetaRow
                    className="mt-4"
                    items={[
                      featured.timeframe ?? formatDate(featured.occurred_on, "short"),
                      featured.games?.title,
                    ]}
                  />

                  {featured.description && (
                    <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-silver">
                      {featured.description}
                    </p>
                  )}

                  {featured.games && (
                    <Link href={`/games/${featured.games.slug}`} className="link-quiet mt-7">
                      Open the game archive
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="shell py-12 md:py-16">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="kicker">All memories</h2>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                {String(rest.length).padStart(2, "0")} entries
              </p>
            </div>

            <div>
              {rest.map((memory, index) => (
                <article
                  key={memory.id}
                  className="group grid gap-6 border-b border-line py-8 md:grid-cols-12 md:gap-10 md:py-10"
                >
                  <div
                    className={
                      index % 2 === 0
                        ? "md:col-span-5 md:order-1"
                        : "md:col-span-5 md:order-2"
                    }
                  >
                    <Link
                      href={memory.games ? `/games/${memory.games.slug}` : "/memories"}
                      className="block"
                    >
                      <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                        <ArchiveImage
                          src={memory.image_url ?? memory.games?.cover_url ?? null}
                          alt={memory.title}
                          fallbackLabel={memory.title}
                          sizes="(max-width: 768px) 100vw, 42vw"
                          className="aspect-[4/3] w-full"
                        />
                      </div>
                    </Link>
                  </div>

                  <div
                    className={
                      index % 2 === 0
                        ? "md:col-span-7 md:order-2"
                        : "md:col-span-7 md:order-1"
                    }
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-[1.15rem] leading-none text-blood">
                        {pad(index + 1 + (featured ? 1 : 0))}
                      </span>
                      <MetaRow
                        items={[
                          memory.timeframe ?? formatDate(memory.occurred_on, "short"),
                          memory.games?.title,
                        ]}
                      />
                    </div>

                    <h3 className="mt-3 font-serif text-[1.6rem] leading-tight text-soft md:text-[1.95rem]">
                      {memory.title}
                    </h3>

                    {memory.description && (
                      <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-silver">
                        {memory.description}
                      </p>
                    )}

                    {memory.games && (
                      <Link href={`/games/${memory.games.slug}`} className="link-quiet mt-5">
                        View archive entry
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {rest.length === 0 && (
              <p className="py-10 text-[13px] text-muted">One memory is all there is, for now.</p>
            )}
          </section>

          <section className="border-t border-line py-12 md:py-16">
            <div className="shell flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-2xl font-serif text-[clamp(1.4rem,2.6vw,2rem)] italic leading-snug text-soft/90">
                “The moments worth keeping are rarely the ones the marketing promised.”
              </p>
              <Link href="/collection" className="link-quiet">
                Browse the collection
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
