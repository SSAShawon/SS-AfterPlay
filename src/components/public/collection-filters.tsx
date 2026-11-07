import Link from "next/link";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { GAME_STATUSES, GAME_STATUS_LABELS, type GameStatus } from "@/lib/types";

const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "rating", label: "Highest rated" },
  { value: "title", label: "Title A–Z" },
  { value: "release", label: "Newest release" },
  { value: "playtime", label: "Most played" },
];

interface CollectionFiltersProps {
  genres: string[];
  total: number;
  q?: string;
  genre?: string;
  status: GameStatus | "all";
  sort: string;
  view: "grid" | "list";
}

function href(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `/collection?${query}` : "/collection";
}

export function CollectionFilters({
  genres,
  total,
  q,
  genre,
  status,
  sort,
  view,
}: CollectionFiltersProps) {
  const base = {
    q: q || undefined,
    genre: genre || undefined,
    status: status === "all" ? undefined : status,
    sort: sort === "recent" ? undefined : sort,
    view: view === "grid" ? undefined : "list",
  };

  const activeCount = (q ? 1 : 0) + (genre ? 1 : 0) + (status !== "all" ? 1 : 0);

  return (
    <>
      {/* status rail */}
      <div className="sticky top-[62px] z-40 border-b border-line bg-void md:top-[72px]">
        <div className="shell flex items-center justify-between gap-6">
          <nav className="scrollbar-none flex items-center gap-6 overflow-x-auto py-3" aria-label="Filter by status">
            <Link
              href={href({ ...base, status: undefined })}
              className={cn(
                "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                status === "all" ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
              )}
            >
              All
            </Link>
            {GAME_STATUSES.map((value) => (
              <Link
                key={value}
                href={href({ ...base, status: value })}
                className={cn(
                  "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                  status === value ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
                )}
              >
                {GAME_STATUS_LABELS[value]}
              </Link>
            ))}
          </nav>

          <p className="hidden shrink-0 text-[9.5px] uppercase tracking-[0.16em] text-muted sm:block">
            {total} {total === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {/* search / genre / sort */}
      <div className="border-b border-line">
        <div className="shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <form action="/collection" className="flex flex-1 flex-wrap items-center gap-3" role="search">
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {sort !== "recent" && <input type="hidden" name="sort" value={sort} />}
            {view === "list" && <input type="hidden" name="view" value="list" />}

            <label className="relative flex h-9 flex-1 items-center border-b border-line-strong focus-within:border-soft lg:max-w-xs">
              <Search className="pointer-events-none size-3.5 text-muted" />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search the collection"
                aria-label="Search games"
                className="h-full w-full bg-transparent pl-2.5 text-[13px] text-soft placeholder:text-muted focus:outline-none"
              />
            </label>

            <select
              name="genre"
              defaultValue={genre ?? ""}
              aria-label="Filter by genre"
              className="h-9 border-b border-line-strong bg-void px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-silver focus:border-soft focus:outline-none"
            >
              <option value="">All genres</option>
              {genres.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              aria-label="Sort games"
              className="h-9 border-b border-line-strong bg-void px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-silver focus:border-soft focus:outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button type="submit" className="btn h-9 px-4 text-[10px]">
              Apply
            </button>

            {activeCount > 0 && (
              <Link href="/collection" className="link-quiet text-[10px]">
                Reset ({activeCount})
              </Link>
            )}
          </form>

          <div className="flex items-center gap-4">
            <span className="text-[9.5px] uppercase tracking-[0.16em] text-muted">View</span>
            <div className="flex items-center gap-3">
              {(["grid", "list"] as const).map((mode) => (
                <Link
                  key={mode}
                  href={href({ ...base, view: mode === "grid" ? undefined : "list" })}
                  className={cn(
                    "border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                    view === mode ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
                  )}
                >
                  {mode}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
