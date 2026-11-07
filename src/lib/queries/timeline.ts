import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { TimelineEventType, TimelineEventWithGame } from "@/lib/types";

export async function getTimeline(options: { type?: TimelineEventType | "all"; year?: string } = {}) {
  const { type = "all", year = "all" } = options;

  return safeQuery<TimelineEventWithGame[]>(
    "timeline.list",
    async () => {
      const supabase = createPublicClient();
      let query = supabase
        .from("timeline_events")
        .select("*, games(slug,title)")
        .eq("is_published", true)
        .order("event_date", { ascending: false });

      if (type !== "all") query = query.eq("event_type", type);
      if (year !== "all") {
        query = query.gte("event_date", `${year}-01-01`).lte("event_date", `${year}-12-31`);
      }

      const { data } = await query;
      return (data ?? []) as unknown as TimelineEventWithGame[];
    },
    [],
  );
}

export async function getTimelineYears(): Promise<string[]> {
  return safeQuery<string[]>(
    "timeline.years",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("timeline_events")
        .select("event_date")
        .eq("is_published", true);
      const years = new Set(((data ?? []) as { event_date: string }[]).map((row) => row.event_date.slice(0, 4)));
      return Array.from(years).sort((a, b) => Number(b) - Number(a));
    },
    [],
  );
}
