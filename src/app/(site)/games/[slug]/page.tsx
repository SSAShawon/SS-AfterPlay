import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Quote, Star } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { GameCoverCard } from "@/components/public/cards";
import { GameSectionNav, type NavSection } from "@/components/public/game-section-nav";
import { Markdown } from "@/components/public/markdown";
import { MetaRow, Rating, StatusBadge } from "@/components/public/primitives";
import { RatingDial, ScoreBar } from "@/components/public/score";
import { ReadingProgress } from "@/components/public/reading-progress";
import { Reveal } from "@/components/public/reveal";
import { SpoilerGate } from "@/components/public/spoiler-gate";
import { getGameBySlug } from "@/lib/queries/games";
import { formatDate, formatRating, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return { title: "Entry not found" };
  }

  const description =
    game.summary ??
    `${game.title} — full archive entry: storyline, chapters, characters, memorable moments and personal verdict.`;

  return {
    title: `${game.title} — Archive file`,
    description,
    openGraph: {
      title: `${game.title} — SS AFTERPLAY`,
      description,
      type: "article",
      images: game.hero_url ? [{ url: game.hero_url }] : game.cover_url ? [{ url: game.cover_url }] : undefined,
    },
  };
}

function Section({
  id,
  index,
  label,
  title,
  aside,
  children,
  tone = "default",
}: {
  id: string;
  index: number;
  label: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-32 border-b border-white/10 py-16 md:py-24 ${
        tone === "muted" ? "bg-white/[0.012]" : ""
      }`}
    >
      <div className="shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-blood/80">{pad(index)}</span>
              <span className="h-px w-8 bg-white/20" />
              <span className="eyebrow">{label}</span>
            </div>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3.1rem)] text-soft">{title}</h2>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) notFound();

  const sections: NavSection[] = [
    { id: "overview", label: "Overview" },
    ...(game.storyline ? [{ id: "storyline", label: "Storyline" }] : []),
    ...(game.chapters.length ? [{ id: "chapters", label: "Chapters" }] : []),
    ...(game.characters.length ? [{ id: "characters", label: "Characters" }] : []),
    ...(game.moments.length ? [{ id: "moments", label: "Moments" }] : []),
    ...(game.reviews.length ? [{ id: "review", label: "Craft" }] : []),
    { id: "verdict", label: "Verdict" },
    ...(game.related.length ? [{ id: "related", label: "Related" }] : []),
  ];

  return (
    <>
      <ReadingProgress />

      {/* 01 — cinematic cover */}
      <section className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <ArchiveImage
            src={game.hero_url ?? game.cover_url}
            alt={`${game.title} artwork`}
            fallbackLabel={game.title}
            priority
            className="size-full"
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_10%,rgba(8,9,12,0.25),rgba(8,9,12,0.8)_65%,#08090C_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/20" />
          <div className="absolute inset-0 grain" />
        </div>

        <div className="shell relative w-full pb-10 pt-32 md:pb-14">
          <Link
            href="/collection"
            className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-silver/60 transition-colors hover:text-soft"
          >
            <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-1" />
            Back to collection
          </Link>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <MetaRow
                items={[
                  "Archive file",
                  game.release_year,
                  game.developer,
                  game.genres?.[0],
                ]}
              />
              <h1 className="display mt-4 text-[clamp(2.6rem,7vw,6rem)] text-soft text-shadow-cinema">
                {game.title}
              </h1>
              {game.tagline && (
                <p className="mt-3 font-serif text-xl italic text-silver/75 md:text-2xl">
                  {game.tagline}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <StatusBadge status={game.status} />
                {game.platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="border border-white/12 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.18em] text-silver/60"
                  >
                    {platform}
                  </span>
                ))}
                {game.playtime_hours ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-silver/50">
                    <Clock className="size-3" /> {game.playtime_hours}h logged
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div className="hidden text-right md:block">
                <p className="eyebrow">Personal rating</p>
                <p className="mt-2 font-serif text-5xl leading-none text-soft">
                  {formatRating(game.rating)}
                  <span className="font-sans text-sm text-silver/40">/10</span>
                </p>
              </div>
              <div className="md:hidden">
                <RatingDial value={game.rating} size={104} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <GameSectionNav sections={sections} />

      {/* spec strip */}
      <section className="border-b border-white/10 bg-[#0a0b0e]">
        <div className="shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-8">
          {[
            { label: "Developer", value: game.developer },
            { label: "Publisher", value: game.publisher },
            { label: "Released", value: game.release_year ? String(game.release_year) : null },
            { label: "Genre", value: game.genres?.join(", ") || null },
            { label: "Platform", value: game.platforms?.join(", ") || null },
            { label: "Status", value: GAME_STATUS_LABELS[game.status] },
            { label: "Started", value: formatDate(game.started_on, "short") },
            { label: "Completed", value: formatDate(game.completed_on, "short") },
          ].map((item) => (
            <div key={item.label}>
              <p className="eyebrow">{item.label}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-soft/90">{item.value ?? "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 02 — overview */}
      <Section
        id="overview"
        index={2}
        label="Game overview"
        title="What this game is"
        aside={
          <div className="hidden shrink-0 md:block">
            <RatingDial value={game.rating} size={116} />
          </div>
        }
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {game.cover_url && (
              <div className="mb-8 flex gap-6 md:hidden">
                <ArchiveImage
                  src={game.cover_url}
                  alt={game.title}
                  fallbackLabel={game.title}
                  className="aspect-[3/4] w-32 shrink-0 border border-white/10"
                />
                <p className="self-end font-serif text-lg italic leading-relaxed text-silver/70">
                  {game.tagline}
                </p>
              </div>
            )}
            {game.summary ? (
              <Markdown content={game.summary} />
            ) : (
              <p className="text-sm text-silver/50">No overview written yet.</p>
            )}

            {game.why_archived && (
              <div className="mt-10 border-l border-blood/50 pl-5">
                <p className="eyebrow text-blood/80">Why it is in the archive</p>
                <p className="mt-3 font-serif text-xl italic leading-relaxed text-soft/90">
                  {game.why_archived}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="border border-white/10 bg-white/[0.015]">
              {[
                { label: "Setting", value: game.setting },
                { label: "Gameplay type", value: game.gameplay_type },
                { label: "Main theme", value: game.main_theme },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`p-5 ${index > 0 ? "border-t border-white/[0.07]" : ""}`}
                >
                  <p className="eyebrow">{item.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-silver/80">
                    {item.value ?? "Not documented yet."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 03 — storyline */}
      {game.storyline && (
        <Section
          id="storyline"
          index={3}
          label="Complete storyline"
          title="The whole story, start to finish"
          tone="muted"
          aside={
            <p className="max-w-[15rem] font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-silver/40">
              Contains major spoilers.
              <br />
              Reveal deliberately.
            </p>
          }
        >
          <SpoilerGate>
            <div className="max-w-3xl">
              <Markdown content={game.storyline} />
            </div>
          </SpoilerGate>
        </Section>
      )}

      {/* 04 — chapters */}
      {game.chapters.length > 0 && (
        <Section
          id="chapters"
          index={4}
          label="Chapter breakdown"
          title="Chapter by chapter"
          aside={
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/40">
              {game.chapters.length} chapters
            </span>
          }
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <nav className="lg:col-span-3" aria-label="Chapter navigation">
              <p className="eyebrow border-b border-white/10 pb-3">Chapter index</p>
              <ol className="mt-3 space-y-1">
                {game.chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <a
                      href={`#chapter-${chapter.id}`}
                      className="group flex items-baseline gap-3 border-b border-white/[0.05] py-2 text-sm text-silver/60 transition-colors hover:text-soft"
                    >
                      <span className="font-mono text-[9px] text-blood/60">
                        {pad(index + 1)}
                      </span>
                      <span className="line-clamp-1">{chapter.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-14 lg:col-span-9">
              {game.chapters.map((chapter, index) => (
                <article key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-36">
                  <div className="flex items-baseline gap-4">
                    <span className="font-serif text-4xl leading-none text-white/15">
                      {pad(index + 1)}
                    </span>
                    <div>
                      <p className="eyebrow">Chapter {index + 1}</p>
                      <h3 className="mt-1 font-serif text-2xl text-soft md:text-3xl">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-5 border-l border-white/10 pl-5 md:ml-10">
                    {chapter.summary && (
                      <p className="text-sm leading-[1.85] text-silver/85">{chapter.summary}</p>
                    )}

                    {(chapter.important_events || chapter.story_developments) && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {chapter.important_events && (
                          <div className="border border-white/10 bg-white/[0.015] p-4">
                            <p className="eyebrow text-blood/70">Important events</p>
                            <p className="mt-2 text-xs leading-relaxed text-silver/75">
                              {chapter.important_events}
                            </p>
                          </div>
                        )}
                        {chapter.story_developments && (
                          <div className="border border-white/10 bg-white/[0.015] p-4">
                            <p className="eyebrow">Story developments</p>
                            <p className="mt-2 text-xs leading-relaxed text-silver/75">
                              {chapter.story_developments}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 05 — characters */}
      {game.characters.length > 0 && (
        <Section
          id="characters"
          index={5}
          label="Characters & analysis"
          title="The people in the story"
          tone="muted"
        >
          <div className="space-y-16">
            {game.characters.map((character, index) => (
              <Reveal key={character.id}>
                <article className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <ArchiveImage
                      src={character.portrait_url}
                      alt={character.name}
                      fallbackLabel={character.name}
                      className="aspect-[3/4] w-full max-w-[280px] border border-white/10"
                    />
                  </div>

                  <div className="md:col-span-8">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-blood/70">
                        {pad(index + 1)}
                      </span>
                      <h3 className="display text-3xl text-soft md:text-4xl">{character.name}</h3>
                    </div>
                    {character.role && (
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-silver/50">
                        {character.role}
                      </p>
                    )}

                    <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                      {[
                        { label: "Personality", value: character.personality },
                        { label: "Background", value: character.background },
                        { label: "Development", value: character.development },
                      ]
                        .filter((item) => item.value)
                        .map((item) => (
                          <div key={item.label} className="border-t border-white/10 pt-3">
                            <dt className="eyebrow">{item.label}</dt>
                            <dd className="mt-2 text-xs leading-relaxed text-silver/75">{item.value}</dd>
                          </div>
                        ))}
                    </dl>

                    {character.analysis && (
                      <div className="mt-7 flex gap-4 border-l border-blood/50 pl-5">
                        <Quote className="mt-1 size-4 shrink-0 text-blood/50" />
                        <div>
                          <p className="eyebrow text-blood/70">Personal analysis</p>
                          <p className="mt-2 font-serif text-lg italic leading-relaxed text-soft/85">
                            {character.analysis}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 06 — moments */}
      {game.moments.length > 0 && (
        <Section
          id="moments"
          index={6}
          label="Best & most memorable"
          title="Moments that stayed"
        >
          <div className="space-y-10">
            {game.moments.map((moment, index) => (
              <Reveal key={moment.id}>
                <article
                  className={`grid gap-8 border border-white/10 bg-white/[0.015] p-5 md:p-7 ${
                    moment.image_url ? "md:grid-cols-12" : ""
                  }`}
                >
                  {moment.image_url && (
                    <div className="md:col-span-5">
                      <ArchiveImage
                        src={moment.image_url}
                        alt={moment.title}
                        fallbackLabel={moment.title}
                        className="aspect-[16/10] w-full border border-white/10"
                      />
                    </div>
                  )}
                  <div className={moment.image_url ? "md:col-span-7" : ""}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-blood/70">{pad(index + 1)}</span>
                      <span className="h-px w-6 bg-white/20" />
                      <span className="eyebrow">Moment</span>
                    </div>
                    <h3 className="display mt-3 text-2xl text-soft md:text-3xl">{moment.title}</h3>
                    {moment.description && (
                      <p className="mt-3 text-sm leading-relaxed text-silver/80">
                        {moment.description}
                      </p>
                    )}
                    {moment.why_memorable && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="eyebrow text-blood/70">Why it is memorable</p>
                        <p className="mt-2 font-serif text-lg italic leading-relaxed text-soft/85">
                          {moment.why_memorable}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 07 — craft */}
      {game.reviews.length > 0 && (
        <Section
          id="review"
          index={7}
          label="Gameplay & technical review"
          title="How it plays, looks and sounds"
          tone="muted"
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="border-t border-white/[0.07]">
                {game.reviews.map((review) => (
                  <div key={review.id}>
                    <ScoreBar label={review.label} score={review.score} />
                    {review.body && (
                      <p className="-mt-1 pb-5 text-sm leading-relaxed text-silver/75">{review.body}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="border border-white/10 bg-void/60 p-6">
                <p className="eyebrow">Craft average</p>
                <p className="mt-2 font-serif text-4xl text-soft">
                  {formatRating(
                    Math.round(
                      (game.reviews.reduce((total, review) => total + Number(review.score ?? 0), 0) /
                        game.reviews.length) *
                        10,
                    ) / 10,
                  )}
                  <span className="font-sans text-sm text-silver/40">/10</span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-silver/50">
                  Averaged across {game.reviews.length} documented criteria. The personal verdict
                  below is the number that counts.
                </p>
              </div>
            </aside>
          </div>
        </Section>
      )}

      {/* 08 — verdict */}
      <Section
        id="verdict"
        index={8}
        label="Final verdict"
        title="Would I recommend it?"
        tone="muted"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex flex-col items-start gap-6 border border-white/10 bg-void/50 p-7">
              <RatingDial value={game.rating} />
              <div>
                <p className="eyebrow">Overall rating</p>
                <p className="mt-2 font-serif text-2xl text-soft">
                  {game.rating && game.rating >= 9
                    ? "Essential"
                    : game.rating && game.rating >= 8
                      ? "Highly recommended"
                      : game.rating && game.rating >= 7
                        ? "Worth your time"
                        : game.rating
                          ? "For the curious"
                          : "Unrated"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-3.5 ${
                      game.rating && game.rating >= star * 2
                        ? "fill-blood text-blood"
                        : "text-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <dl className="grid gap-6 sm:grid-cols-2">
              {[
                { label: "Best aspect", value: game.best_aspect },
                { label: "Biggest weakness", value: game.biggest_weakness },
                { label: "Recommendation", value: game.recommendation },
                { label: "Replay value", value: game.replay_recommendation },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="border-t border-white/10 pt-4">
                    <dt className="eyebrow">{item.label}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-silver/80">{item.value}</dd>
                  </div>
                ))}
            </dl>

            {game.final_verdict && (
              <div className="mt-8">
                <Markdown content={game.final_verdict} />
              </div>
            )}

            {game.why_archived && (
              <div className="mt-8 border-l border-blood/50 pl-5">
                <p className="eyebrow text-blood/80">Final word</p>
                <p className="mt-3 font-serif text-xl italic leading-relaxed text-soft/90">
                  {game.why_archived}
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 09 — related */}
      {game.related.length > 0 && (
        <Section id="related" index={9} label="Related games" title="Keep reading the archive">
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {game.related.map((related) => (
              <GameCoverCard
                key={related.id}
                game={{
                  id: related.id,
                  slug: related.slug,
                  title: related.title,
                  cover_url: related.cover_url,
                  status: related.status,
                  rating: related.rating,
                  release_year: related.release_year,
                  genres: [],
                  platforms: [],
                  summary: null,
                }}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/collection"
              className="group inline-flex items-center gap-3 border border-white/15 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-soft transition-colors hover:border-blood/60 hover:bg-blood/[0.06]"
            >
              All archive entries
              <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Rating value={game.rating} className="ml-2" />
          </div>
        </Section>
      )}
    </>
  );
}
