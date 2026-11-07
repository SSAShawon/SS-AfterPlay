"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asInt, errorMessage, formToObject } from "@/lib/actions/helpers";
import { firstIssueMessage, flattenIssues, rankingCategorySchema } from "@/lib/validation";

function revalidateRankings() {
  revalidatePath("/");
  revalidatePath("/rankings");
  revalidatePath("/admin/rankings");
}

export async function saveRankingCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rankingCategorySchema.safeParse(formToObject(formData));
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
      slug: parsed.data.slug,
      description: parsed.data.description,
      sort_order: asInt(parsed.data.sort_order) ?? 0,
    };

    const { error } = id
      ? await supabase.from("ranking_categories").update(row).eq("id", id)
      : await supabase.from("ranking_categories").insert(row);

    if (error) {
      if (error.code === "23505") return errorState("That ranking slug already exists.");
      return errorState(error.message);
    }

    revalidateRankings();
    return successState(id ? "Ranking category updated." : "Ranking category created.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deleteRankingCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("ranking_categories").delete().eq("id", id);
  revalidateRankings();
}

export async function addRankingEntryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const categoryId = String(formData.get("category_id") ?? "");
  const gameId = String(formData.get("game_id") ?? "");
  if (!categoryId || !gameId) return;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("rankings")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("rankings").upsert(
    {
      category_id: categoryId,
      game_id: gameId,
      position: (last?.position ?? 0) + 1,
    },
    { onConflict: "category_id,game_id" },
  );

  revalidateRankings();
}

export async function removeRankingEntryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("rankings").delete().eq("id", id);
  revalidateRankings();
}

export async function moveRankingEntryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("rankings")
    .select("id,category_id,position")
    .eq("id", id)
    .maybeSingle();

  if (!entry) return;

  const { data: siblings } = await supabase
    .from("rankings")
    .select("id,position")
    .eq("category_id", entry.category_id)
    .order("position", { ascending: true });

  const list = (siblings ?? []) as { id: string; position: number }[];
  const index = list.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) return;

  const current = list[index];
  const neighbour = list[target];

  await supabase.from("rankings").update({ position: neighbour.position }).eq("id", current.id);
  await supabase.from("rankings").update({ position: current.position }).eq("id", neighbour.id);

  revalidateRankings();
}

export async function updateRankingNoteAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("rankings").update({ note: note || null }).eq("id", id);
  revalidateRankings();
}
