import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Flag, Gamepad2, Milestone, Sparkles } from "lucide-react";

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

const TYPE_ICONS: Record<TimelineEventType, React.ReactNode> = {
  game_started: <Gamepad2 className="size-3.5" />,
  game_completed: <Flag className="size-3.5" />,
  milestone: <Milestone className="size-3.5" />,
  journal: <BookOpen className="size-3.5" />,
  other: <Sparkles className="size-3.5" />,
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

      <section className="sticky top-[68px] z-40 border-b border-white/10 bg-void/92 backdrop-blur-xl md:top-[78px]">
        <div className="shell flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto" aria-label="Filter by event type">
            <Link
              href={`/timeline${params.year ? `?year=${params.year}` : ""}`}
              className={cn(
                "shrink-0 border-b px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                type === "all" ? "border-blood text-soft" : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              All events
            </Link>
            {(Object.keys(TIMELINE_EVENT_LABELS) as TimelineEventType[]).map((eventType) => (
              <Link
                key={eventType}
                href={`/timeline?type=${eventType}${params.year ? `&year=${params.year}` : ""}`}
                className={cn(
                  "shrink-0 border-b px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                  type === eventType
                    ? "border-blood text-soft"
                    : "border-transparent text-silver/50 hover:text-soft",
                )}
              >
                {TIMELINE_EVENT_LABELS[eventType]}
              </Link>
            ))}
          </nav>

          <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
            <Link
              href={`/timeline${type !== "all" ? `?type=${type}` : ""}`}
              className={cn(
                "shrink-0 border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                !params.year
                  ? "border-white/20 text-soft"
                  : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              All years
            </Link>
            {years.map((year) => (
              <Link
                key={year}
                href={`/timeline?year=${year}${type !== "all" ? `&type=${type}` : ""}`}
                className={cn(
                  "shrink-0 border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                  params.year === year
                    ? "border-blood/60 text-soft"
                    : "border-transparent text-silver/50 hover:text-soft",
                )}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        {grouped.length === 0 ? (
          <EmptyState
            title="No events match those filters."
            description="Try a different year or event type."
            action={{ href: "/timeline", label: "Show everything" }}
          />
        ) : (
          <div className="space-y-16 md:space-y-24">
            {grouped.map(([year, yearEvents]) => (
              <section key={year} className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <div className="sticky top-36">
                    <h2 className="display text-[clamp(2.6rem,6vw,4.4rem)] leading-none text-white/20">
                      {year}
                    </h2>
                    <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-silver/40">
                      {yearEvents.length} event{yearEvents.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="relative lg:col-span-9">
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-blood/40 via-white/10 to-transparent"
                  />
                  <ol className="space-y-8">
                    {yearEvents.map((event) => (
                      <li key={event.id} className="relative pl-8">
                        <span className="absolute left-0 top-2 flex size-[15px] items-center justify-center border border-white/20 bg-void text-blood">
                          {TYPE_ICONS[event.event_type]}
                        </span>

                        <div className="border-b border-white/[0.07] pb-6">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/40">
                              {formatDate(event.event_date, "short")}
                            </span>
                            <span className="border border-white/12 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-silver/55">
                              {TIMELINE_EVENT_LABELS[event.event_type]}
                            </span>
                          </div>

                          <h3 className="mt-2 font-serif text-xl text-soft md:text-2xl">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-silver/70">
                              {event.description}
                            </p>
                          )}

                          {event.games && (
                            <Link
                              href={`/games/${event.games.slug}`}
                              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-blood/70 transition-colors hover:text-blood"
                            >
                              {event.games.title}
                            </Link>
                          )}
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
