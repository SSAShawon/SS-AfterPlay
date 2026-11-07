import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { GameListRow, JournalCard } from "@/components/public/cards";
import { EmptyState, MetaRow, Rating, SectionHeading, StatusBadge } from "@/components/public/primitives";
import {
  getFeaturedGames,
  getGames,
  getHeroGame,
  getNowPlaying,
  getRecentCompletions,
} from "@/lib/queries/games";
import { getFeaturedJournalPost, getLatestJournalPosts } from "@/lib/queries/journal";
import { getFeaturedMemory, getMemories } from "@/lib/queries/memories";
import { getSiteSettings } from "@/lib/queries/settings";
import { getArchiveStats } from "@/lib/queries/stats";
import { formatDate, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    settings,
    hero,
    featuredGames,
    recent,
    nowPlaying,
    latestPosts,
    featuredPost,
    memories,
    featuredMemory,
    stats,
    collection,
  ] = await Promise.all([
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
    getGames({ perPage: 7, sort: "rating" }),
  ]);

  const headline = settings.hero_headline ?? hero?.title ?? settings.tagline;
  const subline =
    settings.hero_subline ??
    "A personal archive of the games that stayed — their stories, their characters, and the moments that outlived the credits.";

  const leadPost = featuredPost ?? latestPosts[0] ?? null;
  const sidePosts = latestPosts.filter((post) => post.id !== leadPost?.id).slice(0, 3);
  const moments = featuredMemory
    ? [featuredMemory, ...memories.filter((memory) => memory.id !== featuredMemory.id)].slice(0, 3)
    : memories.slice(0, 3);

  const shelf = collection.items.slice(0, 7);
  const running = nowPlaying[0];
  const extraFeatured = featuredGames.filter((game) => game.slug !== hero?.slug).slice(0, 2);

  return (
    <>
      {/* ── Cover story ───────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[clamp(30rem,78vh,46rem)] flex-col justify-end overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <ArchiveImage
            src={hero?.hero_url ?? hero?.cover_url ?? null}
            alt={hero ? `${hero.title} artwork` : "SS Afterplay archive"}
            fallbackLabel="SS"
            priority
            sizes="100vw"
            className="size-full"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#08090C_4%,rgba(8,9,12,0.86)_38%,rgba(8,9,12,0.35)_72%,rgba(8,9,12,0.55)_100%)]" />
        </div>

        <div className="shell relative w-full pb-10 pt-32 md:pb-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-blood" aria-hidden />
            <p className="kicker text-silver/80">{settings.hero_kicker ?? "Archive 001"}</p>
          </div>

          <h1 className="display mt-6 max-w-[17ch] text-[clamp(2.6rem,7vw,6rem)] text-soft">
            {headline}
          </h1>

          <p className="mt-6 max-w-[34rem] text-[14.5px] leading-relaxed text-silver md:text-[15px]">
            {subline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/collection" className="btn group">
              Enter the archive
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {hero && (
              <Link href={`/games/${hero.slug}`} className="group flex items-baseline gap-3">
                <span className="kicker text-blood">Cover story</span>
                <span className="font-serif text-[1.3rem] leading-none text-soft transition-colors group-hover:text-white">
                  {hero.title}
                </span>
                <ArrowUpRight className="size-3.5 text-silver transition-colors group-hover:text-soft" />
              </Link>
            )}
          </div>
        </div>

        {/* issue strip */}
        <div className="relative border-t border-white/10 bg-void/40">
          <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3">
            <p className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-silver/70">
              Issue 001 · A personal gaming archive
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[9.5px] font-medium uppercase tracking-[0.18em] text-silver/70">
              <span>{stats.totalGames} games</span>
              <span className="h-3 w-px bg-white/15" aria-hidden />
              <span>{stats.completed} completed</span>
              <span className="h-3 w-px bg-white/15" aria-hidden />
              <span>{stats.totalHours ? `${stats.totalHours}h` : "—"} played</span>
              <span className="h-3 w-px bg-white/15" aria-hidden />
              <span>{stats.totalPosts} essays</span>
              {running && (
                <>
                  <span className="h-3 w-px bg-white/15" aria-hidden />
                  <span className="text-blood/90">Now playing · {running.title}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 · Featured file ────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            index={1}
            label="The centrepiece"
            title={hero ? "The file that explains the archive" : "The archive is being written"}
            description={
              hero
                ? "One entry gets the full treatment: the whole story, chapter by chapter, the people in it, and the verdict I would defend in person."
                : "Published games appear here as soon as the first entry is live."
            }
            action={{ href: "/collection", label: "All entries" }}
          />

          {hero ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <Link href={`/games/${hero.slug}`} className="group block">
                  <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                    <ArchiveImage
                      src={hero.hero_url ?? hero.cover_url}
                      alt={`${hero.title} artwork`}
                      fallbackLabel={hero.title}
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="aspect-[16/9] w-full"
                    />
                  </div>
                </Link>
                <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3">
                  <MetaRow
                    items={[
                      hero.developer,
                      hero.publisher && hero.publisher !== hero.developer ? hero.publisher : null,
                      hero.release_year,
                    ]}
                  />
                  <StatusBadge status={hero.status} />
                </div>
              </div>

              <div className="flex flex-col justify-between lg:col-span-5">
                <div>
                  <Link href={`/games/${hero.slug}`} className="group block">
                    <h3 className="display text-[clamp(2.2rem,4.6vw,3.6rem)] text-soft transition-colors duration-200 group-hover:text-white">
                      {hero.title}
                    </h3>
                  </Link>

                  {hero.tagline && (
                    <p className="mt-2 font-serif text-[1.35rem] italic leading-snug text-blood/90">
                      {hero.tagline}
                    </p>
                  )}

                  <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-silver">
                    {hero.summary}
                  </p>
                </div>

                <div className="mt-8">
                  <div className="flex items-end justify-between gap-6 border-t border-line pt-5">
                    <div>
                      <p className="kicker">Personal rating</p>
                      <p className="mt-2 flex items-baseline gap-2">
                        <span className="font-serif text-[2.6rem] leading-none text-soft">
                          {hero.rating === null ? "—" : hero.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">/ 10</span>
                      </p>
                    </div>
                    <dl className="flex gap-6 text-right">
                      {[
                        { label: "Chapters", value: hero.chapters.length },
                        { label: "Characters", value: hero.characters.length },
                        { label: "Moments", value: hero.moments.length },
                      ].map((item) => (
                        <div key={item.label}>
                          <dd className="font-serif text-[1.5rem] leading-none text-soft">
                            {item.value || "—"}
                          </dd>
                          <dt className="mt-1.5 kicker">{item.label}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <Link href={`/games/${hero.slug}`} className="btn-ghost group mt-6 w-full sm:w-auto">
                    Read the full case file
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="No published games yet."
                description="The archive is connected to the database — publish a game in the admin panel and it will appear here."
                action={{ href: "/admin/login", label: "Open the admin" }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── 02 · Recently completed ───────────────────────────────── */}
      {recent.length > 0 && (
        <section className="border-t border-line py-14 md:py-20">
          <div className="shell">
            <SectionHeading
              index={2}
              label="Recently completed"
              title="Rolled credits, kept the world"
              action={{ href: "/collection?status=completed", label: "All completed" }}
            />

            <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
              {recent.map((game, index) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group w-[58%] shrink-0 snap-start sm:w-[38%] md:w-auto"
                >
                  <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                    <ArchiveImage
                      src={game.cover_url}
                      alt={`${game.title} cover art`}
                      fallbackLabel={game.title}
                      sizes="(max-width: 768px) 58vw, 24vw"
                      className="aspect-[4/5] w-full"
                    />
                  </div>
                  <div className="mt-3 border-t border-line pt-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="min-w-0 truncate font-serif text-[1.2rem] leading-tight text-soft transition-colors group-hover:text-white">
                        {game.title}
                      </h3>
                      <Rating value={game.rating} />
                    </div>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                      {[game.release_year, game.genres?.[0]].filter(Boolean).join(" / ")}
                      <span className="ml-1.5 text-muted/60">{pad(index + 1)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 03 · Journal ──────────────────────────────────────────── */}
      <section className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            index={3}
            label="Latest journal"
            title="Notes from the afterplay"
            description="Essays about endings, friction and the stories that refuse to leave."
            action={{ href: "/journal", label: "All entries" }}
          />

          <div className="mt-9 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              {leadPost ? (
                <JournalCard post={leadPost} featured />
              ) : (
                <EmptyState
                  title="The journal is empty."
                  description="Published essays appear here automatically."
                />
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <span className="kicker">More reading</span>
                <span className="text-[10px] tabular-nums text-muted">
                  {latestPosts.length ? `0${latestPosts.length}` : "00"}
                </span>
              </div>

              {sidePosts.length > 0 ? (
                sidePosts.map((post) => <JournalCard key={post.id} post={post} />)
              ) : (
                <p className="py-6 text-[13px] text-muted">More essays are on the way.</p>
              )}

              <Link href="/journal" className="link-quiet mt-6">
                Browse the journal
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · The numbers ──────────────────────────────────────── */}
      <section className="border-t border-line bg-[#0a0b0e] py-14 md:py-20">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="kicker">The record so far</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.7rem)] text-soft">
              Measured in hours, not hype.
            </h2>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-silver">
              Every figure below comes straight from the database. Nothing is hardcoded, and every
              published entry moves the numbers.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:col-span-8">
            {[
              { label: "Games archived", value: stats.totalGames, suffix: "" },
              { label: "Completed", value: stats.completed, suffix: "" },
              { label: "Hours played", value: stats.totalHours, suffix: "h" },
              { label: "Essays", value: stats.totalPosts, suffix: "" },
              { label: "Characters", value: stats.totalCharacters, suffix: "" },
              {
                label: "Average rating",
                value: stats.averageRating ?? "—",
                suffix: stats.averageRating ? "/10" : "",
              },
            ].map((item) => (
              <div key={item.label} className="border-t border-line pt-4">
                <dd className="font-serif text-[clamp(2rem,3.6vw,2.8rem)] leading-none text-soft">
                  {item.value}
                  <span className="ml-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {item.suffix}
                  </span>
                </dd>
                <dt className="mt-3 kicker">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 05 · From the collection ──────────────────────────────── */}
      <section className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            index={4}
            label="From the collection"
            title="The shelf, in full"
            description="Every game kept on the record — including the ones I put down and the ones still waiting."
            action={{ href: "/collection", label: "Open the collection" }}
          />

          {shelf.length > 0 ? (
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
              {shelf.map((game, index) => {
                const wide = index === 0;
                const medium = index === 1 || index === 2;

                return (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className={
                      wide
                        ? "group block lg:col-span-5 lg:row-span-2"
                        : medium
                          ? "group block lg:col-span-4"
                          : "group block lg:col-span-3"
                    }
                  >
                    <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                      <ArchiveImage
                        src={game.cover_url}
                        alt={`${game.title} cover art`}
                        fallbackLabel={game.title}
                        sizes={wide ? "(max-width: 1024px) 100vw, 40vw" : "(max-width: 1024px) 50vw, 22vw"}
                        className={
                          wide
                            ? "aspect-[3/4] w-full lg:aspect-[4/5]"
                            : "aspect-[3/4] w-full"
                        }
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3 border-t border-line pt-2.5">
                      <div className="min-w-0">
                        <h3
                          className={
                            wide
                              ? "truncate font-serif text-[1.5rem] leading-tight text-soft transition-colors group-hover:text-white"
                              : "truncate font-serif text-[1.1rem] leading-tight text-soft transition-colors group-hover:text-white"
                          }
                        >
                          {game.title}
                        </h3>
                        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                          {[game.release_year, game.genres?.[0], GAME_STATUS_LABELS[game.status]]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      </div>
                      <Rating value={game.rating} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="The collection is empty."
              description="Publish your first game to populate the archive."
              action={{ href: "/collection", label: "View collection" }}
            />
          )}

          {extraFeatured.length > 0 && (
            <div className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
              <p className="kicker sm:col-span-1">Featured this issue</p>
              <div className="sm:col-span-2">
                {extraFeatured.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
                  >
                    <span className="font-serif text-[1.15rem] text-soft transition-colors group-hover:text-white">
                      {game.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      {game.release_year ?? "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 06 · Moments ──────────────────────────────────────────── */}
      <section className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            index={5}
            label="Memorable moments"
            title="The scenes I still think about"
            description="Not the best levels — the moments that landed and stayed."
            action={{ href: "/memories", label: "All memories" }}
          />

          {moments.length > 0 ? (
            <div className="mt-9 grid gap-8 md:grid-cols-3 md:gap-7">
              {moments.map((memory, index) => (
                <article key={memory.id} className="group">
                  <Link
                    href={memory.games ? `/games/${memory.games.slug}` : "/memories"}
                    className="block"
                  >
                    <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
                      <ArchiveImage
                        src={memory.image_url ?? memory.games?.cover_url ?? null}
                        alt={memory.title}
                        fallbackLabel={memory.title}
                        sizes="(max-width: 768px) 100vw, 32vw"
                        className="aspect-[4/3] w-full"
                      />
                    </div>
                  </Link>

                  <div className="mt-3 border-t border-line pt-3">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base leading-none text-blood">
                        {pad(index + 1)}
                      </span>
                      <MetaRow items={[memory.timeframe ?? formatDate(memory.occurred_on, "short")]} />
                    </div>
                    <h3 className="mt-2.5 font-serif text-[1.45rem] leading-tight text-soft">
                      {memory.title}
                    </h3>
                    {memory.games && (
                      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                        {memory.games.title}
                      </p>
                    )}
                    {memory.description && (
                      <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-silver">
                        {memory.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No memories yet."
              description="Add a memory in the admin panel to begin the collection."
            />
          )}
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────── */}
      <section className="border-t border-line py-16 md:py-24">
        <div className="shell grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="kicker">End of issue</p>
            <h2 className="display mt-4 max-w-[22ch] text-[clamp(2rem,4.6vw,3.6rem)] text-soft">
              The credits roll. The archive begins.
            </h2>
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/collection" className="btn">
                Browse the collection
              </Link>
              <Link href="/rankings" className="btn-ghost">
                The rankings
              </Link>
            </div>
            <p className="mt-6 font-serif text-[1.15rem] italic text-silver">{settings.tagline}</p>
          </div>
        </div>

        {recent.length > 0 && (
          <div className="shell mt-14">
            <p className="kicker">Recently finished</p>
            <div className="mt-3">
              {recent.slice(0, 3).map((game, index) => (
                <GameListRow key={game.id} game={game} index={index} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
