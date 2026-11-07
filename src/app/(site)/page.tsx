import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Clock, Sparkles } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { GameCoverCard, GameListRow, JournalCard, MemoryCard } from "@/components/public/cards";
import { EmptyState, MetaRow, Rating, SectionHeading } from "@/components/public/primitives";
import { Reveal } from "@/components/public/reveal";
import { getFeaturedGames, getGames, getHeroGame, getNowPlaying, getRecentCompletions } from "@/lib/queries/games";
import { getFeaturedJournalPost, getLatestJournalPosts } from "@/lib/queries/journal";
import { getFeaturedMemory, getMemories } from "@/lib/queries/memories";
import { getSiteSettings } from "@/lib/queries/settings";
import { getArchiveStats } from "@/lib/queries/stats";
import { formatDate, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, hero, featuredGames, recent, nowPlaying, latestPosts, featuredPost, memories, featuredMemory, stats, collection] =
    await Promise.all([
      getSiteSettings(),
      getHeroGame(),
      getFeaturedGames(3),
      getRecentCompletions(4),
      getNowPlaying(1),
      getLatestJournalPosts(3),
      getFeaturedJournalPost(),
      getMemories({ limit: 3 }),
      getFeaturedMemory(),
      getArchiveStats(),
      getGames({ perPage: 10, sort: "rating" }),
    ]);

  const heroGame = hero;
  const headline = settings.hero_headline ?? heroGame?.title ?? settings.tagline;
  const subline =
    settings.hero_subline ??
    "A personal archive of the games that stayed: storylines, characters, and the moments that outlived them.";

  const featuredList = featuredGames.filter((game) => game.slug !== heroGame?.slug).slice(0, 3);
  const moments = featuredMemory
    ? [featuredMemory, ...memories.filter((memory) => memory.id !== featuredMemory.id)].slice(0, 3)
    : memories.slice(0, 3);

  return (
    <>
      {/* ── 01 · HERO ─────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <ArchiveImage
            src={heroGame?.hero_url ?? heroGame?.cover_url ?? null}
            alt={heroGame ? `${heroGame.title} artwork` : "SS Afterplay archive"}
            fallbackLabel="SS"
            priority
            className="size-full"
            imgClassName="scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,rgba(8,9,12,0.35),rgba(8,9,12,0.82)_60%,#08090C_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/30" />
          <div className="absolute inset-0 grain" />
        </div>

        <div className="shell relative w-full pb-12 pt-36 md:pb-16 md:pt-44">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-blood" />
              <p className="eyebrow text-silver/70">{settings.hero_kicker ?? "Archive 001"}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="display mt-7 max-w-5xl text-[clamp(2.7rem,8.4vw,7.4rem)] text-soft text-shadow-cinema">
              {headline}
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-silver/85 md:text-[15px]">
              {subline}
            </p>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/collection"
                className="group inline-flex items-center gap-3 border border-soft/25 bg-soft/[0.02] px-7 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-soft transition-all duration-500 hover:border-blood hover:bg-blood/10 hover:tracking-[0.28em]"
              >
                Enter the archive
                <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>

              {heroGame && (
                <Link
                  href={`/games/${heroGame.slug}`}
                  className="group inline-flex items-center gap-3 px-1 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-silver/70 transition-colors hover:text-soft"
                >
                  <span className="text-blood/80">Featured file</span>
                  <span className="max-w-[16rem] truncate">{heroGame.title}</span>
                  <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          </Reveal>

          <Reveal delay={460}>
            <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/12 pt-6 md:grid-cols-4 md:gap-10">
              {[
                { label: "Games archived", value: stats.totalGames || "—" },
                { label: "Completed", value: stats.completed || "—" },
                { label: "Hours played", value: stats.totalHours ? `${stats.totalHours}` : "—" },
                { label: "Journal entries", value: stats.totalPosts || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="eyebrow">{item.label}</dt>
                  <dd className="mt-1.5 font-serif text-3xl leading-none text-soft md:text-4xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="absolute bottom-6 right-6 hidden flex-col items-center gap-2 md:flex">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-silver/40">Scroll</span>
          <span className="h-12 w-px bg-gradient-to-b from-blood/70 to-transparent" />
        </div>
      </section>

      {/* ── 02 · FEATURED FILE ────────────────────────────────────── */}
      <section className="relative border-b border-white/10 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            index={1}
            label="Featured file"
            title={heroGame ? "The centrepiece" : "Archive in preparation"}
            description={
              heroGame
                ? "The entry that best explains what this archive is for — a full case file with story, chapters, characters and verdict."
                : "Published games appear here automatically, alongside the featured file selected in the admin panel."
            }
            action={{ href: "/collection", label: "All entries" }}
          />

          {heroGame ? (
            <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-12">
              <Reveal className="md:col-span-5">
                <Link href={`/games/${heroGame.slug}`} className="group block">
                  <div className="relative">
                    <ArchiveImage
                      src={heroGame.cover_url}
                      alt={`${heroGame.title} cover art`}
                      fallbackLabel={heroGame.title}
                      className="aspect-[3/4] w-full border border-white/10"
                      imgClassName="transition-transform duration-[1400ms] group-hover:scale-[1.03]"
                    />
                    <div className="absolute -bottom-4 -right-4 hidden border border-blood/40 bg-void px-4 py-3 md:block">
                      <span className="eyebrow">Personal rating</span>
                      <div className="mt-1">
                        <Rating value={heroGame.rating} />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>

              <Reveal delay={140} className="flex flex-col justify-between md:col-span-7">
                <div>
                  <MetaRow
                    items={[
                      heroGame.release_year,
                      heroGame.developer,
                      heroGame.genres?.slice(0, 2).join(", "),
                      GAME_STATUS_LABELS[heroGame.status],
                    ]}
                  />
                  <h3 className="display mt-5 text-[clamp(2.2rem,5vw,4rem)] text-soft">
                    {heroGame.title}
                  </h3>
                  {heroGame.tagline && (
                    <p className="mt-3 font-serif text-xl italic text-blood/80">{heroGame.tagline}</p>
                  )}
                  <p className="mt-6 max-w-xl text-sm leading-relaxed text-silver/80">
                    {heroGame.summary}
                  </p>

                  <dl className="mt-9 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                    {[
                      { label: "Chapters", value: heroGame.chapters.length || "—" },
                      { label: "Characters", value: heroGame.characters.length || "—" },
                      { label: "Moments", value: heroGame.moments.length || "—" },
                      { label: "Playtime", value: heroGame.playtime_hours ? `${heroGame.playtime_hours}h` : "—" },
                      { label: "Started", value: formatDate(heroGame.started_on, "short") ?? "—" },
                      { label: "Completed", value: formatDate(heroGame.completed_on, "short") ?? "—" },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="eyebrow">{item.label}</dt>
                        <dd className="mt-1 font-serif text-lg text-soft">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-10">
                  <Link
                    href={`/games/${heroGame.slug}`}
                    className="group inline-flex items-center gap-3 border-b border-white/20 pb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-soft transition-colors hover:border-blood"
                  >
                    Open the full case file
                    <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState
                title="No featured entry yet."
                description="Publish a game in the admin panel and mark it as featured — it will appear here immediately."
                action={{ href: "/collection", label: "Browse the collection" }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── 03 · RECENTLY COMPLETED + NOW PLAYING ─────────────────── */}
      <section className="border-b border-white/10 py-20 md:py-28">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              index={2}
              label="Recently completed"
              title="Rolled credits, kept the world"
              action={{ href: "/collection?status=completed", label: "All completed" }}
            />
            <div className="mt-10">
              {recent.length ? (
                recent.map((game, index) => <GameListRow key={game.id} game={game} index={index} />)
              ) : (
                <EmptyState
                  title="Nothing completed yet."
                  description="Completed games are listed here in the order their credits rolled."
                />
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="border border-white/10 bg-white/[0.015] p-6">
              <div className="flex items-center gap-2">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-blood" aria-hidden />
                <span className="eyebrow">Now playing</span>
              </div>
              {nowPlaying.length ? (
                nowPlaying.map((game) => (
                  <Link key={game.id} href={`/games/${game.slug}`} className="group mt-5 block">
                    <ArchiveImage
                      src={game.cover_url}
                      alt={game.title}
                      fallbackLabel={game.title}
                      className="aspect-[16/9] w-full border border-white/10"
                    />
                    <h3 className="mt-4 font-serif text-2xl text-soft transition-colors group-hover:text-white">
                      {game.title}
                    </h3>
                    <MetaRow items={[game.release_year, game.genres?.[0]]} />
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-silver/65">
                      {game.summary}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="mt-5 text-sm text-silver/60">
                  No playthrough in progress — check the backlog.
                </p>
              )}

              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="eyebrow">Status spread</p>
                <ul className="mt-3 space-y-2">
                  {(["completed", "playing", "on_hold", "backlog", "dropped"] as const).map((status) => {
                    const value =
                      status === "completed"
                        ? stats.completed
                        : status === "playing"
                          ? stats.playing
                          : status === "on_hold"
                            ? stats.onHold
                            : status === "backlog"
                              ? stats.backlog
                              : stats.dropped;
                    const total = stats.totalGames || 1;
                    return (
                      <li key={status} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50">
                          {GAME_STATUS_LABELS[status]}
                        </span>
                        <span className="relative h-[2px] flex-1 bg-white/10">
                          <span
                            className="absolute inset-y-0 left-0 bg-blood/70"
                            style={{ width: `${Math.min(100, (value / total) * 100)}%` }}
                          />
                        </span>
                        <span className="font-mono text-[9px] text-silver/50">{value}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── 04 · LATEST JOURNAL ───────────────────────────────────── */}
      <section className="border-b border-white/10 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            index={3}
            label="Latest journal"
            title="Notes from the afterplay"
            description="Essays about endings, friction, guilt and the stories that refuse to leave."
            action={{ href: "/journal", label: "All entries" }}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {featuredPost ? (
                <JournalCard post={featuredPost} featured />
              ) : latestPosts[0] ? (
                <JournalCard post={latestPosts[0]} featured />
              ) : (
                <EmptyState
                  title="The journal is empty."
                  description="Published essays appear here automatically."
                />
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="eyebrow">More reading</span>
                <BookOpen className="size-3.5 text-silver/40" />
              </div>
              <div>
                {latestPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/journal/${post.slug}`}
                    className="group flex gap-4 border-b border-white/[0.07] py-5"
                  >
                    <span className="mt-1 font-mono text-[9px] text-blood/70">
                      {post.published_at ? formatDate(post.published_at, "short")?.slice(0, 6) : "—"}
                    </span>
                    <div>
                      <h4 className="font-serif text-lg leading-snug text-soft transition-colors group-hover:text-white">
                        {post.title}
                      </h4>
                      <p className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
                        <Clock className="size-3" />
                        {post.reading_minutes ?? 5} min read
                      </p>
                    </div>
                  </Link>
                ))}
                {!latestPosts.length && (
                  <p className="py-6 text-sm text-silver/50">No published entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 · THE NUMBERS ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-charcoal/50 py-20 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(50% 80% at 80% 20%, rgba(217,71,71,0.10), transparent 70%)",
          }}
        />
        <div className="shell relative">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow-blood">The numbers</p>
              <h2 className="display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">
                An archive measured in hours
              </h2>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-silver/60">
              Counts come live from the database. Every published entry updates these figures
              automatically.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Games", value: stats.totalGames, suffix: "" },
              { label: "Completed", value: stats.completed, suffix: "" },
              { label: "Hours", value: stats.totalHours, suffix: "h" },
              { label: "Essays", value: stats.totalPosts, suffix: "" },
              { label: "Characters", value: stats.totalCharacters, suffix: "" },
              { label: "Avg rating", value: stats.averageRating ?? "—", suffix: stats.averageRating ? "/10" : "" },
            ].map((item) => (
              <div key={item.label} className="border-t border-white/10 pt-4">
                <dd className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-soft">
                  {item.value}
                  <span className="ml-1 font-sans text-xs text-silver/40">{item.suffix}</span>
                </dd>
                <dt className="mt-3 eyebrow">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 06 · FROM THE COLLECTION ──────────────────────────────── */}
      <section className="border-b border-white/10 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            index={4}
            label="From the collection"
            title="The shelf, in full"
            description="Every game, with its status, platform and the rating I would defend in person."
            action={{ href: "/collection", label: "Open collection" }}
          />

          <div className="mt-12">
            {collection.items.length ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {collection.items.slice(0, 10).map((game, index) => (
                  <Reveal key={game.id} delay={index * 40}>
                    <GameCoverCard game={game} index={index + 1} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                title="The collection is empty."
                description="Publish your first game to populate the archive."
                action={{ href: "/collection", label: "View collection" }}
              />
            )}
          </div>

          {featuredList.length > 0 && (
            <div className="mt-14 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              {featuredList.map((game) => (
                <Link key={game.id} href={`/games/${game.slug}`} className="group flex items-center gap-4">
                  <ArchiveImage
                    src={game.cover_url}
                    alt={game.title}
                    fallbackLabel={game.title}
                    className="aspect-[3/4] w-14 shrink-0 border border-white/10"
                  />
                  <div>
                    <p className="eyebrow text-blood/70">Featured</p>
                    <h3 className="mt-1 font-serif text-lg leading-tight text-soft transition-colors group-hover:text-white">
                      {game.title}
                    </h3>
                    <Rating value={game.rating} className="mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 07 · MEMORABLE MOMENTS ────────────────────────────────── */}
      <section className="border-b border-white/10 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            index={5}
            label="Memorable moments"
            title="The scenes I still think about"
            description="Not the best levels — the moments that landed and stayed."
            action={{ href: "/memories", label: "All memories" }}
          />

          <div className="mt-12 grid gap-6">
            {moments.length ? (
              moments.map((memory, index) => (
                <Reveal key={memory.id} delay={index * 80}>
                  <MemoryCard memory={memory} index={index + 1} />
                </Reveal>
              ))
            ) : (
              <EmptyState
                title="No memories yet."
                description="Add a memory in the admin panel to begin the collection."
              />
            )}
          </div>
        </div>
      </section>

      {/* ── 08 · CTA ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0">
          <ArchiveImage
            src={heroGame?.hero_url ?? null}
            alt=""
            fallbackLabel="SS"
            className="size-full opacity-30"
          />
          <div className="absolute inset-0 bg-void/85" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 120%, rgba(217,71,71,0.16), transparent 70%)",
            }}
          />
          <div className="absolute inset-0 grain" />
        </div>

        <div className="shell relative text-center">
          <Sparkles className="mx-auto size-4 text-blood/80" />
          <h2 className="display mx-auto mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] text-soft">
            The credits roll. The archive begins.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-silver/80">
            Browse the collection, read the essays, or start with the game that explains everything
            about this place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/collection"
              className="group inline-flex items-center gap-3 bg-soft px-8 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-void transition-all duration-500 hover:bg-white hover:tracking-[0.28em]"
            >
              Enter the archive
              <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-3 border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-soft transition-colors hover:border-blood/70 hover:bg-blood/[0.06]"
            >
              See the rankings
            </Link>
          </div>
          <p className="mt-14 font-mono text-[9px] uppercase tracking-[0.3em] text-silver/30">
            {pad(1)} — {settings.tagline}
          </p>
        </div>
      </section>
    </>
  );
}
