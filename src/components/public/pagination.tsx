import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value && !(key === "page" && value === "1")) search.set(key, value);
  });
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({ page, totalPages, basePath, params = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1,
  );

  return (
    <nav className="mt-14 flex items-center justify-between border-t border-white/10 pt-6" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, params, page - 1)}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-silver transition-colors hover:text-soft"
        >
          <ChevronLeft className="size-3.5" /> Previous
        </Link>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver/25">Previous</span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const gap = previous && value - previous > 1;
          return (
            <span key={value} className="flex items-center gap-1">
              {gap && <span className="px-1 text-silver/30">…</span>}
              <Link
                href={buildHref(basePath, params, value)}
                className={cn(
                  "flex size-8 items-center justify-center font-mono text-[10px] transition-colors",
                  value === page
                    ? "border border-blood/60 text-soft"
                    : "border border-transparent text-silver/60 hover:border-white/15 hover:text-soft",
                )}
                aria-current={value === page ? "page" : undefined}
              >
                {String(value).padStart(2, "0")}
              </Link>
            </span>
          );
        })}
      </div>

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, params, page + 1)}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-silver transition-colors hover:text-soft"
        >
          Next <ChevronRight className="size-3.5" />
        </Link>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver/25">Next</span>
      )}
    </nav>
  );
}
