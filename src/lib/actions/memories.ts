"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asDate, asInt, errorMessage, formToObject } from "@/lib/actions/helpers";
import { firstIssueMessage, flattenIssues, memorySchema } from "@/lib/validation";

function revalidateMemories() {
  revalidatePath("/");
  revalidatePath("/memories");
  revalidatePath("/admin/memories");
  revalidatePath("/admin");
}

export async function saveMemoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = memorySchema.safeParse(formToObject(formData));
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

    const rowWithOrder = {
      title: parsed.data.title,
      game_id: parsed.data.game_id,
      description: parsed.data.description,
      timeframe: parsed.data.timeframe,
      occurred_on: asDate(parsed.data.occurred_on),
      image_url: parsed.data.image_url,
      featured: parsed.data.featured,
      is_published: parsed.data.is_published,
    };

    if (id) {
      const { error } = await supabase.from("memories").update(rowWithOrder).eq("id", id);
      if (error) return errorState(error.message);
      revalidateMemories();
      return successState("Memory updated.");
    }

    const { data: last } = await supabase
      .from("memories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase
      .from("memories")
      .insert({
        ...rowWithOrder,
        sort_order: asInt(parsed.data.sort_order) ?? (last?.sort_order ?? 0) + 1,
      });

    if (error) return errorState(error.message);
    revalidateMemories();
    return successState("Memory added.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deleteMemoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("memories").delete().eq("id", id);
  revalidateMemories();
}

export async function toggleMemoryFlagAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id || (field !== "is_published" && field !== "featured")) return;

  const supabase = await createClient();
  await supabase.from("memories").update({ [field]: next }).eq("id", id);
  revalidateMemories();
}

export async function moveMemoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("id,sort_order")
    .order("sort_order", { ascending: true });

  const list = (data ?? []) as { id: string; sort_order: number }[];
  const index = list.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) return;

  const current = list[index];
  const neighbour = list[target];

  await supabase.from("memories").update({ sort_order: neighbour.sort_order }).eq("id", current.id);
  await supabase.from("memories").update({ sort_order: current.sort_order }).eq("id", neighbour.id);
  revalidateMemories();
}
