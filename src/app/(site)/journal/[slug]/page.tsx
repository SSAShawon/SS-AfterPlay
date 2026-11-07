import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { Markdown } from "@/components/public/markdown";
import { MetaRow } from "@/components/public/primitives";
import { ReadingProgress } from "@/components/public/reading-progress";
import { getJournalPostBySlug, getLatestJournalPosts } from "@/lib/queries/journal";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) return { title: "Entry not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title} — SS AFTERPLAY`,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    },
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, latest] = await Promise.all([getJournalPostBySlug(slug), getLatestJournalPosts(4)]);

  if (!post) notFound();

  const related = latest.filter((item) => item.id !== post.id).slice(0, 3);
  const category = post.journal_categories?.name ?? "Essay";

  return (
    <>
      <ReadingProgress />

      <article>
        <header className="border-b border-line pb-10 pt-32 md:pb-14 md:pt-40">
          <div className="shell">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-soft"
            >
              <ArrowLeft className="size-3" />
              The journal
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-9">
                <MetaRow
                  items={[
                    category,
                    formatDate(post.published_at),
                    `${post.reading_minutes ?? 5} min read`,
                  ]}
                />
                <h1 className="display mt-5 max-w-[22ch] text-[clamp(2.3rem,5.6vw,4.6rem)] text-soft">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-6 max-w-2xl font-serif text-[clamp(1.15rem,2vw,1.5rem)] italic leading-snug text-silver">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div className="lg:col-span-3 lg:pt-2">
                <dl className="border-t border-line">
                  {[
                    { label: "Filed under", value: category },
                    { label: "Published", value: formatDate(post.published_at, "short") },
                    { label: "Reading time", value: `${post.reading_minutes ?? 5} minutes` },
                    { label: "Written by", value: "SS" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
                    >
                      <dt className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
                        {item.label}
                      </dt>
                      <dd className="text-right text-[12px] text-soft">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </header>

        {post.cover_url && (
          <div className="shell pt-8 md:pt-10">
            <div className="frame border border-line">
              <ArchiveImage
                src={post.cover_url}
                alt={post.title}
                fallbackLabel={post.title}
                priority
                sizes="100vw"
                className="aspect-[16/9] w-full md:aspect-[21/9]"
              />
            </div>
          </div>
        )}

        <div className="shell grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-32">
              <p className="kicker">The essay</p>
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[11px] leading-relaxed text-muted">
                  Written by SS — one voice, no aggregation, no sponsored placements. Every essay
                  here is personal.
                </p>
              </div>
              <Link href="/journal" className="link-quiet mt-6">
                More essays
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            {post.content ? (
              <div className="prose-archive dropcap">
                <Markdown content={post.content} />
              </div>
            ) : (
              <p className="text-[13.5px] text-muted">This essay has no body text yet.</p>
            )}

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted">
                Filed under {category} · {formatDate(post.published_at, "short")}
              </p>
              <Link href="/journal" className="link-quiet text-[10px]">
                Back to the journal
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line py-12 md:py-16">
          <div className="shell">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="kicker">Keep reading</h2>
              <Link href="/journal" className="link-quiet text-[10px]">
                All essays
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/journal/${item.slug}`} className="group block">
                  <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                    <ArchiveImage
                      src={item.cover_url}
                      alt={item.title}
                      fallbackLabel={item.title}
                      sizes="(max-width: 768px) 100vw, 32vw"
                      className="aspect-[4/3] w-full"
                    />
                  </div>
                  <MetaRow
                    className="mt-3"
                    items={[item.journal_categories?.name ?? "Essay", formatDate(item.published_at, "short")]}
                  />
                  <h3 className="mt-2 font-serif text-[1.3rem] leading-tight text-soft transition-colors group-hover:text-white">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
