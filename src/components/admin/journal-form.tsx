"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { createPostAction, updatePostAction } from "@/lib/actions/journal";
import { IDLE_STATE } from "@/lib/action-state";
import {
  CheckboxField,
  FormAlert,
  ImageUrlField,
  MarkdownField,
  SectionCard,
  SelectField,
  SlugField,
  SubmitButton,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields";
import { toDateTimeInput } from "@/lib/utils";
import type { JournalCategory, JournalPost } from "@/lib/types";

export function JournalForm({
  post,
  categories,
}: {
  post?: JournalPost;
  categories: JournalCategory[];
}) {
  const action = post ? updatePostAction.bind(null, post.id) : createPostAction;
  const [state, formAction] = useActionState(action, IDLE_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-void px-4 py-3 md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/45">
            {post ? "Editing article" : "New article"}
          </span>
          {post && <span className="max-w-[220px] truncate text-[12px] text-soft">{post.title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {post?.status === "published" && (
            <Link
              href={`/journal/${post.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 border border-line px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/60 transition-colors hover:text-soft"
            >
              <ExternalLink className="size-3" /> View
            </Link>
          )}
          <SubmitButton label={post ? "Save article" : "Create article"} />
        </div>
      </div>

      <FormAlert state={state} />

      <SectionCard title="Article" description="Headline, slug, category and publication state.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="title"
            label="Title"
            defaultValue={post?.title}
            required
            error={errors.title}
            className="md:col-span-2"
          />
          <SlugField defaultValue={post?.slug} error={errors.slug} />
          <SelectField
            name="category_id"
            label="Category"
            defaultValue={post?.category_id ?? ""}
            options={[
              { value: "", label: "Uncategorised" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
          />
          <SelectField
            name="status"
            label="Publication state"
            defaultValue={post?.status ?? "draft"}
            options={[
              { value: "draft", label: "Draft — hidden from the public site" },
              { value: "published", label: "Published — live immediately" },
            ]}
          />
          <TextField
            name="published_at"
            label="Publication date"
            type="datetime-local"
            defaultValue={toDateTimeInput(post?.published_at)}
            hint="Leave empty to use the moment you publish."
          />
          <TextField
            name="reading_minutes"
            label="Reading time (minutes)"
            type="number"
            min={1}
            defaultValue={post?.reading_minutes ?? ""}
            hint="Optional — a rough estimate is fine."
          />
          <div className="md:col-span-2">
            <CheckboxField
              name="featured"
              label="Featured article"
              description="Used by the homepage journal section when no featured slot is set."
              defaultChecked={post?.featured ?? false}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Cover artwork" description="Direct ImgBB image URL.">
        <ImageUrlField
          name="cover_url"
          label="Cover image"
          defaultValue={post?.cover_url}
          aspect="hero"
        />
      </SectionCard>

      <SectionCard title="Content" description="Markdown supported, with a live preview.">
        <div className="space-y-5">
          <TextareaField
            name="excerpt"
            label="Short description"
            rows={3}
            defaultValue={post?.excerpt}
            hint="Shown on cards, in search results and in social previews."
          />
          <MarkdownField
            name="content"
            label="Full article"
            defaultValue={post?.content}
            rows={20}
          />
        </div>
      </SectionCard>

      <div className="flex items-center justify-between border-t border-line pt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/35">
          {post ? `Status: ${post.status}` : "New entries start as drafts unless published"}
        </p>
        <SubmitButton label={post ? "Save article" : "Create article"} />
      </div>
    </form>
  );
}
