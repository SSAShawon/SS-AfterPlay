import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { EmptyState, PageHeader } from "@/components/public/primitives";
import { searchArchive } from "@/lib/queries/search";
import { formatDate, pad } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every game, character, chapter, memory and essay in the SS Afterplay archive.",
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const term = (params.q ?? "").trim();
  const results = term.length >= 2 ? await searchArchive(term) : null;

  const total = results
    ? results.games.length +
      results.posts.length +
      results.characters.length +
      results.chapters.length +
      results.memories.length
    : 0;

  return (
    <>
      <PageHeader
        kicker="Search"
        title={term ? `Results for “${term}”` : "Search the archive"}
        intro={
          term
            ? `${total} ${total === 1 ? "match" : "matches"} across games, characters, chapters, memories and essays.`
            : "Search game titles, storylines, characters, chapter names, memories and journal entries."
        }
      />

      <section className="shell py-14 md:py-20">
        <form action="/search" className="mb-12 flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={term}
            placeholder="Try “Red Dead”, “Ellie”, “Erdtree”…"
            aria-label="Search"
            className="h-12 flex-1 border border-white/15 bg-white/[0.02] px-4 font-serif text-lg text-soft placeholder:text-silver/35 focus:border-blood/60 focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 border border-white/20 px-8 font-mono text-[10px] uppercase tracking-[0.22em] text-soft transition-colors hover:border-blood/60 hover:bg-blood/[0.06]"
          >
            Search
          </button>
        </form>

        {!term && (
          <EmptyState
            title="Start typing to search."
            description="The archive searches games, journal entries, characters, chapter titles and memories."
          />
        )}

        {term && total === 0 && (
          <EmptyState
            title={`Nothing matches “${term}”.`}
            description="Try a shorter term, a character name, or a chapter title."
            action={{ href: "/collection", label: "Browse the collection instead" }}
          />
        )}

        {results && total > 0 && (
          <div className="space-y-14">
            {results.games.length > 0 && (
              <Group index={1} label="Games">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="group flex items-center gap-4 border border-white/10 bg-white/[0.015] p-3 transition-colors hover:border-blood/40"
                    >
                      <ArchiveImage
                        src={game.cover_url}
                        alt={game.title}
                        fallbackLabel={game.title}
                        className="aspect-[3/4] w-14 shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg text-soft">{game.title}</p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/45">
                          {[game.release_year, game.status].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Group>
            )}

            {results.posts.length > 0 && (
              <Group index={2} label="Journal">
                <div>
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/journal/${post.slug}`}
                      className="group flex items-baseline justify-between gap-6 border-b border-white/[0.07] py-4 transition-colors hover:border-blood/40"
                    >
                      <span className="font-serif text-xl text-soft">{post.title}</span>
                      <span className="hidden max-w-sm truncate text-right text-xs text-silver/50 sm:block">
                        {post.excerpt}
                      </span>
                    </Link>
                  ))}
                </div>
              </Group>
            )}

            {results.characters.length > 0 && (
              <Group index={3} label="Characters">
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.characters.map((character) => (
                    <Link
                      key={character.id}
                      href={`/games/${character.game_slug}#characters`}
                      className="group flex items-center justify-between gap-4 border border-white/10 p-4 transition-colors hover:border-blood/40"
                    >
                      <div>
                        <p className="font-serif text-lg text-soft">{character.name}</p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/45">
                          {character.game_title}
                          {character.role ? ` · ${character.role}` : ""}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-silver/30 group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </Group>
            )}

            {results.chapters.length > 0 && (
              <Group index={4} label="Chapters">
                <div>
                  {results.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/games/${chapter.game_slug}#chapters`}
                      className="group flex items-baseline justify-between gap-6 border-b border-white/[0.07] py-3.5 transition-colors hover:border-blood/40"
                    >
                      <span className="font-serif text-lg text-soft">{chapter.title}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
                        {chapter.game_title}
                      </span>
                    </Link>
                  ))}
                </div>
              </Group>
            )}

            {results.memories.length > 0 && (
              <Group index={5} label="Memories">
                <div>
                  {results.memories.map((memory) => (
                    <Link
                      key={memory.id}
                      href="/memories"
                      className="group flex items-baseline justify-between gap-6 border-b border-white/[0.07] py-3.5 transition-colors hover:border-blood/40"
                    >
                      <span className="font-serif text-lg text-soft">{memory.title}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
                        {formatDate(memory.occurred_on, "short") ?? "Memory"}
                      </span>
                    </Link>
                  ))}
                </div>
              </Group>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function Group({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
        <span className="font-mono text-[10px] text-blood/80">{pad(index)}</span>
        <span className="eyebrow">{label}</span>
      </div>
      {children}
    </section>
  );
}
