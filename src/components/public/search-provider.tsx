"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowUpRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { searchAction } from "@/lib/actions/search";
import type { SearchResultGroup } from "@/lib/types";

type SearchContextValue = {
  open: () => void;
  close: () => void;
};

const SearchContext = React.createContext<SearchContextValue | null>(null);

export function useSearchOverlay() {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error("useSearchOverlay must be used inside SearchProvider");
  return context;
}

const EMPTY: SearchResultGroup = {
  games: [],
  posts: [],
  characters: [],
  memories: [],
  chapters: [],
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<SearchResultGroup>(EMPTY);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const query = term.trim();
    if (query.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchAction(query);
        setResults(data);
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [term, isOpen]);

  const total =
    results.games.length +
    results.posts.length +
    results.characters.length +
    results.memories.length +
    results.chapters.length;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <SearchContext.Provider value={{ open, close }}>
      {children}

      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-[110] flex flex-col bg-void transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="shell flex h-[62px] items-center justify-between border-b border-line">
          <span className="kicker">Search the archive</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-silver transition-colors hover:text-soft"
          >
            Close <X className="size-3.5" />
          </button>
        </div>

        <div className="shell w-full flex-1 overflow-y-auto pb-16 pt-10 md:pt-16">
          <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
            <div className="flex items-center gap-4 border-b border-line-strong pb-4">
              <Search className="size-5 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Games, characters, chapters, memories, essays…"
                className="w-full bg-transparent font-serif text-[1.7rem] text-soft placeholder:text-muted/70 focus:outline-none md:text-[2.1rem]"
                aria-label="Search the archive"
              />
              {loading && <Loader2 className="size-4 animate-spin text-muted" />}
            </div>
          </form>

          <div className="mx-auto mt-10 w-full max-w-3xl">
            {term.trim().length < 2 && (
              <div className="space-y-3">
                <p className="kicker">Try</p>
                <div className="flex flex-wrap gap-2">
                  {["Red Dead Redemption", "Ellie", "Erdtree", "Silent Hill", "endings"].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTerm(suggestion)}
                      className="border border-line px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-silver transition-colors hover:border-line-strong hover:text-soft"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {term.trim().length >= 2 && !loading && total === 0 && (
              <div className="border-t border-line py-8">
                <p className="font-serif text-2xl text-soft">Nothing in the archive matches “{term}”.</p>
                <p className="mt-2 text-[13px] text-silver">
                  Try a game title, a character, or a chapter name.
                </p>
              </div>
            )}

            {results.games.length > 0 && (
              <ResultGroup label="Games">
                {results.games.map((game) => (
                  <ResultLink
                    key={game.id}
                    href={`/games/${game.slug}`}
                    title={game.title}
                    meta={[game.release_year, game.status].filter(Boolean).join(" · ")}
                    onNavigate={close}
                  />
                ))}
              </ResultGroup>
            )}

            {results.posts.length > 0 && (
              <ResultGroup label="Journal">
                {results.posts.map((post) => (
                  <ResultLink
                    key={post.id}
                    href={`/journal/${post.slug}`}
                    title={post.title}
                    meta={post.excerpt ?? "Essay"}
                    onNavigate={close}
                  />
                ))}
              </ResultGroup>
            )}

            {results.characters.length > 0 && (
              <ResultGroup label="Characters">
                {results.characters.map((character) => (
                  <ResultLink
                    key={character.id}
                    href={`/games/${character.game_slug}#characters`}
                    title={character.name}
                    meta={[character.role, character.game_title].filter(Boolean).join(" · ")}
                    onNavigate={close}
                  />
                ))}
              </ResultGroup>
            )}

            {results.chapters.length > 0 && (
              <ResultGroup label="Chapters">
                {results.chapters.map((chapter) => (
                  <ResultLink
                    key={chapter.id}
                    href={`/games/${chapter.game_slug}#chapters`}
                    title={chapter.title}
                    meta={chapter.game_title}
                    onNavigate={close}
                  />
                ))}
              </ResultGroup>
            )}

            {results.memories.length > 0 && (
              <ResultGroup label="Memories">
                {results.memories.map((memory) => (
                  <ResultLink
                    key={memory.id}
                    href="/memories"
                    title={memory.title}
                    meta={memory.description ?? "Memory"}
                    onNavigate={close}
                  />
                ))}
              </ResultGroup>
            )}

            {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  close();
                  router.push(`/search?q=${encodeURIComponent(term.trim())}`);
                }}
                className="mt-10 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-blood transition-opacity hover:opacity-80"
              >
                View all results <ArrowUpRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="kicker border-b border-line pb-2">{label}</h2>
      <ul className="mt-1">{children}</ul>
    </section>
  );
}

function ResultLink({
  href,
  title,
  meta,
  onNavigate,
}: {
  href: string;
  title: string;
  meta?: string | null;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="group flex items-baseline justify-between gap-6 border-b border-line py-3.5 transition-colors hover:border-line-strong"
      >
        <span className="font-serif text-xl text-soft transition-colors group-hover:text-white">
          {title}
        </span>
        {meta && (
          <span className="line-clamp-1 text-right text-[11px] text-muted">{meta}</span>
        )}
      </Link>
    </li>
  );
}
