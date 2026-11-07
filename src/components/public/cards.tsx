import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { MetaRow, Rating, StatusBadge } from "@/components/public/primitives";
import { formatDate, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS, type GameCardData, type JournalPostWithCategory, type MemoryWithGame } from "@/lib/types";

export function GameCoverCard({
  game,
  index,
  priority,
}: {
  game: GameCardData;
  index?: number;
  priority?: boolean;
}) {
  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="relative overflow-hidden border border-white/10 transition-colors duration-500 group-hover:border-blood/40">
        <ArchiveImage
          src={game.cover_url}
          alt={`${game.title} cover art`}
          fallbackLabel={game.title}
          priority={priority}
          className="aspect-[3/4] w-full"
          imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <StatusBadge status={game.status} />
            <ArrowUpRight className="size-4 text-soft" />
          </div>
        </div>
        {index !== undefined && (
          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.2em] text-soft/70">
            {pad(index)}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg leading-tight text-soft transition-colors group-hover:text-white">
            {game.title}
          </h3>
          <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-silver/50">
            {[game.release_year, game.genres?.[0]].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Rating value={game.rating} className="shrink-0 pt-1" />
      </div>
    </Link>
  );
}

export function GameListRow({ game, index }: { game: GameCardData; index: number }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/[0.07] py-4 transition-colors hover:border-blood/40 md:grid-cols-[auto_84px_1fr_auto_auto] md:gap-6"
    >
      <span className="font-mono text-[10px] text-silver/35 transition-colors group-hover:text-blood/70">
        {pad(index + 1)}
      </span>
      <ArchiveImage
        src={game.cover_url}
        alt={game.title}
        fallbackLabel={game.title}
        className="hidden aspect-[3/4] w-[84px] border border-white/10 md:block"
      />
      <div className="min-w-0">
        <h3 className="truncate font-serif text-xl text-soft transition-colors group-hover:text-white md:text-2xl">
          {game.title}
        </h3>
        <p className="mt-1.5 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-silver/45 md:block">
          {[game.release_year, game.genres?.slice(0, 2).join(", "), game.platforms?.[0]]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="hidden md:block">
        <StatusBadge status={game.status} />
      </div>
      <div className="flex items-center gap-4">
        <Rating value={game.rating} />
        <ArrowUpRight className="size-4 text-silver/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-soft" />
      </div>
    </Link>
  );
}

export function JournalCard({
  post,
  featured = false,
}: {
  post: JournalPostWithCategory;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Link
        href={`/journal/${post.slug}`}
        className="group grid gap-6 border border-white/10 bg-charcoal/40 p-4 transition-colors hover:border-blood/40 md:grid-cols-[1.05fr_1fr] md:p-6"
      >
        <ArchiveImage
          src={post.cover_url}
          alt={post.title}
          fallbackLabel={post.title}
          className="aspect-[16/10] w-full"
          imgClassName="transition-transform duration-[1400ms] group-hover:scale-[1.03]"
        />
        <div className="flex flex-col justify-between gap-6 p-1 md:p-3">
          <div>
            <MetaRow items={[post.journal_categories?.name, formatDate(post.published_at), `${post.reading_minutes ?? 5} min read`]} />
            <h3 className="display mt-4 text-[clamp(1.6rem,3vw,2.6rem)] text-soft transition-colors group-hover:text-white">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-silver/75">{post.excerpt}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-silver transition-colors group-hover:text-soft">
            Read essay <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group grid gap-4 border-b border-white/[0.07] py-6 transition-colors hover:border-blood/40 sm:grid-cols-[180px_1fr] sm:gap-6"
    >
      <ArchiveImage
        src={post.cover_url}
        alt={post.title}
        fallbackLabel={post.title}
        className="aspect-[16/10] w-full border border-white/10"
      />
      <div className="flex flex-col justify-between gap-3">
        <div>
          <MetaRow
            items={[
              post.journal_categories?.name,
              formatDate(post.published_at),
              `${post.reading_minutes ?? 5} min read`,
            ]}
          />
          <h3 className="mt-2 font-serif text-2xl leading-tight text-soft transition-colors group-hover:text-white">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-silver/70">{post.excerpt}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-silver/60 transition-colors group-hover:text-blood">
          Read <ArrowUpRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}

export function MemoryCard({ memory, index }: { memory: MemoryWithGame; index?: number }) {
  const when = memory.timeframe ?? formatDate(memory.occurred_on, "short");

  return (
    <article className="group grid gap-6 border border-white/10 bg-white/[0.015] p-5 transition-colors hover:border-blood/35 md:grid-cols-[220px_1fr] md:p-6">
      <ArchiveImage
        src={memory.image_url ?? memory.games?.cover_url ?? null}
        alt={memory.title}
        fallbackLabel={memory.title}
        className="aspect-[4/3] w-full border border-white/10"
      />
      <div className="flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {index !== undefined && (
              <span className="font-mono text-[10px] text-blood/80">{pad(index)}</span>
            )}
            <MetaRow items={[when, memory.games?.title]} />
          </div>
          <h3 className="display mt-3 text-2xl text-soft transition-colors group-hover:text-white md:text-3xl">
            {memory.title}
          </h3>
          {memory.description && (
            <p className="mt-3 text-sm leading-relaxed text-silver/75">{memory.description}</p>
          )}
        </div>
        {memory.games && (
          <Link
            href={`/games/${memory.games.slug}`}
            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-silver/60 transition-colors hover:text-blood"
          >
            View archive entry <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function StatusLegend() {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/40">
      {Object.values(GAME_STATUS_LABELS).join(" · ")}
    </p>
  );
}
