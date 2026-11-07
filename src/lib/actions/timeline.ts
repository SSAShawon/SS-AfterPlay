"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asDate, errorMessage, formToObject } from "@/lib/actions/helpers";
import { firstIssueMessage, flattenIssues, timelineSchema } from "@/lib/validation";

function revalidateTimeline() {
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  revalidatePath("/admin");
}

export async function saveTimelineEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = timelineSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error),
      fieldErrors: flattenIssues(parsed.error),
    };
  }

  try {
    await assertAdmin();
    const supabase = await createClient();
    const id = String(formData.get("id") ?? "");

    const row = {
      title: parsed.data.title,
      description: parsed.data.description,
      event_date: asDate(parsed.data.event_date) ?? parsed.data.event_date,
      event_type: parsed.data.event_type,
      game_id: parsed.data.game_id,
      is_published: parsed.data.is_published,
    };

    const { error } = id
      ? await supabase.from("timeline_events").update(row).eq("id", id)
      : await supabase.from("timeline_events").insert(row);

    if (error) return errorState(error.message);
    revalidateTimeline();
    return successState(id ? "Event updated." : "Event added.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deleteTimelineEventAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("timeline_events").delete().eq("id", id);
  revalidateTimeline();
}

export async function toggleTimelineEventAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("timeline_events").update({ is_published: next }).eq("id", id);
  revalidateTimeline();
}
