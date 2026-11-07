import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { Markdown } from "@/components/public/markdown";
import { SocialLinks } from "@/components/public/social-links";
import { getSiteSettings } from "@/lib/queries/settings";
import { getArchiveStats } from "@/lib/queries/stats";
import { getHeroGame } from "@/lib/queries/games";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "What SS AFTERPLAY is, why it exists, and how this personal cinematic gaming archive is put together.",
  openGraph: {
    title: "About SS AFTERPLAY",
    description: "Why this archive exists, and how it is put together.",
  },
};

const PRINCIPLES = [
  {
    title: "Memory over metrics",
    body: "A score is the least interesting thing about a game. The archive records what a game did to me, not just how it reviewed.",
  },
  {
    title: "The misses stay",
    body: "Dropped and abandoned games remain on the shelf with their reasons attached. An archive that only keeps favourites is a highlight reel.",
  },
  {
    title: "Spoilers, gated",
    body: "Story sections are documented in full, but never revealed without a deliberate click. The record matters; the surprise matters too.",
  },
  {
    title: "One voice",
    body: "No aggregated scores, no community ratings, no sponsored placements. One person, one opinion, written honestly.",
  },
];

export default async function AboutPage() {
  const [settings, stats, hero] = await Promise.all([
    getSiteSettings(),
    getArchiveStats(),
    getHeroGame(),
  ]);

  return (
    <>
      {/* masthead */}
      <section className="border-b border-line pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3">
              <span className="archivedot" aria-hidden />
              <p className="kicker">About the archive</p>
            </div>

            <h1 className="display mt-6 max-w-[20ch] text-[clamp(2.5rem,6vw,4.9rem)] text-soft">
              A museum for the hour after the credits.
            </h1>

            <p className="mt-7 max-w-xl font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] italic leading-snug text-silver">
              {settings.tagline}
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="frame border border-line">
              <ArchiveImage
                src={hero?.hero_url ?? hero?.cover_url ?? null}
                alt={hero ? `${hero.title} artwork` : "SS Afterplay"}
                fallbackLabel="SS"
                priority
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="aspect-[4/3] w-full"
              />
            </div>
            <p className="mt-2 text-[9.5px] uppercase tracking-[0.16em] text-muted">
              Filed from the collection{hero ? ` · ${hero.title}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* statement + facts */}
      <section className="border-b border-line py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="kicker">01 — Why this exists</p>
            <div className="prose-archive mt-6">
              {settings.about_content ? (
                <Markdown content={settings.about_content} />
              ) : (
                <p className="text-[13.5px] leading-relaxed text-silver">
                  The archive is being written. The full statement will appear here once published in
                  the admin panel.
                </p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-32">
              <p className="kicker">Archive at a glance</p>
              <dl className="mt-4 border-t border-line">
                {[
                  { label: "Games archived", value: stats.totalGames },
                  { label: "Completed runs", value: stats.completed },
                  { label: "Hours played", value: stats.totalHours ? `${stats.totalHours}h` : null },
                  { label: "Chapters documented", value: stats.totalChapters },
                  { label: "Characters analysed", value: stats.totalCharacters },
                  { label: "Journal entries", value: stats.totalPosts },
                  { label: "Memories kept", value: stats.totalMemories },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
                  >
                    <dt className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
                      {item.label}
                    </dt>
                    <dd className="font-serif text-[1.15rem] leading-none text-soft">
                      {item.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <p className="kicker">Elsewhere</p>
                <SocialLinks links={settings.social_links} className="mt-3" />
              </div>

              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="link-quiet mt-5 text-[10px]"
                >
                  Write to the archivist
                  <ArrowUpRight className="size-3" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* principles */}
      <section className="border-b border-line py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">02 — Rules of the archive</p>
              <h2 className="display mt-4 max-w-[24ch] text-[clamp(1.9rem,3.6vw,2.8rem)] text-soft">
                Four rules, kept to
              </h2>
            </div>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-muted">
              Not mission statements — the working constraints that decide what gets written here.
            </p>
          </div>

          <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="border-t border-line pt-5">
                <span className="text-[10px] tabular-nums tracking-[0.12em] text-blood">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-[1.5rem] leading-tight text-soft">
                  {principle.title}
                </h3>
                <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-silver">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it is built */}
      <section className="py-14 md:py-20">
        <div className="shell grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <p className="kicker">03 — How it is built</p>
            <p className="mt-5 text-[13.5px] leading-relaxed text-silver">
              SS AFTERPLAY runs on Next.js with a Supabase Postgres database, row-level security and a
              single-administrator login. Artwork is hosted externally and referenced by direct URL,
              so the archive can be curated without touching a line of code. Every count, rating and
              entry on this site comes from the database — nothing here is hardcoded decoration.
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <p className="font-serif text-[clamp(1.5rem,3vw,2.2rem)] italic leading-snug text-soft/90">
              “The game ends. The memories don&apos;t.”
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/collection" className="btn group">
                Browse the collection
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link href="/journal" className="btn-ghost">
                Read the journal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
