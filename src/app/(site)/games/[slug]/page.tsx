import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { GameCoverCard } from "@/components/public/cards";
import { GameSectionNav, type NavSection } from "@/components/public/game-section-nav";
import { Markdown } from "@/components/public/markdown";
import { MetaRow, Rating, StatusBadge } from "@/components/public/primitives";
import { ReadingProgress } from "@/components/public/reading-progress";
import { SpoilerGate } from "@/components/public/spoiler-gate";
import { getGameBySlug } from "@/lib/queries/games";
import { cn, formatDate, formatRating, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) return { title: "Game not found" };

  return {
    title: game.title,
    description: game.summary ?? `${game.title} — the full archive entry.`,
    openGraph: {
      title: `${game.title} — SS AFTERPLAY`,
      description: game.summary ?? undefined,
      type: "article",
      images: game.hero_url || game.cover_url ? [{ url: (game.hero_url ?? game.cover_url) as string }] : undefined,
    },
  };
}

const SECTIONS: (NavSection & { key: string })[] = [
  { id: "overview", label: "Overview", key: "overview" },
  { id: "storyline", label: "Storyline", key: "storyline" },
  { id: "chapters", label: "Chapters", key: "chapters" },
  { id: "characters", label: "Characters", key: "characters" },
  { id: "moments", label: "Moments", key: "moments" },
  { id: "review", label: "Review", key: "review" },
  { id: "verdict", label: "Verdict", key: "verdict" },
  { id: "related", label: "Related", key: "related" },
];

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) notFound();

  const sections = SECTIONS.filter((section) => {
    if (section.id === "storyline") return Boolean(game.storyline);
    if (section.id === "chapters") return game.chapters.length > 0;
    if (section.id === "characters") return game.characters.length > 0;
    if (section.id === "moments") return game.moments.length > 0;
    if (section.id === "review") return game.reviews.length > 0;
    return true;
  });

  const facts = [
    { label: "Developer", value: game.developer },
    { label: "Publisher", value: game.publisher },
    { label: "Released", value: game.release_year ? String(game.release_year) : null },
    { label: "Genres", value: game.genres?.join(", ") },
    { label: "Platforms", value: game.platforms?.join(", ") },
    { label: "Status", value: GAME_STATUS_LABELS[game.status] },
    { label: "Started", value: formatDate(game.started_on, "short") },
    { label: "Completed", value: formatDate(game.completed_on, "short") },
    { label: "Playtime", value: game.playtime_hours ? `${game.playtime_hours} hours` : null },
  ].filter((fact) => Boolean(fact.value));

  return (
    <>
      <ReadingProgress />

      {/* ── Cover ─────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[clamp(26rem,64vh,40rem)] flex-col justify-end overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <ArchiveImage
            src={game.hero_url ?? game.cover_url}
            alt={game.title}
            fallbackLabel={game.title}
            priority
            sizes="100vw"
            className="size-full"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#08090C_3%,rgba(8,9,12,0.88)_34%,rgba(8,9,12,0.42)_70%,rgba(8,9,12,0.6)_100%)]" />
        </div>

        <div className="shell relative w-full pb-8 pt-28">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.2em] text-silver/80 transition-colors hover:text-soft"
          >
            <ArrowLeft className="size-3" />
            The collection
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="archivedot" aria-hidden />
            <p className="kicker text-silver/80">
              Case file {game.release_year ? `/ ${game.release_year}` : ""}
            </p>
          </div>

          <h1 className="display mt-4 max-w-[20ch] text-[clamp(2.4rem,6.4vw,5rem)] text-soft">
            {game.title}
          </h1>

          {game.tagline && (
            <p className="mt-3 max-w-2xl font-serif text-[clamp(1.1rem,2.2vw,1.6rem)] italic text-white/80">
              {game.tagline}
            </p>
          )}

          <div className="mt-6">
            <MetaRow
              items={[
                game.developer,
                game.release_year,
                game.genres?.slice(0, 2).join(", "),
                game.platforms?.slice(0, 2).join(" / "),
              ]}
              className="text-silver/75"
            />
          </div>
        </div>
      </section>

      {/* facts bar */}
      <div className="border-b border-line bg-void">
        <div className="shell flex flex-wrap items-center gap-x-10 gap-y-4 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-muted">Rating</span>
            <Rating value={game.rating} />
          </div>
          <StatusBadge status={game.status} />
          {game.playtime_hours ? (
            <span className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-silver">
              {game.playtime_hours}h logged
            </span>
          ) : null}
          <span className="hidden text-[9.5px] font-medium uppercase tracking-[0.16em] text-muted md:inline">
            {game.chapters.length} chapters · {game.characters.length} characters · {game.moments.length} moments
          </span>
          <a
            href="#verdict"
            className="ml-auto hidden text-[9.5px] font-medium uppercase tracking-[0.16em] text-silver transition-colors hover:text-soft sm:inline"
          >
            Jump to verdict
          </a>
        </div>
      </div>

      <GameSectionNav sections={sections} />

      {/* ── 01 · Overview ─────────────────────────────────────────── */}
      <section id="overview" className="scroll-mt-32 border-b border-line py-14 md:py-20">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="kicker">01 — Overview</p>
            <h2 className="display mt-4 text-[clamp(1.8rem,3.4vw,2.7rem)] text-soft">
              What this game is
            </h2>

            {game.summary && (
              <p className="mt-6 max-w-2xl font-serif text-[clamp(1.2rem,2vw,1.55rem)] leading-snug text-soft/95">
                {game.summary}
              </p>
            )}

            <div className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {[
                { label: "Why it is in the archive", value: game.why_archived },
                { label: "Setting", value: game.setting },
                { label: "Gameplay", value: game.gameplay_type },
                { label: "Main theme", value: game.main_theme },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="border-t border-line pt-3">
                    <p className="kicker">{item.label}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-silver">{item.value}</p>
                  </div>
                ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              <div className="lg:order-2">
                <dl className="border-t border-line">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
                    >
                      <dt className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-muted">
                        {fact.label}
                      </dt>
                      <dd className="text-right text-[12.5px] text-soft">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lg:order-1">
                <div className="frame border border-line">
                  <ArchiveImage
                    src={game.cover_url}
                    alt={`${game.title} cover art`}
                    fallbackLabel={game.title}
                    sizes="(max-width: 640px) 45vw, 30vw"
                    className="aspect-[3/4] w-full"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── 02 · Storyline ────────────────────────────────────────── */}
      {game.storyline && (
        <section id="storyline" className="scroll-mt-32 border-b border-line py-14 md:py-20">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-3">
              <p className="kicker">02 — Storyline</p>
              <h2 className="display mt-4 text-[clamp(1.7rem,3vw,2.3rem)] text-soft">
                The whole story
              </h2>
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                Start to finish, in order. Gated so the story stays yours until you ask for it.
              </p>
            </div>

            <div className="lg:col-span-9">
              <SpoilerGate>
                <div className="prose-archive dropcap">
                  <Markdown content={game.storyline} />
                </div>
              </SpoilerGate>
            </div>
          </div>
        </section>
      )}

      {/* ── 03 · Chapters ─────────────────────────────────────────── */}
      {game.chapters.length > 0 && (
        <section id="chapters" className="scroll-mt-32 border-b border-line py-14 md:py-20">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-32">
                <p className="kicker">03 — Chapters</p>
                <h2 className="display mt-4 text-[clamp(1.7rem,3vw,2.3rem)] text-soft">
                  Chapter by chapter
                </h2>
                <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                  {game.chapters.length} chapters, with the events that moved the story and the
                  developments that changed it.
                </p>

                <ol className="mt-6 hidden space-y-1 lg:block">
                  {game.chapters.map((chapter, index) => (
                    <li key={chapter.id}>
                      <a
                        href={`#chapter-${chapter.id}`}
                        className="flex items-baseline gap-3 text-[11px] text-muted transition-colors hover:text-soft"
                      >
                        <span className="tabular-nums text-blood/60">{pad(index + 1)}</span>
                        <span className="truncate">{chapter.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="border-t border-line">
                {game.chapters.map((chapter, index) => (
                  <article
                    key={chapter.id}
                    id={`chapter-${chapter.id}`}
                    className="scroll-mt-32 border-b border-line py-7 md:py-8"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[11px] tabular-nums tracking-[0.1em] text-blood">
                        {pad(index + 1)}
                      </span>
                      <h3 className="font-serif text-[1.6rem] leading-tight text-soft md:text-[1.85rem]">
                        {chapter.title}
                      </h3>
                    </div>

                    {chapter.summary && (
                      <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-silver">
                        {chapter.summary}
                      </p>
                    )}

                    {(chapter.important_events || chapter.story_developments) && (
                      <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                        {chapter.important_events && (
                          <div>
                            <p className="kicker">Important events</p>
                            <p className="mt-2 text-[12.5px] leading-relaxed text-silver/85">
                              {chapter.important_events}
                            </p>
                          </div>
                        )}
                        {chapter.story_developments && (
                          <div>
                            <p className="kicker">Story developments</p>
                            <p className="mt-2 text-[12.5px] leading-relaxed text-silver/85">
                              {chapter.story_developments}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 04 · Characters ───────────────────────────────────────── */}
      {game.characters.length > 0 && (
        <section id="characters" className="scroll-mt-32 border-b border-line py-14 md:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
              <div>
                <p className="kicker">04 — Characters</p>
                <h2 className="display mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] text-soft">
                  The people in the story
                </h2>
              </div>
              <p className="max-w-sm text-[12.5px] leading-relaxed text-muted">
                Written as analysis, not description — who they are, how they change, and why they
                stay with me.
              </p>
            </div>

            <div className="mt-10 space-y-12 md:space-y-16">
              {game.characters.map((character, index) => {
                const hasPortrait = Boolean(character.portrait_url);
                return (
                  <article
                    key={character.id}
                    className="grid gap-6 border-t border-line pt-7 md:gap-10 lg:grid-cols-12"
                  >
                    {hasPortrait && (
                      <div className="lg:col-span-3">
                        <div className="frame border border-line">
                          <ArchiveImage
                            src={character.portrait_url}
                            alt={character.name}
                            fallbackLabel={character.name}
                            sizes="(max-width: 1024px) 40vw, 22vw"
                            className="aspect-[3/4] w-full"
                          />
                        </div>
                      </div>
                    )}

                    <div className={hasPortrait ? "lg:col-span-9" : "lg:col-span-12"}>
                      <div className="flex items-baseline gap-4">
                        <span className="text-[11px] tabular-nums tracking-[0.1em] text-blood">
                          {pad(index + 1)}
                        </span>
                        <div>
                          <h3 className="font-serif text-[1.8rem] leading-none text-soft md:text-[2.1rem]">
                            {character.name}
                          </h3>
                          {character.role && (
                            <p className="mt-2 text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted">
                              {character.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                        {[
                          { label: "Personality", value: character.personality },
                          { label: "Background", value: character.background },
                          { label: "Development", value: character.development },
                        ]
                          .filter((item) => item.value)
                          .map((item) => (
                            <div key={item.label}>
                              <p className="kicker">{item.label}</p>
                              <p className="mt-2 text-[12.5px] leading-relaxed text-silver/90">
                                {item.value}
                              </p>
                            </div>
                          ))}
                      </div>

                      {character.analysis && (
                        <p className="mt-6 border-l-2 border-blood pl-5 font-serif text-[1.15rem] italic leading-relaxed text-soft/90">
                          {character.analysis}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 05 · Moments ──────────────────────────────────────────── */}
      {game.moments.length > 0 && (
        <section id="moments" className="scroll-mt-32 border-b border-line py-14 md:py-20">
          <div className="shell">
            <div className="border-t border-line pt-6">
              <p className="kicker">05 — Memorable moments</p>
              <h2 className="display mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] text-soft">
                Moments that stayed
              </h2>
            </div>

            <div className="mt-9 space-y-10 md:space-y-14">
              {game.moments.map((moment, index) => (
                <article
                  key={moment.id}
                  className={cn(
                    "grid gap-6 border-t border-line pt-7 md:gap-10 lg:grid-cols-12",
                  )}
                >
                  {moment.image_url && (
                    <div
                      className={cn(
                        "lg:col-span-5",
                        index % 2 === 1 && "lg:order-2",
                      )}
                    >
                      <div className="frame border border-line">
                        <ArchiveImage
                          src={moment.image_url}
                          alt={moment.title}
                          fallbackLabel={moment.title}
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="aspect-[16/10] w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      moment.image_url ? "lg:col-span-7" : "lg:col-span-12",
                      index % 2 === 1 && moment.image_url && "lg:order-1",
                    )}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-lg leading-none text-blood">
                        {pad(index + 1)}
                      </span>
                      <h3 className="font-serif text-[1.65rem] leading-tight text-soft md:text-[1.9rem]">
                        {moment.title}
                      </h3>
                    </div>

                    {moment.description && (
                      <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-silver">
                        {moment.description}
                      </p>
                    )}

                    {moment.why_memorable && (
                      <div className="mt-5 border-l-2 border-blood pl-5">
                        <p className="kicker text-blood/80">Why it is memorable</p>
                        <p className="mt-2 font-serif text-[1.1rem] italic leading-relaxed text-soft/90">
                          {moment.why_memorable}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 · Review ───────────────────────────────────────────── */}
      {game.reviews.length > 0 && (
        <section id="review" className="scroll-mt-32 border-b border-line py-14 md:py-20">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <p className="kicker">06 — Review</p>
                <h2 className="display mt-4 text-[clamp(1.8rem,3.2vw,2.5rem)] text-soft">
                  How it plays, looks and sounds
                </h2>
                <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-muted">
                  Scored by hand, category by category. The numbers matter less than the sentences
                  beside them.
                </p>

                <div className="mt-7 flex items-baseline gap-2 border-t border-line pt-4">
                  <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted">
                    Overall
                  </span>
                  <span className="ml-auto font-serif text-[2.2rem] leading-none text-soft">
                    {game.rating === null ? "—" : formatRating(game.rating)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-muted">/10</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-line">
                {game.reviews.map((review) => (
                  <div key={review.id} className="border-b border-line py-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-soft">
                        {review.label}
                      </h3>
                      <span className="font-serif text-[1.35rem] leading-none text-soft">
                        {review.score === null ? "—" : formatRating(review.score)}
                      </span>
                    </div>

                    <div className="mt-3 h-px w-full bg-line">
                      <div
                        className="h-px bg-soft/60"
                        style={{ width: `${review.score === null ? 0 : (review.score / 10) * 100}%` }}
                      />
                    </div>

                    {review.body && (
                      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-silver">
                        {review.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 07 · Verdict ──────────────────────────────────────────── */}
      <section id="verdict" className="scroll-mt-32 border-b border-line bg-[#0a0b0e] py-14 md:py-20">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="kicker">07 — Final verdict</p>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-[clamp(4rem,8vw,6.5rem)] leading-[0.8] text-soft">
                {game.rating === null ? "—" : formatRating(game.rating)}
              </span>
              <div className="pb-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">out of 10</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-silver">
                  {GAME_STATUS_LABELS[game.status]}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { label: "Recommendation", value: game.recommendation },
                { label: "Would I replay it?", value: game.replay_recommendation },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="border-t border-line pt-3">
                    <p className="kicker">{item.label}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-silver">{item.value}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {game.final_verdict && (
              <p className="font-serif text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.45] text-soft/95">
                {game.final_verdict}
              </p>
            )}

            <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {[
                { label: "Best aspect", value: game.best_aspect },
                { label: "Biggest weakness", value: game.biggest_weakness },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="border-t border-line pt-3">
                    <p className="kicker">{item.label}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-silver">{item.value}</p>
                  </div>
                ))}
            </div>

            <Link href="/collection" className="link-quiet mt-8">
              Back to the collection
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 08 · Related ──────────────────────────────────────────── */}
      <section id="related" className="scroll-mt-32 py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
            <div>
              <p className="kicker">08 — Related files</p>
              <h2 className="display mt-4 text-[clamp(1.7rem,3vw,2.3rem)] text-soft">
                If this one stayed, these might too
              </h2>
            </div>
            <Link href="/collection" className="link-quiet">
              The whole collection
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {game.related.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {game.related.map((item) => (
                <GameCoverCard
                  key={item.id}
                  game={{
                    id: item.id,
                    slug: item.slug,
                    title: item.title,
                    cover_url: item.cover_url,
                    status: item.status,
                    rating: item.rating,
                    release_year: item.release_year,
                    genres: [],
                    platforms: [],
                    summary: null,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-[13px] text-muted">
              No related files linked yet —{" "}
              <Link href="/collection" className="underline underline-offset-4 hover:text-soft">
                browse the collection
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
