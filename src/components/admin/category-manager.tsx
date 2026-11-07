"use client";

import * as React from "react";
import { useActionState } from "react";
import { Pencil, Plus, X } from "lucide-react";

import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/journal";
import { IDLE_STATE } from "@/lib/action-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import type { JournalCategory } from "@/lib/types";

function CategoryForm({
  category,
  onDone,
}: {
  category?: JournalCategory;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(saveCategoryAction, IDLE_STATE);
  const [name, setName] = React.useState(category?.name ?? "");
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(category));

  React.useEffect(() => {
    if (state.status === "success" && onDone) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`name-${category?.id ?? "new"}`}>Name</Label>
          <Input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor={`slug-${category?.id ?? "new"}`}>Slug</Label>
          <Input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className="mt-2"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`description-${category?.id ?? "new"}`}>Description</Label>
          <Input
            id={`description-${category?.id ?? "new"}`}
            name="description"
            defaultValue={category?.description ?? ""}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor={`order-${category?.id ?? "new"}`}>Sort order</Label>
          <Input
            id={`order-${category?.id ?? "new"}`}
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className="mt-2"
          />
        </div>
      </div>

      <FormAlert state={state} />

      <div className="flex items-center gap-2">
        <SubmitButton label={category ? "Save" : "Add category"} />
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="h-10 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50 hover:text-soft"
          >
            Close
          </button>
        )}
      </div>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: JournalCategory[] }) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAdding((value) => !value);
            setOpenId(null);
          }}
          className="inline-flex h-9 items-center gap-1.5 border border-line-strong px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-soft transition-colors hover:border-blood/50 hover:bg-blood/[0.06]"
        >
          {adding ? <X className="size-3" /> : <Plus className="size-3" />}
          {adding ? "Cancel" : "New category"}
        </button>
      </div>

      {adding && (
        <div className="border border-blood/30 bg-blood/[0.03] p-4">
          <CategoryForm onDone={() => setAdding(false)} />
        </div>
      )}

      <ul className="space-y-2">
        {categories.map((category) => {
          const isOpen = openId === category.id;
          return (
            <li key={category.id} className="border border-line bg-charcoal">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-soft">{category.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                    /{category.slug} · order {category.sort_order}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : category.id)}
                  aria-label="Edit category"
                  className="flex size-8 items-center justify-center border border-line text-silver/60 transition-colors hover:text-soft"
                >
                  <Pencil className="size-3.5" />
                </button>
                <ConfirmDelete
                  action={deleteCategoryAction}
                  id={category.id}
                  variant="icon"
                  title={`Delete “${category.name}”?`}
                  description="Articles in this category will become uncategorised."
                />
              </div>
              {isOpen && (
                <div className="border-t border-line p-4">
                  <CategoryForm category={category} onDone={() => setOpenId(null)} />
                </div>
              )}
            </li>
          );
        })}
        {categories.length === 0 && (
          <li className="border border-dashed border-line px-4 py-6 text-center text-[12px] text-silver/45">
            No categories yet.
          </li>
        )}
      </ul>
    </div>
  );
}
