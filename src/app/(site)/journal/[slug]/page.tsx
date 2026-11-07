import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { Markdown } from "@/components/public/markdown";
import { MetaRow } from "@/components/public/primitives";
import { ReadingProgress } from "@/components/public/reading-progress";
import { getJournalPostBySlug, getLatestJournalPosts } from "@/lib/queries/journal";
import { formatDate, pad } from "@/lib/utils";

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

  return (
    <>
      <ReadingProgress />

      <article>
        <header className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <ArchiveImage
              src={post.cover_url}
              alt={post.title}
              fallbackLabel={post.title}
              priority
              className="size-full"
            />
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(8,9,12,0.45),rgba(8,9,12,0.88)_60%,#08090C_100%)]" />
            <div className="absolute inset-0 grain" />
          </div>

          <div className="shell relative pb-14 pt-32 md:pb-20 md:pt-40">
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-silver/60 transition-colors hover:text-soft"
            >
              <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-1" />
              The journal
            </Link>

            <div className="mt-8 max-w-3xl">
              <MetaRow
                items={[
                  post.journal_categories?.name ?? "Essay",
                  formatDate(post.published_at),
                  `${post.reading_minutes ?? 5} min read`,
                ]}
              />
              <h1 className="display mt-5 text-[clamp(2.3rem,6vw,4.6rem)] text-soft text-shadow-cinema">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 max-w-2xl font-serif text-xl italic leading-relaxed text-silver/85">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="shell grid gap-12 py-14 md:py-20 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              <div>
                <p className="eyebrow">Filed under</p>
                <p className="mt-2 font-serif text-xl text-soft">
                  {post.journal_categories?.name ?? "Essay"}
                </p>
              </div>
              <div>
                <p className="eyebrow">Published</p>
                <p className="mt-2 text-sm text-silver/70">{formatDate(post.published_at) ?? "—"}</p>
              </div>
              <div>
                <p className="eyebrow">Reading time</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-silver/70">
                  <Clock className="size-3.5" /> {post.reading_minutes ?? 5} minutes
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-silver/40">
                  Written by SS
                  <br />
                  Personal archive · 001
                </p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <Markdown content={post.content} className="prose-archive max-w-[68ch]" />

            <div className="mt-16 border-t border-white/10 pt-6">
              <p className="font-serif text-2xl italic text-silver/60">
                The game ends. The memories don&apos;t.
              </p>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/10 py-16 md:py-20">
          <div className="shell">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-blood/80">{pad(2)}</span>
              <span className="h-px w-8 bg-white/20" />
              <span className="eyebrow">Keep reading</span>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/journal/${item.slug}`} className="group">
                  <ArchiveImage
                    src={item.cover_url}
                    alt={item.title}
                    fallbackLabel={item.title}
                    className="aspect-[16/10] w-full border border-white/10"
                  />
                  <MetaRow
                    className="mt-3"
                    items={[item.journal_categories?.name, `${item.reading_minutes ?? 5} min read`]}
                  />
                  <h2 className="mt-2 font-serif text-xl leading-snug text-soft transition-colors group-hover:text-white">
                    {item.title}
                  </h2>
                  <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-silver/50 group-hover:text-blood">
                    Read <ArrowUpRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
