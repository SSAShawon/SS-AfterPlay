import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { JournalCard } from "@/components/public/cards";
import { EmptyState, MetaRow, PageHeader } from "@/components/public/primitives";
import { Pagination } from "@/components/public/pagination";
import { getFeaturedJournalPost, getJournalPosts } from "@/lib/queries/journal";
import { cn, formatDate } from "@/lib/utils";

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
    getJournalPosts({ search: params.q, category: params.category, page, perPage: 9 }),
    getFeaturedJournalPost(),
  ]);

  const showFeatured = !params.q && !params.category && page === 1 && featured;
  const list = showFeatured ? result.items.filter((post) => post.id !== featured?.id) : result.items;

  const hasFilters = Boolean(params.q || params.category);

  return (
    <>
      <PageHeader
        kicker="The journal"
        title="Writing from the afterplay."
        intro="Essays, analysis and field notes — about endings, about friction, about the strange hour after the credits when a game is still in the room with you."
        meta={[
          { label: "Published", value: String(result.total) },
          { label: "Categories", value: String(result.categories.length) },
        ]}
      />

      {/* category rail */}
      <div className="sticky top-[62px] z-40 border-b border-line bg-void md:top-[72px]">
        <div className="shell flex items-center justify-between gap-6">
          <nav className="scrollbar-none flex items-center gap-6 overflow-x-auto py-3" aria-label="Categories">
            <Link
              href="/journal"
              className={cn(
                "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                !params.category ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
              )}
            >
              All essays
            </Link>
            {result.categories.map((category) => (
              <Link
                key={category.id}
                href={`/journal?category=${category.slug}`}
                className={cn(
                  "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                  params.category === category.slug
                    ? "border-blood text-soft"
                    : "border-transparent text-muted hover:text-soft",
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <form action="/journal" role="search" className="hidden lg:block">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <label className="flex h-9 w-56 items-center border-b border-line-strong focus-within:border-soft">
              <Search className="size-3.5 text-muted" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search essays"
                aria-label="Search essays"
                className="h-full w-full bg-transparent pl-2.5 text-[12.5px] text-soft placeholder:text-muted focus:outline-none"
              />
            </label>
          </form>
        </div>
      </div>

      <section className="shell py-12 md:py-16">
        {hasFilters && (
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              {result.total} {result.total === 1 ? "entry" : "entries"}
              {params.q ? ` for “${params.q}”` : ""}
            </p>
            <Link href="/journal" className="link-quiet text-[10px]">
              Clear filters
            </Link>
          </div>
        )}

        {/* featured */}
        {showFeatured && featured && (
          <div className="mb-14 border-b border-line pb-12 md:mb-16">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <JournalCard post={featured} featured />
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <span className="kicker">In this issue</span>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(list.length).padStart(2, "0")}
                  </span>
                </div>
                {list.slice(0, 3).map((post) => (
                  <JournalCard key={post.id} post={post} />
                ))}
                {list.length === 0 && (
                  <p className="py-6 text-[13px] text-muted">More essays are on the way.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {result.items.length === 0 ? (
          <EmptyState
            title={params.q ? `Nothing matches “${params.q}”.` : "No essays published yet."}
            description="Try a different search, or read everything in the journal."
            action={{ href: "/journal", label: "All essays" }}
          />
        ) : (
          <div>
            {(showFeatured ? list.slice(3) : list).map((post) => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className="group grid grid-cols-1 items-start gap-5 border-b border-line py-6 transition-colors duration-200 hover:border-line-strong md:grid-cols-12 md:gap-8 md:py-7"
              >
                <div className="md:col-span-2">
                  <MetaRow items={[post.journal_categories?.name ?? "Essay"]} />
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted">
                    {formatDate(post.published_at, "short")}
                  </p>
                </div>

                <div className="md:col-span-7">
                  <h2 className="font-serif text-[1.55rem] leading-tight text-soft transition-colors duration-200 group-hover:text-white md:text-[1.9rem]">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-silver">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted">
                    {post.reading_minutes ?? 5} min read
                  </p>
                </div>

                <div className="md:col-span-3">
                  <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                    <ArchiveImage
                      src={post.cover_url}
                      alt={post.title}
                      fallbackLabel={post.title}
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="aspect-[4/3] w-full"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/journal"
          params={{ q: params.q, category: params.category }}
        />

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="max-w-md font-serif text-[1.25rem] italic text-silver">
            “An ending is not a conclusion. It is the moment a game tells you what it thought you
            were doing.”
          </p>
          <Link href="/about" className="link-quiet">
            About the archive
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
