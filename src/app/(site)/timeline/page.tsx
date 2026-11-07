import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, PageHeader } from "@/components/public/primitives";
import { getTimeline, getTimelineYears } from "@/lib/queries/timeline";
import { cn, formatDate, groupByYear } from "@/lib/utils";
import { TIMELINE_EVENT_LABELS, type TimelineEventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "A chronological history of the archive: games started, games completed, milestones and journal entries, year by year.",
  openGraph: {
    title: "Timeline — SS AFTERPLAY",
    description: "Games started, completed, milestones and journal entries, year by year.",
  },
};

interface PageProps {
  searchParams: Promise<{ year?: string; type?: string }>;
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = (params.type ?? "all") as TimelineEventType | "all";

  const [events, years] = await Promise.all([
    getTimeline({ type, year: params.year ?? "all" }),
    getTimelineYears(),
  ]);

  const grouped = groupByYear(events);

  const typeHref = (value: TimelineEventType | "all") => {
    const search = new URLSearchParams();
    if (value !== "all") search.set("type", value);
    if (params.year) search.set("year", params.year);
    const query = search.toString();
    return query ? `/timeline?${query}` : "/timeline";
  };

  const yearHref = (value?: string) => {
    const search = new URLSearchParams();
    if (type !== "all") search.set("type", type);
    if (value) search.set("year", value);
    const query = search.toString();
    return query ? `/timeline?${query}` : "/timeline";
  };

  return (
    <>
      <PageHeader
        kicker="Timeline"
        title="The archive, in the order it happened."
        intro="Every start, every completed run, every milestone and every essay — a chronological record of one person playing games."
        meta={[
          { label: "Events", value: String(events.length) },
          { label: "Years covered", value: String(years.length) },
        ]}
      />

      <div className="sticky top-[62px] z-40 border-b border-line bg-void md:top-[72px]">
        <div className="shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="scrollbar-none flex items-center gap-5 overflow-x-auto" aria-label="Filter by event type">
            <Link
              href={typeHref("all")}
              className={cn(
                "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                type === "all" ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
              )}
            >
              All events
            </Link>
            {(Object.keys(TIMELINE_EVENT_LABELS) as TimelineEventType[]).map((eventType) => (
              <Link
                key={eventType}
                href={typeHref(eventType)}
                className={cn(
                  "shrink-0 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                  type === eventType ? "border-blood text-soft" : "border-transparent text-muted hover:text-soft",
                )}
              >
                {TIMELINE_EVENT_LABELS[eventType]}
              </Link>
            ))}
          </nav>

          <div className="scrollbar-none flex items-center gap-4 overflow-x-auto">
            <Link
              href={yearHref()}
              className={cn(
                "shrink-0 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors",
                !params.year ? "text-soft" : "text-muted hover:text-soft",
              )}
            >
              All years
            </Link>
            {years.map((year) => (
              <Link
                key={year}
                href={yearHref(year)}
                className={cn(
                  "shrink-0 text-[9.5px] tabular-nums tracking-[0.12em] transition-colors",
                  params.year === year ? "text-soft" : "text-muted hover:text-soft",
                )}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="shell py-10 md:py-14">
        {grouped.length === 0 ? (
          <EmptyState
            title="No events match those filters."
            description="Try a different year or event type."
            action={{ href: "/timeline", label: "Show everything" }}
          />
        ) : (
          <div className="space-y-14 md:space-y-20">
            {grouped.map(([year, yearEvents]) => (
              <section key={year} className="grid gap-6 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-3">
                  <div className="lg:sticky lg:top-32">
                    <h2 className="font-serif text-[clamp(2.4rem,5.4vw,4rem)] leading-none text-soft">
                      {year}
                    </h2>
                    <p className="mt-2 text-[9.5px] uppercase tracking-[0.18em] text-muted">
                      {yearEvents.length} {yearEvents.length === 1 ? "event" : "events"}
                    </p>
                    <span className="mt-4 block h-px w-10 bg-blood" aria-hidden />
                  </div>
                </div>

                <div className="lg:col-span-9">
                  <ol className="border-t border-line">
                    {yearEvents.map((event) => (
                      <li key={event.id} className="border-b border-line py-5">
                        <div className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-soft">
                              {formatDate(event.event_date, "short")}
                            </p>
                            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">
                              {TIMELINE_EVENT_LABELS[event.event_type]}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-serif text-[1.4rem] leading-tight text-soft md:text-[1.6rem]">
                              {event.title}
                            </h3>

                            {event.description && (
                              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-silver">
                                {event.description}
                              </p>
                            )}

                            {event.games && (
                              <Link
                                href={`/games/${event.games.slug}`}
                                className="mt-3 inline-flex items-baseline gap-2 border-b border-line pb-0.5 text-[10px] uppercase tracking-[0.14em] text-silver transition-colors hover:border-blood hover:text-soft"
                              >
                                {event.games.title}
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
