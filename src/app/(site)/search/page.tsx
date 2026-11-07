import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { ArchiveImage } from "@/components/public/archive-image";
import { EmptyState } from "@/components/public/primitives";
import { searchArchive } from "@/lib/queries/search";
import { formatDate } from "@/lib/utils";

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
      <header className="border-b border-line pb-10 pt-32 md:pb-12 md:pt-40">
        <div className="shell">
          <div className="flex items-center gap-3">
            <span className="archivedot" aria-hidden />
            <p className="kicker">Search</p>
          </div>

          <h1 className="display mt-6 max-w-[20ch] text-[clamp(2.2rem,5vw,3.8rem)] text-soft">
            {term ? `Results for “${term}”` : "Search the archive"}
          </h1>

          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-silver">
            {term
              ? `${total} ${total === 1 ? "match" : "matches"} across games, characters, chapters, memories and essays.`
              : "Search game titles, storylines, characters, chapter names, memories and journal entries."}
          </p>

          <form action="/search" className="mt-8 flex max-w-2xl items-end gap-4" role="search">
            <label className="flex h-11 flex-1 items-center border-b border-line-strong focus-within:border-soft">
              <Search className="size-4 text-muted" />
              <input
                name="q"
                defaultValue={term}
                placeholder="Try “Red Dead”, “Ellie”, “Erdtree”…"
                aria-label="Search"
                className="h-full w-full bg-transparent pl-3 font-serif text-[1.15rem] text-soft placeholder:text-muted/70 focus:outline-none"
              />
            </label>
            <button type="submit" className="btn h-11">
              Search
            </button>
          </form>
        </div>
      </header>

      <section className="shell py-10 md:py-14">
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
          <div className="space-y-12">
            {results.games.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="kicker">Games</h2>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(results.games.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  {results.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="group flex items-center gap-5 border-b border-line py-4"
                    >
                      <ArchiveImage
                        src={game.cover_url}
                        alt={game.title}
                        fallbackLabel={game.title}
                        sizes="48px"
                        className="aspect-[3/4] w-10 shrink-0 border border-line"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-serif text-[1.3rem] leading-tight text-soft transition-colors group-hover:text-white">
                          {game.title}
                        </h3>
                        <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-muted">
                          {[game.release_year, game.status?.replace("_", " ")].filter(Boolean).join(" / ")}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.posts.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="kicker">Journal</h2>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(results.posts.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/journal/${post.slug}`}
                      className="group flex items-center gap-5 border-b border-line py-4"
                    >
                      <ArchiveImage
                        src={post.cover_url}
                        alt={post.title}
                        fallbackLabel={post.title}
                        sizes="64px"
                        className="aspect-[4/3] w-16 shrink-0 border border-line"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-serif text-[1.3rem] leading-tight text-soft transition-colors group-hover:text-white">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-1 line-clamp-1 text-[12px] text-silver">{post.excerpt}</p>
                        )}
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.characters.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="kicker">Characters</h2>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(results.characters.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  {results.characters.map((character) => (
                    <Link
                      key={character.id}
                      href={`/games/${character.game_slug}#characters`}
                      className="group flex items-center gap-5 border-b border-line py-4"
                    >
                      <ArchiveImage
                        src={character.portrait_url}
                        alt={character.name}
                        fallbackLabel={character.name}
                        sizes="40px"
                        className="aspect-[3/4] w-10 shrink-0 border border-line"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-serif text-[1.3rem] leading-tight text-soft transition-colors group-hover:text-white">
                          {character.name}
                        </h3>
                        <p className="mt-1 truncate text-[9.5px] uppercase tracking-[0.14em] text-muted">
                          {[character.game_title, character.role].filter(Boolean).join(" / ")}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.chapters.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="kicker">Storyline & chapters</h2>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(results.chapters.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  {results.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/games/${chapter.game_slug}#chapters`}
                      className="group flex items-center justify-between gap-5 border-b border-line py-4"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-[1.2rem] leading-tight text-soft transition-colors group-hover:text-white">
                          {chapter.title}
                        </h3>
                        <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-muted">
                          {chapter.game_title}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.memories.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h2 className="kicker">Memories</h2>
                  <span className="text-[10px] tabular-nums text-muted">
                    {String(results.memories.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  {results.memories.map((memory) => (
                    <Link
                      key={memory.id}
                      href="/memories"
                      className="group flex items-center justify-between gap-5 border-b border-line py-4"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-[1.2rem] leading-tight text-soft transition-colors group-hover:text-white">
                          {memory.title}
                        </h3>
                        <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-muted">
                          {formatDate(memory.occurred_on, "short") ?? "Memory"}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted transition-colors group-hover:text-soft" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </>
  );
}
