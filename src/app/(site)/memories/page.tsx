import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { MemoryCard } from "@/components/public/cards";
import { EmptyState, MetaRow, PageHeader } from "@/components/public/primitives";
import { Reveal } from "@/components/public/reveal";
import { getFeaturedMemory, getMemories } from "@/lib/queries/memories";
import { formatDate } from "@/lib/utils";

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
            value:
              memories.length > 1
                ? `${memories[memories.length - 1]?.occurred_on?.slice(0, 4) ?? "—"} — ${
                    memories[0]?.occurred_on?.slice(0, 4) ?? "—"
                  }`
                : "—",
          },
        ]}
      />

      {memories.length === 0 ? (
        <section className="shell py-16">
          <EmptyState
            title="No memories published yet."
            description="Memories added in the admin panel appear here."
          />
        </section>
      ) : (
        <>
          {featured && (
            <section className="border-b border-white/10 py-14 md:py-20">
              <div className="shell grid gap-10 lg:grid-cols-12">
                <Reveal className="lg:col-span-7">
                  <ArchiveImage
                    src={featured.image_url ?? featured.games?.cover_url ?? null}
                    alt={featured.title}
                    fallbackLabel={featured.title}
                    priority
                    className="aspect-[16/10] w-full border border-white/10"
                  />
                </Reveal>

                <Reveal delay={120} className="flex flex-col justify-center lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-blood/80">01</span>
                    <span className="h-px w-8 bg-white/20" />
                    <span className="eyebrow">Featured memory</span>
                  </div>
                  <h2 className="display mt-5 text-[clamp(2rem,4vw,3.2rem)] text-soft">
                    {featured.title}
                  </h2>
                  <MetaRow
                    className="mt-4"
                    items={[featured.timeframe ?? formatDate(featured.occurred_on), featured.games?.title]}
                  />
                  {featured.description && (
                    <p className="mt-5 text-sm leading-relaxed text-silver/80">
                      {featured.description}
                    </p>
                  )}
                  {featured.games && (
                    <Link
                      href={`/games/${featured.games.slug}`}
                      className="group mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-silver transition-colors hover:text-blood"
                    >
                      Open the game archive
                      <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </Reveal>
              </div>
            </section>
          )}

          <section className="shell py-14 md:py-20">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="font-mono text-[10px] text-blood/80">{featured ? "02" : "01"}</span>
              <span className="eyebrow">All memories</span>
              <Quote className="ml-auto size-4 text-white/15" />
            </div>

            <div className="mt-8 grid gap-6">
              {rest.map((memory, index) => (
                <Reveal key={memory.id} delay={(index % 3) * 60}>
                  <MemoryCard memory={memory} index={index + (featured ? 2 : 1)} />
                </Reveal>
              ))}
              {rest.length === 0 && (
                <p className="py-8 text-sm text-silver/50">
                  Only the featured memory is published so far.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
