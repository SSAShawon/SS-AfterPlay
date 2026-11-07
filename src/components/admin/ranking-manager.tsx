"use client";

import * as React from "react";
import { useActionState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, X } from "lucide-react";

import {
  addRankingEntryAction,
  deleteRankingCategoryAction,
  moveRankingEntryAction,
  removeRankingEntryAction,
  saveRankingCategoryAction,
  updateRankingNoteAction,
} from "@/lib/actions/rankings";
import { IDLE_STATE } from "@/lib/action-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import type { Ranking, RankingCategory } from "@/lib/types";

type Entry = Ranking & { games: { title: string; slug: string; cover_url: string | null } | null };

function CategoryForm({ category, onDone }: { category?: RankingCategory; onDone?: () => void }) {
  const [state, formAction] = useActionState(saveRankingCategoryAction, IDLE_STATE);
  const [name, setName] = React.useState(category?.title ?? "");
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [touched, setTouched] = React.useState(Boolean(category));

  React.useEffect(() => {
    if (state.status === "success" && onDone) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`rtitle-${category?.id ?? "new"}`}>Title</Label>
          <Input
            id={`rtitle-${category?.id ?? "new"}`}
            name="title"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!touched) setSlug(slugify(event.target.value));
            }}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor={`rslug-${category?.id ?? "new"}`}>Slug</Label>
          <Input
            id={`rslug-${category?.id ?? "new"}`}
            name="slug"
            value={slug}
            onChange={(event) => {
              setTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className="mt-2"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`rdesc-${category?.id ?? "new"}`}>Description</Label>
          <Input
            id={`rdesc-${category?.id ?? "new"}`}
            name="description"
            defaultValue={category?.description ?? ""}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor={`rorder-${category?.id ?? "new"}`}>Sort order</Label>
          <Input
            id={`rorder-${category?.id ?? "new"}`}
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className="mt-2"
          />
        </div>
      </div>

      <FormAlert state={state} />

      <div className="flex items-center gap-2">
        <SubmitButton label={category ? "Save category" : "Add category"} />
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

export function RankingManager({
  categories,
  entries,
  games,
}: {
  categories: RankingCategory[];
  entries: Entry[];
  games: { id: string; title: string }[];
}) {
  const [adding, setAdding] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="space-y-5">
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
          {adding ? "Cancel" : "New ranking category"}
        </button>
      </div>

      {adding && (
        <div className="border border-blood/30 bg-blood/[0.03] p-4">
          <CategoryForm onDone={() => setAdding(false)} />
        </div>
      )}

      {categories.map((category) => {
        const categoryEntries = entries
          .filter((entry) => entry.category_id === category.id)
          .sort((a, b) => a.position - b.position);
        const isOpen = openId === category.id;
        const alreadyRanked = new Set(categoryEntries.map((entry) => entry.game_id));
        const available = games.filter((game) => !alreadyRanked.has(game.id));

        return (
          <section key={category.id} className="border border-line bg-charcoal">
            <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-soft">{category.title}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                  /{category.slug} · {categoryEntries.length} entries · order {category.sort_order}
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
                action={deleteRankingCategoryAction}
                id={category.id}
                variant="icon"
                title={`Delete “${category.title}”?`}
                description="The category and all of its ranked entries will be removed."
              />
            </header>

            {isOpen && (
              <div className="border-b border-line bg-white/[0.015] p-4">
                <CategoryForm category={category} onDone={() => setOpenId(null)} />
              </div>
            )}

            <ul className="divide-y divide-white/[0.06]">
              {categoryEntries.map((entry, index) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <span className="w-6 font-serif text-lg text-silver/40">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-soft">
                    {entry.games?.title ?? "Unknown game"}
                  </span>

                  <form action={updateRankingNoteAction} className="hidden items-center gap-1 lg:flex">
                    <input type="hidden" name="id" value={entry.id} />
                    <input
                      name="note"
                      defaultValue={entry.note ?? ""}
                      placeholder="Short note…"
                      className="h-8 w-56 border border-line bg-transparent px-2 text-[11px] text-silver/70 placeholder:text-silver/25 focus:border-blood/50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="h-8 border border-line px-2 font-mono text-[8px] uppercase tracking-[0.14em] text-silver/50 hover:text-soft"
                    >
                      Save
                    </button>
                  </form>

                  <div className="flex items-center gap-1">
                    {(["up", "down"] as const).map((direction) => (
                      <form key={direction} action={moveRankingEntryAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="direction" value={direction} />
                        <button
                          type="submit"
                          aria-label={`Move ${direction}`}
                          className="flex size-7 items-center justify-center border border-line text-silver/50 hover:text-soft"
                        >
                          {direction === "up" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )}
                        </button>
                      </form>
                    ))}
                    <form action={removeRankingEntryAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <button
                        type="submit"
                        aria-label="Remove from ranking"
                        className="flex size-7 items-center justify-center border border-line text-silver/50 hover:border-blood/50 hover:text-blood"
                      >
                        <X className="size-3" />
                      </button>
                    </form>
                  </div>
                </li>
              ))}

              {categoryEntries.length === 0 && (
                <li className="px-4 py-3 text-[11px] text-silver/40">No games ranked yet.</li>
              )}
            </ul>

            {available.length > 0 && (
              <form
                action={addRankingEntryAction}
                className="flex flex-col gap-2 border-t border-line px-4 py-3 sm:flex-row"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <select
                  name="game_id"
                  required
                  defaultValue=""
                  className="h-9 flex-1 border border-line bg-void px-2 text-[12px] text-soft focus:border-blood/60 focus:outline-none"
                >
                  <option value="" disabled>
                    Add a game to this ranking…
                  </option>
                  {available.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center gap-1.5 border border-line-strong px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-soft hover:border-blood/50"
                >
                  <Plus className="size-3" /> Add
                </button>
              </form>
            )}
          </section>
        );
      })}

      {categories.length === 0 && (
        <p className="border border-dashed border-line px-4 py-6 text-center text-[12px] text-silver/45">
          No ranking categories yet.
        </p>
      )}
    </div>
  );
}
