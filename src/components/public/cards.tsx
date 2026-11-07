import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { MetaRow, Rating, StatusBadge } from "@/components/public/primitives";
import { formatDate, pad } from "@/lib/utils";
import type {
  GameCardData,
  JournalPostWithCategory,
  MemoryWithGame,
} from "@/lib/types";

const NOUNS = ["cover", "art"];

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
      <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
        <ArchiveImage
          src={game.cover_url}
          alt={`${game.title} ${NOUNS.join(" ")}`}
          fallbackLabel={game.title}
          priority={priority}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          className="aspect-[3/4] w-full"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 border-t border-line pt-2.5">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-[1.15rem] leading-tight text-soft transition-colors duration-200 group-hover:text-white">
            {game.title}
          </h3>
          <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            {[game.release_year, game.genres?.[0]].filter(Boolean).join(" / ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Rating value={game.rating} />
          {index !== undefined && (
            <span className="text-[9px] tabular-nums tracking-[0.1em] text-muted/70">{pad(index)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function GameListRow({ game, index }: { game: GameCardData; index: number }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-line py-3.5 transition-colors duration-200 hover:border-line-strong md:grid-cols-[2.5rem_3.25rem_1fr_auto_auto_1.5rem] md:gap-6"
    >
      <span className="text-[10px] tabular-nums tracking-[0.1em] text-muted/70">
        {pad(index + 1)}
      </span>

      <ArchiveImage
        src={game.cover_url}
        alt={`${game.title} cover`}
        fallbackLabel={game.title}
        sizes="52px"
        className="hidden aspect-[3/4] w-[3.25rem] border border-line md:block"
      />

      <div className="min-w-0">
        <h3 className="truncate font-serif text-xl leading-tight text-soft transition-colors duration-200 group-hover:text-white md:text-[1.4rem]">
          {game.title}
        </h3>
        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          {[game.release_year, game.genres?.slice(0, 2).join(", "), game.platforms?.[0]]
            .filter(Boolean)
            .join(" / ")}
        </p>
      </div>

      <div className="hidden md:block">
        <StatusBadge status={game.status} />
      </div>

      <Rating value={game.rating} />

      <ArrowUpRight className="size-3.5 text-muted transition-colors duration-200 group-hover:text-soft" />
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
  const category = post.journal_categories?.name ?? "Essay";
  const date = formatDate(post.published_at, "short");

  if (featured) {
    return (
      <Link href={`/journal/${post.slug}`} className="group block">
        <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
          <ArchiveImage
            src={post.cover_url}
            alt={post.title}
            fallbackLabel={post.title}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="aspect-[16/10] w-full"
          />
        </div>

        <div className="mt-5">
          <MetaRow items={[category, date, `${post.reading_minutes ?? 5} min read`]} />
          <h3 className="display mt-3 text-[clamp(1.7rem,3.2vw,2.6rem)] text-soft transition-colors duration-200 group-hover:text-white">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-silver">{post.excerpt}</p>
          )}
          <span className="link-quiet mt-5">
            Read the essay
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group grid grid-cols-[1fr_5.5rem] items-start gap-5 border-b border-line py-5 transition-colors duration-200 hover:border-line-strong sm:grid-cols-[1fr_7.5rem]"
    >
      <div className="min-w-0">
        <MetaRow items={[category, date]} />
        <h3 className="mt-2 font-serif text-[1.3rem] leading-snug text-soft transition-colors duration-200 group-hover:text-white">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-silver/85">{post.excerpt}</p>
        )}
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          {post.reading_minutes ?? 5} min read
        </p>
      </div>

      <ArchiveImage
        src={post.cover_url}
        alt={post.title}
        fallbackLabel={post.title}
        sizes="120px"
        className="aspect-[4/3] w-full border border-line"
      />
    </Link>
  );
}

export function MemoryCard({ memory, index }: { memory: MemoryWithGame; index: number }) {
  const meta = [memory.timeframe ?? formatDate(memory.occurred_on, "short"), memory.games?.title];

  return (
    <article className="group grid gap-5 border-b border-line py-6 last:border-b-0 md:grid-cols-[1.15fr_1fr] md:items-start md:gap-10 md:py-8">
      <Link href={memory.games ? `/games/${memory.games.slug}` : "/memories"} className="block">
        <div className="frame border border-line transition-colors duration-200 group-hover:border-line-strong">
          <ArchiveImage
            src={memory.image_url ?? memory.games?.cover_url ?? null}
            alt={memory.title}
            fallbackLabel={memory.title}
            sizes="(max-width: 768px) 100vw, 45vw"
            className="aspect-[16/10] w-full"
          />
        </div>
      </Link>

      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg leading-none text-blood">{pad(index)}</span>
            <MetaRow items={meta} />
          </div>
          <h3 className="mt-3 font-serif text-[1.6rem] leading-tight text-soft md:text-[1.9rem]">
            {memory.title}
          </h3>
          {memory.description && (
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-silver">
              {memory.description}
            </p>
          )}
        </div>

        {memory.games && (
          <Link href={`/games/${memory.games.slug}`} className="link-quiet mt-6">
            Open the game file
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
