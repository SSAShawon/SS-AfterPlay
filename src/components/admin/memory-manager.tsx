"use client";

import * as React from "react";
import { useActionState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, X } from "lucide-react";

import {
  deleteMemoryAction,
  moveMemoryAction,
  saveMemoryAction,
  toggleMemoryFlagAction,
} from "@/lib/actions/memories";
import { IDLE_STATE } from "@/lib/action-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FlagToggle } from "@/components/admin/toggle-form";
import { FormAlert, ImageUrlField, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, pad } from "@/lib/utils";
import type { Memory } from "@/lib/types";

function MemoryForm({ memory, games, onDone }: { memory?: Memory; games: { id: string; title: string }[]; onDone?: () => void }) {
  const [state, formAction] = useActionState(saveMemoryAction, IDLE_STATE);

  React.useEffect(() => {
    if (state.status === "success" && onDone) onDone();
  }, [state, onDone]);

  const id = memory?.id ?? "new";

  return (
    <form action={formAction} className="space-y-4">
      {memory && <input type="hidden" name="id" value={memory.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor={`title-${id}`}>Moment title</Label>
          <Input id={`title-${id}`} name="title" defaultValue={memory?.title ?? ""} className="mt-2" required />
        </div>

        <div>
          <Label htmlFor={`game-${id}`}>Related game</Label>
          <select
            id={`game-${id}`}
            name="game_id"
            defaultValue={memory?.game_id ?? ""}
            className="mt-2 h-11 w-full border border-white/12 bg-void px-3 text-sm text-soft focus:border-blood/60 focus:outline-none"
          >
            <option value="">No game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor={`timeframe-${id}`}>Timeframe</Label>
          <Input
            id={`timeframe-${id}`}
            name="timeframe"
            defaultValue={memory?.timeframe ?? ""}
            placeholder="Spring 2023"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor={`occurred-${id}`}>Exact date (optional)</Label>
          <Input
            id={`occurred-${id}`}
            name="occurred_on"
            type="date"
            defaultValue={memory?.occurred_on?.slice(0, 10) ?? ""}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor={`order-${id}`}>Sort order</Label>
          <Input
            id={`order-${id}`}
            name="sort_order"
            type="number"
            defaultValue={memory?.sort_order ?? ""}
            className="mt-2"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor={`description-${id}`}>Description</Label>
          <Textarea
            id={`description-${id}`}
            name="description"
            rows={4}
            defaultValue={memory?.description ?? ""}
            className="mt-2"
          />
        </div>

        <div className="md:col-span-2">
          <ImageUrlField
            name="image_url"
            label="Memory artwork (optional)"
            defaultValue={memory?.image_url}
            aspect="hero"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 border border-white/10 p-3">
          <input type="checkbox" name="featured" defaultChecked={memory?.featured} className="accent-[#D94747]" />
          <span className="text-[12px] text-soft">Featured memory</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 border border-white/10 p-3">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={memory?.is_published}
            className="accent-[#D94747]"
          />
          <span className="text-[12px] text-soft">Published</span>
        </label>
      </div>

      <FormAlert state={state} />

      <div className="flex items-center gap-2">
        <SubmitButton label={memory ? "Save memory" : "Add memory"} />
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

export function MemoryManager({
  memories,
  games,
}: {
  memories: Memory[];
  games: { id: string; title: string }[];
}) {
  const [adding, setAdding] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAdding((value) => !value);
            setOpenId(null);
          }}
          className="inline-flex h-9 items-center gap-1.5 border border-white/15 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-soft transition-colors hover:border-blood/50 hover:bg-blood/[0.06]"
        >
          {adding ? <X className="size-3" /> : <Plus className="size-3" />}
          {adding ? "Cancel" : "New memory"}
        </button>
      </div>

      {adding && (
        <div className="border border-blood/30 bg-blood/[0.03] p-4">
          <MemoryForm games={games} onDone={() => setAdding(false)} />
        </div>
      )}

      <ul className="space-y-2">
        {memories.map((memory, index) => {
          const isOpen = openId === memory.id;
          return (
            <li key={memory.id} className="border border-white/10 bg-[#0b0c10]">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="font-mono text-[9px] text-blood/60">{pad(index + 1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-soft">{memory.title}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                    {memory.timeframe ?? memory.occurred_on ?? "No date"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <FlagToggle
                    action={toggleMemoryFlagAction}
                    id={memory.id}
                    field="is_published"
                    value={memory.is_published}
                    labelOn="Published"
                    labelOff="Draft"
                  />
                  <FlagToggle
                    action={toggleMemoryFlagAction}
                    id={memory.id}
                    field="featured"
                    value={memory.featured}
                    labelOn="★"
                    labelOff="☆"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {(["up", "down"] as const).map((direction) => (
                    <form key={direction} action={moveMemoryAction}>
                      <input type="hidden" name="id" value={memory.id} />
                      <input type="hidden" name="direction" value={direction} />
                      <button
                        type="submit"
                        aria-label={`Move ${direction}`}
                        className="flex size-8 items-center justify-center border border-white/12 text-silver/50 transition-colors hover:text-soft"
                      >
                        {direction === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      </button>
                    </form>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : memory.id)}
                    aria-label="Edit memory"
                    className={cn(
                      "flex size-8 items-center justify-center border border-white/12 transition-colors",
                      isOpen ? "bg-soft/[0.06] text-soft" : "text-silver/60 hover:text-soft",
                    )}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmDelete
                    action={deleteMemoryAction}
                    id={memory.id}
                    variant="icon"
                    title={`Delete “${memory.title}”?`}
                    description="This memory will be removed from the public archive."
                  />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/10 p-4">
                  <MemoryForm memory={memory} games={games} onDone={() => setOpenId(null)} />
                </div>
              )}
            </li>
          );
        })}

        {memories.length === 0 && (
          <li className="border border-dashed border-white/12 px-4 py-6 text-center text-[12px] text-silver/45">
            No memories yet.
          </li>
        )}
      </ul>
    </div>
  );
}
