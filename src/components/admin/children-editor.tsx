"use client";

import * as React from "react";
import { useActionState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus, X } from "lucide-react";

import { saveChildAction } from "@/lib/actions/children";
import { IDLE_STATE } from "@/lib/action-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, pad } from "@/lib/utils";
import { deleteChildAction, moveChildAction } from "@/lib/actions/children";

export type ChildKind = "chapter" | "character" | "moment" | "review";

export interface ChildFieldSpec {
  name: string;
  label: string;
  type: "text" | "textarea" | "number";
  rows?: number;
  hint?: string;
  placeholder?: string;
  span?: 1 | 2;
}

export interface ChildRecord {
  id: string;
  sort_order: number;
  [key: string]: unknown;
}

export function ChildrenEditor({
  kind,
  gameId,
  gameSlug,
  items,
  fields,
  titleField,
  subtitleField,
  singular,
  plural,
  scoreField,
}: {
  kind: ChildKind;
  gameId: string;
  gameSlug: string;
  items: { id: string; sort_order: number }[];
  fields: ChildFieldSpec[];
  titleField: string;
  subtitleField?: string;
  singular: string;
  plural: string;
  scoreField?: string;
}) {
  const [adding, setAdding] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/45">
          {items.length} {items.length === 1 ? singular.toLowerCase() : plural.toLowerCase()}
        </p>
        <button
          type="button"
          onClick={() => {
            setAdding((value) => !value);
            setOpenId(null);
          }}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 border px-3 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
            adding
              ? "border-blood/50 text-blood"
              : "border-white/15 text-soft hover:border-blood/50 hover:bg-blood/[0.06]",
          )}
        >
          {adding ? <X className="size-3" /> : <Plus className="size-3" />}
          {adding ? "Cancel" : `Add ${singular.toLowerCase()}`}
        </button>
      </div>

      {adding && (
        <div className="border border-blood/30 bg-blood/[0.03] p-4">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-blood/80">
            New {singular.toLowerCase()}
          </p>
          <ChildForm
            kind={kind}
            gameId={gameId}
            gameSlug={gameSlug}
            fields={fields}
            intent="create"
            onDone={() => setAdding(false)}
          />
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="border border-dashed border-white/12 px-4 py-6 text-center text-[12px] text-silver/45">
          No {plural.toLowerCase()} yet.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => {
          const record = item as ChildRecord;
          const isOpen = openId === item.id;
          const title = String(record[titleField] ?? "Untitled");
          const subtitle = subtitleField ? String(record[subtitleField] ?? "") : "";

          return (
            <li key={item.id} className="border border-white/10 bg-[#0b0c10]">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-[9px] text-blood/60">{pad(index + 1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-soft">{title}</p>
                  {subtitle && (
                    <p className="truncate text-[10px] text-silver/40">{subtitle.slice(0, 120)}</p>
                  )}
                </div>

                {scoreField && record[scoreField] !== null && record[scoreField] !== undefined && (
                  <span className="font-mono text-[10px] text-silver/50">
                    {String(record[scoreField])}/10
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <MoveButton kind={kind} id={item.id} gameId={gameId} gameSlug={gameSlug} direction="up" />
                  <MoveButton kind={kind} id={item.id} gameId={gameId} gameSlug={gameSlug} direction="down" />
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-label={isOpen ? "Close editor" : "Edit"}
                    className="flex size-8 items-center justify-center border border-white/12 text-silver/60 transition-colors hover:border-white/25 hover:text-soft"
                  >
                    {isOpen ? <ChevronDown className="size-3.5" /> : <Pencil className="size-3.5" />}
                  </button>
                  <ConfirmDelete
                    action={deleteChildAction}
                    id={item.id}
                    variant="icon"
                    title={`Delete this ${singular.toLowerCase()}?`}
                    description="This removes the record permanently. The public page updates immediately."
                    extraFields={{ kind, game_id: gameId, slug: gameSlug }}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/10 p-4">
                  <ChildForm
                    kind={kind}
                    gameId={gameId}
                    gameSlug={gameSlug}
                    fields={fields}
                    intent="update"
                    record={record}
                    onDone={() => setOpenId(null)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MoveButton({
  kind,
  id,
  gameId,
  gameSlug,
  direction,
}: {
  kind: ChildKind;
  id: string;
  gameId: string;
  gameSlug: string;
  direction: "up" | "down";
}) {
  return (
    <form action={moveChildAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="game_id" value={gameId} />
      <input type="hidden" name="slug" value={gameSlug} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        aria-label={`Move ${direction}`}
        className="flex size-8 items-center justify-center border border-white/12 text-silver/50 transition-colors hover:border-white/25 hover:text-soft"
      >
        {direction === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      </button>
    </form>
  );
}

function ChildForm({
  kind,
  gameId,
  gameSlug,
  fields,
  intent,
  record,
  onDone,
}: {
  kind: ChildKind;
  gameId: string;
  gameSlug: string;
  fields: ChildFieldSpec[];
  intent: "create" | "update";
  record?: ChildRecord;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(saveChildAction.bind(null, kind), IDLE_STATE);

  React.useEffect(() => {
    if (state.status === "success" && onDone) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="game_id" value={gameId} />
      <input type="hidden" name="slug" value={gameSlug} />
      <input type="hidden" name="intent" value={intent} />
      {record && <input type="hidden" name="id" value={record.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.span === 2 ? "md:col-span-2" : ""}>
            <Label htmlFor={`${kind}-${field.name}-${record?.id ?? "new"}`}>{field.label}</Label>
            <div className="mt-2">
              {field.type === "textarea" ? (
                <Textarea
                  id={`${kind}-${field.name}-${record?.id ?? "new"}`}
                  name={field.name}
                  rows={field.rows ?? 3}
                  defaultValue={(record?.[field.name] as string) ?? ""}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  id={`${kind}-${field.name}-${record?.id ?? "new"}`}
                  name={field.name}
                  type={field.type}
                  step={field.type === "number" ? "0.1" : undefined}
                  defaultValue={(record?.[field.name] as string) ?? ""}
                  placeholder={field.placeholder}
                />
              )}
            </div>
            {field.hint && (
              <p className="mt-1 text-[10px] leading-relaxed text-silver/40">{field.hint}</p>
            )}
          </div>
        ))}
      </div>

      <FormAlert state={state} />

      <div className="flex items-center gap-2">
        <SubmitButton label={intent === "create" ? "Add" : "Save"} />
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
