import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { safeQuery } from "@/lib/queries/runner";
import type { SiteSettings } from "@/lib/types";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "SS AFTERPLAY",
  tagline: "The game ends. The memories don't.",
  hero_kicker: "Archive 001",
  hero_headline: "The game ends. The memories don't.",
  hero_subline:
    "A personal cinematic archive of the games I have finished, abandoned and adored.",
  about_content: null,
  footer_note: null,
  contact_email: null,
  social_links: [],
  updated_at: new Date(0).toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  return safeQuery<SiteSettings>(
    "settings",
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (!data) return FALLBACK_SETTINGS;
      return {
        ...(data as SiteSettings),
        social_links: Array.isArray((data as SiteSettings).social_links)
          ? (data as SiteSettings).social_links
          : [],
      };
    },
    FALLBACK_SETTINGS,
  );
}
