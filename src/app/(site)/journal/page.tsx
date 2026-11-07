import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { JournalCard } from "@/components/public/cards";
import { EmptyState, PageHeader } from "@/components/public/primitives";
import { Pagination } from "@/components/public/pagination";
import { Reveal } from "@/components/public/reveal";
import { getFeaturedJournalPost, getJournalPosts } from "@/lib/queries/journal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Essays and field notes from SS Afterplay — writing about endings, design, memory and the games that refuse to leave.",
  openGraph: {
    title: "The Journal — SS AFTERPLAY",
    description: "Essays about endings, design, memory and the games that refuse to leave.",
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function JournalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;

  const [result, featured] = await Promise.all([
    getJournalPosts({ search: params.q, category: params.category, page, perPage: 8 }),
    getFeaturedJournalPost(),
  ]);

  const showFeatured = !params.q && !params.category && page === 1 && featured;
  const list = showFeatured
    ? result.items.filter((post) => post.id !== featured?.id)
    : result.items;

  return (
    <>
      <PageHeader
        kicker="The journal"
        title="Writing from the afterplay."
        intro="Essays, analysis and field notes — about endings, about friction, about the strange hour after the credits when a game is still in the room with you."
        meta={[
          { label: "Published entries", value: String(result.total) },
          { label: "Categories", value: String(result.categories.length) },
        ]}
      />

      <section className="sticky top-[68px] z-40 border-b border-white/10 bg-void/92 backdrop-blur-xl md:top-[78px]">
        <div className="shell flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto" aria-label="Categories">
            <Link
              href="/journal"
              className={cn(
                "shrink-0 border-b px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                !params.category ? "border-blood text-soft" : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              All
            </Link>
            {result.categories.map((category) => (
              <Link
                key={category.id}
                href={`/journal?category=${category.slug}`}
                className={cn(
                  "shrink-0 border-b px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                  params.category === category.slug
                    ? "border-blood text-soft"
                    : "border-transparent text-silver/50 hover:text-soft",
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <form action="/journal" className="relative w-full lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search the journal…"
              aria-label="Search journal articles"
              className="h-10 w-full border border-white/12 bg-white/[0.02] pl-9 pr-3 text-sm text-soft placeholder:text-silver/40 focus:border-blood/60 focus:outline-none"
            />
          </form>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        {showFeatured && featured && (
          <div className="mb-14">
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] text-blood/80">01</span>
              <span className="h-px w-8 bg-white/20" />
              <span className="eyebrow">Featured essay</span>
            </div>
            <JournalCard post={featured} featured />
          </div>
        )}

        {list.length === 0 ? (
          <EmptyState
            title="No entries found."
            description="Try a different search term or category."
            action={{ href: "/journal", label: "Clear filters" }}
          />
        ) : (
          <div className={cn(showFeatured ? "" : "mt-4")}>
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="font-mono text-[10px] text-blood/80">{showFeatured ? "02" : "01"}</span>
              <span className="eyebrow">{params.q ? `Results for “${params.q}”` : "Latest entries"}</span>
            </div>
            {list.map((post, index) => (
              <Reveal key={post.id} delay={index * 40}>
                <JournalCard post={post} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/journal"
          params={{ q: params.q, category: params.category }}
        />
      </section>
    </>
  );
}
