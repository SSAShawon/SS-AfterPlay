import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
      <section className="relative isolate overflow-hidden border-b border-white/10 pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="absolute inset-0">
          <ArchiveImage
            src={hero?.hero_url ?? null}
            alt=""
            fallbackLabel="SS"
            priority
            className="size-full opacity-25"
          />
          <div className="absolute inset-0 bg-[radial-gradient(100%_90%_at_20%_0%,rgba(217,71,71,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/90 to-void" />
          <div className="absolute inset-0 grain" />
        </div>

        <div className="shell relative">
          <p className="eyebrow-blood">About the archive</p>
          <h1 className="display mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.6rem)] text-soft">
            A museum for the hour after the credits.
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-silver/85">
            {settings.tagline}
          </p>
        </div>
      </section>

      <section className="shell grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-blood/80">01</span>
            <span className="h-px w-8 bg-white/20" />
            <span className="eyebrow">Why this exists</span>
          </div>

          <div className="mt-8">
            {settings.about_content ? (
              <Markdown content={settings.about_content} />
            ) : (
              <p className="text-sm leading-relaxed text-silver/70">
                The archive is being written. The full statement will appear here once published in
                the admin panel.
              </p>
            )}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="border border-white/10 bg-white/[0.015] p-7">
            <p className="eyebrow">Archive at a glance</p>
            <dl className="mt-6 space-y-5">
              {[
                { label: "Games archived", value: stats.totalGames },
                { label: "Completed runs", value: stats.completed },
                { label: "Hours played", value: `${stats.totalHours}h` },
                { label: "Chapters documented", value: stats.totalChapters },
                { label: "Characters analysed", value: stats.totalCharacters },
                { label: "Journal entries", value: stats.totalPosts },
                { label: "Memories kept", value: stats.totalMemories },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-3">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/50">
                    {item.label}
                  </dt>
                  <dd className="font-serif text-xl text-soft">{item.value || "—"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7">
              <p className="eyebrow">Elsewhere</p>
              <SocialLinks links={settings.social_links} className="mt-4" />
            </div>

            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-silver/70 transition-colors hover:text-soft"
              >
                Write to the archivist
                <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>
        </aside>
      </section>

      <section className="border-y border-white/10 bg-charcoal/40 py-16 md:py-24">
        <div className="shell">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-blood/80">02</span>
            <span className="h-px w-8 bg-white/20" />
            <span className="eyebrow">Rules of the archive</span>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="border-t border-white/10 pt-5">
                <span className="font-mono text-[9px] text-blood/60">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 font-serif text-2xl text-soft">{principle.title}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-silver/70">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-blood/80">03</span>
              <span className="h-px w-8 bg-white/20" />
              <span className="eyebrow">How it is built</span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-silver/70">
              SS AFTERPLAY runs on Next.js with a Supabase Postgres database, row-level security and
              a single-administrator login. Artwork is hosted externally and referenced by direct
              URL, so the archive can be curated without touching a line of code. Every count,
              rating and entry on this site comes from the database — nothing here is hardcoded
              decoration.
            </p>
          </div>

          <div className="border-l border-white/10 pl-8">
            <p className="font-serif text-2xl italic leading-relaxed text-soft/85">
              “The game ends. The memories don&apos;t.”
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-soft transition-colors hover:border-blood/60 hover:bg-blood/[0.06]"
              >
                Browse the collection
              </Link>
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-1 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-silver/70 transition-colors hover:text-soft"
              >
                Read the journal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
