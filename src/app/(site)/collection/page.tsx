import type { Metadata } from "next";

import { CollectionFilters } from "@/components/public/collection-filters";
import { GameCoverCard, GameListRow } from "@/components/public/cards";
import { EmptyState, PageHeader } from "@/components/public/primitives";
import { Pagination } from "@/components/public/pagination";
import { Reveal } from "@/components/public/reveal";
import { getGames } from "@/lib/queries/games";
import { getArchiveStats } from "@/lib/queries/stats";
import { GAME_STATUSES, type GameStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "The complete SS Afterplay library: every game with its completion status, genre, platform, release year and personal rating.",
  openGraph: {
    title: "The Collection — SS AFTERPLAY",
    description: "Every game in the archive, with status, platform and personal rating.",
  },
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    status?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

export default async function CollectionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const status = (GAME_STATUSES as readonly string[]).includes(params.status ?? "")
    ? (params.status as GameStatus)
    : "all";

  const [result, stats] = await Promise.all([
    getGames({
      search: params.q,
      genre: params.genre,
      status,
      sort: (params.sort as "recent" | "rating" | "title" | "release" | "playtime") ?? "recent",
      page,
      perPage: 15,
    }),
    getArchiveStats(),
  ]);

  const view = params.view === "list" ? "list" : "grid";

  return (
    <>
      <PageHeader
        kicker="The collection"
        title="Every game, kept on the record."
        intro="Completed, in progress, on hold, dropped or waiting in the backlog. Nothing is deleted from this shelf — the misses are part of the archive too."
        meta={[
          { label: "Entries", value: String(stats.totalGames) },
          { label: "Completed", value: String(stats.completed) },
          { label: "Hours played", value: stats.totalHours ? `${stats.totalHours}h` : "—" },
          { label: "Average rating", value: stats.averageRating ? `${stats.averageRating}/10` : "—" },
        ]}
      />

      <CollectionFilters genres={result.genres} total={result.total} />

      <section className="shell py-14 md:py-20">
        {result.items.length === 0 ? (
          <EmptyState
            title="No games match those filters."
            description="Try clearing the search or choosing a different status."
            action={{ href: "/collection", label: "Reset the collection view" }}
          />
        ) : view === "list" ? (
          <div>
            {result.items.map((game, index) => (
              <GameListRow
                key={game.id}
                game={game}
                index={(result.page - 1) * result.perPage + index}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {result.items.map((game, index) => (
              <Reveal key={game.id} delay={(index % 5) * 50}>
                <GameCoverCard
                  game={game}
                  index={(result.page - 1) * result.perPage + index + 1}
                  priority={index < 5}
                />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/collection"
          params={{
            q: params.q,
            genre: params.genre,
            status: status === "all" ? undefined : status,
            sort: params.sort,
            view: params.view === "list" ? "list" : undefined,
          }}
        />
      </section>
    </>
  );
}
