"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { GAME_STATUSES, GAME_STATUS_LABELS } from "@/lib/types";

interface CollectionFiltersProps {
  genres: string[];
  total: number;
}

const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "rating", label: "Highest rated" },
  { value: "title", label: "Title A–Z" },
  { value: "release", label: "Newest release" },
  { value: "playtime", label: "Most played" },
];

export function CollectionFilters({ genres, total }: CollectionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentGenre = searchParams.get("genre") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentSort = searchParams.get("sort") ?? "recent";
  const currentView = searchParams.get("view") ?? "grid";

  const [term, setTerm] = React.useState(currentSearch);
  const [pending, setPending] = React.useState(false);
  const firstRender = React.useRef(true);

  const update = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
      if (key !== "page") params.delete("page");
      setPending(true);
      router.push(`/collection${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
      setTimeout(() => setPending(false), 600);
    },
    [router, searchParams],
  );

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (term !== currentSearch) update("q", term.trim());
    }, 380);
    return () => clearTimeout(timer);
  }, [term, currentSearch, update]);

  const activeFilters =
    (currentSearch ? 1 : 0) + (currentGenre ? 1 : 0) + (currentStatus !== "all" ? 1 : 0);

  return (
    <section className="sticky top-[68px] z-40 border-b border-white/10 bg-void/92 backdrop-blur-xl md:top-[78px]">
      <div className="shell py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search titles…"
                aria-label="Search games"
                className="h-10 w-full border border-white/12 bg-white/[0.02] pl-9 pr-8 text-sm text-soft placeholder:text-silver/40 focus:border-blood/60 focus:outline-none"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver/50 hover:text-soft"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-silver/40 sm:flex">
              <SlidersHorizontal className="size-3.5" />
              {total} {total === 1 ? "entry" : "entries"}
              {pending && <span className="text-blood/70">updating…</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-white/10">
              {GAME_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => update("status", status)}
                  className={cn(
                    "px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors",
                    currentStatus === status
                      ? "bg-soft/[0.07] text-soft"
                      : "text-silver/50 hover:text-soft",
                  )}
                >
                  {GAME_STATUS_LABELS[status]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => update("status", "all")}
                className={cn(
                  "border-l border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors",
                  currentStatus === "all" ? "bg-soft/[0.07] text-soft" : "text-silver/50 hover:text-soft",
                )}
              >
                All
              </button>
            </div>

            <select
              value={currentGenre}
              onChange={(event) => update("genre", event.target.value)}
              aria-label="Filter by genre"
              className="h-10 border border-white/12 bg-void px-3 font-mono text-[9px] uppercase tracking-[0.14em] text-silver focus:border-blood/60 focus:outline-none"
            >
              <option value="">All genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={currentSort}
              onChange={(event) => update("sort", event.target.value)}
              aria-label="Sort games"
              className="h-10 border border-white/12 bg-void px-3 font-mono text-[9px] uppercase tracking-[0.14em] text-silver focus:border-blood/60 focus:outline-none"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>

            <div className="flex items-center border border-white/10">
              <button
                type="button"
                onClick={() => update("view", "grid")}
                aria-label="Grid view"
                aria-pressed={currentView === "grid"}
                className={cn(
                  "p-2.5 transition-colors",
                  currentView === "grid" ? "bg-soft/[0.07] text-soft" : "text-silver/45 hover:text-soft",
                )}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => update("view", "list")}
                aria-label="List view"
                aria-pressed={currentView === "list"}
                className={cn(
                  "border-l border-white/10 p-2.5 transition-colors",
                  currentView === "list" ? "bg-soft/[0.07] text-soft" : "text-silver/45 hover:text-soft",
                )}
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/40">
              {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
            </span>
            <button
              type="button"
              onClick={() => {
                setTerm("");
                router.push("/collection", { scroll: false });
              }}
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-blood/80 hover:text-blood"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
