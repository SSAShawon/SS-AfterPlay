"use client";

import * as React from "react";
import { useActionState } from "react";
import { Pencil, Plus, X } from "lucide-react";

import {
  deleteTimelineEventAction,
  saveTimelineEventAction,
  toggleTimelineEventAction,
} from "@/lib/actions/timeline";
import { IDLE_STATE } from "@/lib/action-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FlagToggle } from "@/components/admin/toggle-form";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { TIMELINE_EVENT_LABELS, TIMELINE_EVENT_TYPES, type TimelineEvent } from "@/lib/types";

function EventForm({
  event,
  games,
  onDone,
}: {
  event?: TimelineEvent;
  games: { id: string; title: string }[];
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(saveTimelineEventAction, IDLE_STATE);

  React.useEffect(() => {
    if (state.status === "success" && onDone) onDone();
  }, [state, onDone]);

  const id = event?.id ?? "new";

  return (
    <form action={formAction} className="space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor={`title-${id}`}>Title</Label>
          <Input id={`title-${id}`} name="title" defaultValue={event?.title ?? ""} className="mt-2" required />
        </div>
        <div>
          <Label htmlFor={`date-${id}`}>Date</Label>
          <Input
            id={`date-${id}`}
            name="event_date"
            type="date"
            defaultValue={event?.event_date?.slice(0, 10) ?? ""}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor={`type-${id}`}>Event type</Label>
          <select
            id={`type-${id}`}
            name="event_type"
            defaultValue={event?.event_type ?? "milestone"}
            className="mt-2 h-11 w-full border border-white/12 bg-void px-3 text-sm text-soft focus:border-blood/60 focus:outline-none"
          >
            {TIMELINE_EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {TIMELINE_EVENT_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor={`game-${id}`}>Related game (optional)</Label>
          <select
            id={`game-${id}`}
            name="game_id"
            defaultValue={event?.game_id ?? ""}
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
        <div className="md:col-span-2">
          <Label htmlFor={`description-${id}`}>Description</Label>
          <Textarea
            id={`description-${id}`}
            name="description"
            rows={3}
            defaultValue={event?.description ?? ""}
            className="mt-2"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 border border-white/10 p-3">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={event?.is_published}
          className="accent-[#D94747]"
        />
        <span className="text-[12px] text-soft">Published</span>
      </label>

      <FormAlert state={state} />

      <div className="flex items-center gap-2">
        <SubmitButton label={event ? "Save event" : "Add event"} />
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

export function TimelineManager({
  events,
  games,
}: {
  events: TimelineEvent[];
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
          {adding ? "Cancel" : "New event"}
        </button>
      </div>

      {adding && (
        <div className="border border-blood/30 bg-blood/[0.03] p-4">
          <EventForm games={games} onDone={() => setAdding(false)} />
        </div>
      )}

      <ul className="space-y-2">
        {events.map((event) => {
          const isOpen = openId === event.id;
          return (
            <li key={event.id} className="border border-white/10 bg-[#0b0c10]">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-20 shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-silver/40">
                  {formatDate(event.event_date, "short")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-soft">{event.title}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                    {TIMELINE_EVENT_LABELS[event.event_type]}
                  </p>
                </div>

                <FlagToggle
                  action={toggleTimelineEventAction}
                  id={event.id}
                  field="is_published"
                  value={event.is_published}
                  labelOn="Published"
                  labelOff="Draft"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : event.id)}
                    aria-label="Edit event"
                    className="flex size-8 items-center justify-center border border-white/12 text-silver/60 transition-colors hover:text-soft"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmDelete
                    action={deleteTimelineEventAction}
                    id={event.id}
                    variant="icon"
                    title={`Delete “${event.title}”?`}
                    description="The event will be removed from the timeline."
                  />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/10 p-4">
                  <EventForm event={event} games={games} onDone={() => setOpenId(null)} />
                </div>
              )}
            </li>
          );
        })}

        {events.length === 0 && (
          <li className="border border-dashed border-white/12 px-4 py-6 text-center text-[12px] text-silver/45">
            No timeline events yet.
          </li>
        )}
      </ul>
    </div>
  );
}
