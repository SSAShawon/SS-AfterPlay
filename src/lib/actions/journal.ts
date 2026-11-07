"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { asInt, asTimestamp, errorMessage, formToObject } from "@/lib/actions/helpers";
import {
  categorySchema,
  firstIssueMessage,
  flattenIssues,
  postSchema,
} from "@/lib/validation";

function revalidateJournal(slug?: string) {
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath("/admin/journal");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/journal/${slug}`);
}

function postRow(input: ReturnType<typeof postSchema.parse>) {
  const publishedAt = asTimestamp(input.published_at);
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_url: input.cover_url,
    category_id: input.category_id,
    reading_minutes: asInt(input.reading_minutes),
    status: input.status,
    featured: input.featured,
    published_at: input.status === "published" ? (publishedAt ?? new Date().toISOString()) : publishedAt,
  };
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = postSchema.safeParse(formToObject(formData));
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
    const row = postRow(parsed.data);
    const { data, error } = await supabase
      .from("journal_posts")
      .insert(row)
      .select("id,slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ...errorState("That slug is already in use."), fieldErrors: { slug: "Slug already in use" } };
      }
      return errorState(error.message);
    }

    newId = data.id as string;
    revalidateJournal(data.slug as string);
  } catch (error) {
    return errorState(errorMessage(error));
  }

  redirect(`/admin/journal/${newId}`);
}

export async function updatePostAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = postSchema.safeParse(formToObject(formData));
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
    const row = postRow(parsed.data);
    const { data: existing } = await supabase
      .from("journal_posts")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("journal_posts").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return { ...errorState("That slug is already in use."), fieldErrors: { slug: "Slug already in use" } };
      }
      return errorState(error.message);
    }

    revalidateJournal(row.slug);
    if (existing?.slug && existing.slug !== row.slug) revalidateJournal(existing.slug as string);
    return successState("Article saved.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("journal_posts").delete().eq("id", id);
  revalidateJournal();
  redirect("/admin/journal");
}

export async function togglePostFlagAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();

  if (field === "status") {
    const { data } = await supabase
      .from("journal_posts")
      .select("published_at,slug")
      .eq("id", id)
      .maybeSingle();
    const status = next ? "published" : "draft";
    await supabase
      .from("journal_posts")
      .update({
        status,
        published_at: status === "published" ? (data?.published_at ?? new Date().toISOString()) : data?.published_at,
      })
      .eq("id", id);
    revalidateJournal(data?.slug as string | undefined);
  } else if (field === "featured") {
    await supabase.from("journal_posts").update({ featured: next }).eq("id", id);
    revalidateJournal();
  }
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse(formToObject(formData));
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
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      sort_order: asInt(parsed.data.sort_order) ?? 0,
    };

    const { error } = id
      ? await supabase.from("journal_categories").update(row).eq("id", id)
      : await supabase.from("journal_categories").insert(row);

    if (error) {
      if (error.code === "23505") return errorState("That category slug already exists.");
      return errorState(error.message);
    }

    revalidatePath("/journal");
    revalidatePath("/admin/journal/categories");
    return successState(id ? "Category updated." : "Category created.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("journal_categories").delete().eq("id", id);
  revalidatePath("/journal");
  revalidatePath("/admin/journal/categories");
}
