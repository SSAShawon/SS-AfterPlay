"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { errorMessage, formToObject } from "@/lib/actions/helpers";
import { firstIssueMessage, flattenIssues, settingsSchema } from "@/lib/validation";
import type { FeaturedSlot, SocialLink } from "@/lib/types";

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error),
      fieldErrors: flattenIssues(parsed.error),
    };
  }

  try {
    await assertAdmin();

    let socialLinks: SocialLink[] = [];
    if (parsed.data.social_links) {
      try {
        const raw = JSON.parse(parsed.data.social_links);
        if (!Array.isArray(raw)) throw new Error("not an array");
        socialLinks = raw
          .filter((item) => item && typeof item.label === "string" && typeof item.url === "string")
          .map((item: { label: string; url: string }) => ({
            label: item.label.trim().slice(0, 40),
            url: item.url.trim().slice(0, 500),
          }))
          .filter((item) => item.url.startsWith("http"));
      } catch {
        return errorState("Social links must be valid JSON — e.g. [{\"label\":\"X\",\"url\":\"https://x.com/you\"}]");
      }
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({
        site_name: parsed.data.site_name,
        tagline: parsed.data.tagline,
        hero_kicker: parsed.data.hero_kicker,
        hero_headline: parsed.data.hero_headline,
        hero_subline: parsed.data.hero_subline,
        about_content: parsed.data.about_content,
        footer_note: parsed.data.footer_note,
        contact_email: parsed.data.contact_email,
        social_links: socialLinks,
      })
      .eq("id", 1);

    if (error) return errorState(error.message);

    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    return successState("Site settings saved.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function saveFeaturedSlotAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();

    const slot = String(formData.get("slot") ?? "") as FeaturedSlot;
    const entityId = String(formData.get("entity_id") ?? "");
    const headline = String(formData.get("headline") ?? "").trim() || null;
    const subline = String(formData.get("subline") ?? "").trim() || null;

    if (!["hero", "featured_game", "featured_memory", "featured_journal"].includes(slot)) {
      return errorState("Unknown homepage slot.");
    }

    const supabase = await createClient();
    const column =
      slot === "featured_memory"
        ? "memory_id"
        : slot === "featured_journal"
          ? "journal_post_id"
          : "game_id";

    await supabase.from("featured_content").delete().eq("slot", slot);

    if (entityId) {
      const { error } = await supabase.from("featured_content").insert({
        slot,
        [column]: entityId,
        headline,
        subline,
        sort_order: 1,
        is_active: true,
      });
      if (error) return errorState(error.message);
    }

    revalidatePath("/");
    revalidatePath("/journal");
    revalidatePath("/memories");
    revalidatePath("/admin/homepage");
    return successState(entityId ? "Homepage slot updated." : "Homepage slot cleared.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}
