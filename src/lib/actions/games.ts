"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asDate, asInt, errorMessage, formToObject } from "@/lib/actions/helpers";
import {
  firstIssueMessage,
  flattenIssues,
  gameSchema,
  splitList,
} from "@/lib/validation";

function revalidateGame(slug?: string) {
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/rankings");
  revalidatePath("/timeline");
  revalidatePath("/memories");
  revalidatePath("/admin/games");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/games/${slug}`);
    revalidatePath("/sitemap.xml");
  }
}

function toRow(input: ReturnType<typeof gameSchema.parse>) {
  return {
    title: input.title,
    slug: input.slug,
    tagline: input.tagline,
    developer: input.developer,
    publisher: input.publisher,
    release_year: asInt(input.release_year),
    genres: splitList(input.genres),
    platforms: splitList(input.platforms),
    status: input.status,
    rating: input.rating === null ? null : Number(input.rating),
    cover_url: input.cover_url,
    hero_url: input.hero_url,
    summary: input.summary,
    setting: input.setting,
    gameplay_type: input.gameplay_type,
    main_theme: input.main_theme,
    why_archived: input.why_archived,
    storyline: input.storyline,
    best_aspect: input.best_aspect,
    biggest_weakness: input.biggest_weakness,
    recommendation: input.recommendation,
    replay_recommendation: input.replay_recommendation,
    final_verdict: input.final_verdict,
    playtime_hours: input.playtime_hours === null ? null : Number(input.playtime_hours),
    started_on: asDate(input.started_on),
    completed_on: asDate(input.completed_on),
    featured: input.featured,
    is_published: input.is_published,
  };
}

export async function createGameAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = gameSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error),
      fieldErrors: flattenIssues(parsed.error),
    };
  }

  let newId: string | null = null;

  try {
    await assertAdmin();
    const supabase = await createClient();
    const row = toRow(parsed.data);
    const { data, error } = await supabase
      .from("games")
      .insert({
        ...row,
        published_at: row.is_published ? new Date().toISOString() : null,
      })
      .select("id,slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ...errorState("That slug is already in use."), fieldErrors: { slug: "Slug already in use" } };
      }
      return errorState(error.message);
    }

    newId = data.id as string;
    revalidateGame(data.slug as string);
  } catch (error) {
    return errorState(errorMessage(error));
  }

  redirect(`/admin/games/${newId}`);
}

export async function updateGameAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = gameSchema.safeParse(formToObject(formData));
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
    const row = toRow(parsed.data);

    const { data: existing } = await supabase
      .from("games")
      .select("published_at,slug")
      .eq("id", id)
      .maybeSingle();

    const publishedAt = row.is_published
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

    const { error } = await supabase
      .from("games")
      .update({ ...row, published_at: publishedAt })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { ...errorState("That slug is already in use."), fieldErrors: { slug: "Slug already in use" } };
      }
      return errorState(error.message);
    }

    revalidateGame(row.slug);
    if (existing?.slug && existing.slug !== row.slug) revalidateGame(existing.slug as string);
    return successState("Game saved.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deleteGameAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", id);
  revalidateGame();
  redirect("/admin/games");
}

export async function toggleGameFlagAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const next = String(formData.get("next") ?? "") === "true";

  if (!id || (field !== "is_published" && field !== "featured")) return;

  const supabase = await createClient();

  if (field === "is_published") {
    const { data } = await supabase
      .from("games")
      .select("published_at,slug")
      .eq("id", id)
      .maybeSingle();
    await supabase
      .from("games")
      .update({
        is_published: next,
        published_at: next ? (data?.published_at ?? new Date().toISOString()) : null,
      })
      .eq("id", id);
    revalidateGame(data?.slug as string | undefined);
  } else {
    await supabase.from("games").update({ featured: next }).eq("id", id);
    revalidateGame();
  }
}

export async function updateGameStatusAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const supabase = await createClient();
  await supabase.from("games").update({ status }).eq("id", id);
  revalidateGame();
}
