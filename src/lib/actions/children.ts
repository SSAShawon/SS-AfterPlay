"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asFloat, errorMessage, formToObject } from "@/lib/actions/helpers";
import {
  childSchemas,
  firstIssueMessage,
  flattenIssues,
  type ChildKind,
} from "@/lib/validation";

const TABLES: Record<ChildKind, string> = {
  chapter: "game_chapters",
  character: "game_characters",
  moment: "game_memorable_moments",
  review: "game_reviews",
};

function revalidateGamePages(slug?: string | null) {
  revalidatePath("/admin/games");
  revalidatePath("/");
  revalidatePath("/collection");
  if (slug) revalidatePath(`/games/${slug}`);
}

export async function saveChildAction(
  kind: ChildKind,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const intent = String(formData.get("intent") ?? "create");
  const gameId = String(formData.get("game_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "") || null;

  try {
    await assertAdmin();
    const supabase = await createClient();

    if (!gameId) return errorState("Missing game reference.");

    if (intent === "delete") {
      if (!id) return errorState("Missing record.");
      const { error } = await supabase.from(TABLES[kind]).delete().eq("id", id).eq("game_id", gameId);
      if (error) return errorState(error.message);
      revalidateGamePages(slug);
      return successState("Deleted.");
    }

    if (intent === "up" || intent === "down") {
      if (!id) return errorState("Missing record.");
      const { data: siblings } = await supabase
        .from(TABLES[kind])
        .select("id,sort_order")
        .eq("game_id", gameId)
        .order("sort_order", { ascending: true });

      const list = (siblings ?? []) as { id: string; sort_order: number }[];
      const index = list.findIndex((row) => row.id === id);
      const target = intent === "up" ? index - 1 : index + 1;

      if (index === -1 || target < 0 || target >= list.length) {
        return successState("Order unchanged.");
      }

      const current = list[index];
      const neighbour = list[target];

      await supabase
        .from(TABLES[kind])
        .update({ sort_order: neighbour.sort_order })
        .eq("id", current.id);
      await supabase
        .from(TABLES[kind])
        .update({ sort_order: current.sort_order })
        .eq("id", neighbour.id);

      revalidateGamePages(slug);
      return successState("Order updated.");
    }

    const raw = formToObject(formData);
    const schema = childSchemas[kind];
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return {
        status: "error",
        message: firstIssueMessage(parsed.error),
        fieldErrors: flattenIssues(parsed.error),
      };
    }

    let payload: Record<string, unknown> = { ...parsed.data };

    if (kind === "review") {
      const data = parsed.data as { score: number | string | null };
      payload = {
        ...parsed.data,
        score: asFloat(data.score),
      };
    }

    if (intent === "update") {
      if (!id) return errorState("Missing record.");
      const { error } = await supabase
        .from(TABLES[kind])
        .update(payload)
        .eq("id", id)
        .eq("game_id", gameId);
      if (error) return errorState(error.message);
      revalidateGamePages(slug);
      return successState("Changes saved.");
    }

    const { data: last } = await supabase
      .from(TABLES[kind])
      .select("sort_order")
      .eq("game_id", gameId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (last?.sort_order ?? 0) + 1;

    const { error } = await supabase
      .from(TABLES[kind])
      .insert({ ...payload, game_id: gameId, sort_order: nextOrder });

    if (error) {
      if (error.code === "23505") {
        return errorState("An entry with that category already exists for this game.");
      }
      return errorState(error.message);
    }

    revalidateGamePages(slug);
    return successState("Added.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function addRelatedGameAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const gameId = String(formData.get("game_id") ?? "");
  const relatedId = String(formData.get("related_game_id") ?? "");
  const slug = String(formData.get("slug") ?? "") || null;
  if (!gameId || !relatedId || gameId === relatedId) return;

  const supabase = await createClient();
  await supabase.from("game_related").upsert(
    { game_id: gameId, related_game_id: relatedId, sort_order: 0 },
    { onConflict: "game_id,related_game_id", ignoreDuplicates: true },
  );
  revalidateGamePages(slug);
}

export async function removeRelatedGameAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const gameId = String(formData.get("game_id") ?? "");
  const relatedId = String(formData.get("related_game_id") ?? "");
  const slug = String(formData.get("slug") ?? "") || null;
  if (!gameId || !relatedId) return;

  const supabase = await createClient();
  await supabase
    .from("game_related")
    .delete()
    .eq("game_id", gameId)
    .eq("related_game_id", relatedId);
  revalidateGamePages(slug);
}

const KIND_TABLE: Record<string, string> = TABLES;

function resolveKind(value: string): ChildKind | null {
  if (value === "chapter" || value === "character" || value === "moment" || value === "review") {
    return value;
  }
  return null;
}

export async function deleteChildAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const kind = resolveKind(String(formData.get("kind") ?? ""));
  const id = String(formData.get("id") ?? "");
  const gameId = String(formData.get("game_id") ?? "");
  const slug = String(formData.get("slug") ?? "") || null;
  if (!kind || !id || !gameId) return;

  const supabase = await createClient();
  await supabase.from(KIND_TABLE[kind]).delete().eq("id", id).eq("game_id", gameId);
  revalidateGamePages(slug);
}

export async function moveChildAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const kind = resolveKind(String(formData.get("kind") ?? ""));
  const id = String(formData.get("id") ?? "");
  const gameId = String(formData.get("game_id") ?? "");
  const slug = String(formData.get("slug") ?? "") || null;
  const direction = String(formData.get("direction") ?? "");
  if (!kind || !id || !gameId) return;

  const supabase = await createClient();
  const { data: siblings } = await supabase
    .from(KIND_TABLE[kind])
    .select("id,sort_order")
    .eq("game_id", gameId)
    .order("sort_order", { ascending: true });

  const list = (siblings ?? []) as { id: string; sort_order: number }[];
  const index = list.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) return;

  const current = list[index];
  const neighbour = list[target];

  await supabase
    .from(KIND_TABLE[kind])
    .update({ sort_order: neighbour.sort_order })
    .eq("id", current.id);
  await supabase
    .from(KIND_TABLE[kind])
    .update({ sort_order: current.sort_order })
    .eq("id", neighbour.id);

  revalidateGamePages(slug);
}
