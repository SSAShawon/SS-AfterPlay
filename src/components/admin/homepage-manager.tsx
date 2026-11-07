"use client";

import { useActionState } from "react";

import { saveFeaturedSlotAction } from "@/lib/actions/settings";
import { IDLE_STATE } from "@/lib/action-state";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FeaturedContent, FeaturedSlot } from "@/lib/types";

interface Option {
  id: string;
  title: string;
}

function SlotForm({
  slot,
  title,
  description,
  options,
  current,
  placeholder,
}: {
  slot: FeaturedSlot;
  title: string;
  description: string;
  options: Option[];
  current: FeaturedContent | undefined;
  placeholder: string;
}) {
  const [state, formAction] = useActionState(saveFeaturedSlotAction, IDLE_STATE);

  const currentId =
    slot === "featured_memory"
      ? current?.memory_id
      : slot === "featured_journal"
        ? current?.journal_post_id
        : current?.game_id;

  const gameMode = slot === "hero" || slot === "featured_game";

  return (
    <section className="border border-line bg-charcoal">
      <header className="border-b border-line px-5 py-4">
        <h2 className="font-serif text-lg text-soft">{title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-silver/50">{description}</p>
      </header>

      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="slot" value={slot} />

        <div>
          <Label htmlFor={`slot-${slot}`}>Entry</Label>
          <select
            id={`slot-${slot}`}
            name="entity_id"
            defaultValue={currentId ?? ""}
            className="mt-2 h-11 w-full border border-line bg-void px-3 text-sm text-soft focus:border-blood/60 focus:outline-none"
          >
            <option value="">— Clear this slot —</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </div>

        {gameMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`headline-${slot}`}>Headline override</Label>
              <Input
                id={`headline-${slot}`}
                name="headline"
                defaultValue={current?.headline ?? ""}
                placeholder={placeholder}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor={`subline-${slot}`}>Subline override</Label>
              <Input
                id={`subline-${slot}`}
                name="subline"
                defaultValue={current?.subline ?? ""}
                placeholder="Optional supporting line"
                className="mt-2"
              />
            </div>
          </div>
        )}

        <FormAlert state={state} />

        <SubmitButton label="Update slot" />
      </form>
    </section>
  );
}

export function HomepageManager({
  featured,
  games,
  posts,
  memories,
}: {
  featured: FeaturedContent[];
  games: Option[];
  posts: Option[];
  memories: Option[];
}) {
  const hero = featured.find((item) => item.slot === "hero");
  const journal = featured.find((item) => item.slot === "featured_journal");
  const memory = featured.find((item) => item.slot === "featured_memory");

  return (
    <div className="space-y-5">
      <SlotForm
        slot="hero"
        title="Hero feature"
        description="The game whose artwork sits behind the homepage headline. Headline and subline override the settings defaults."
        options={games}
        current={hero}
        placeholder="The game ends. The memories don't."
      />
      <SlotForm
        slot="featured_journal"
        title="Featured journal entry"
        description="The large essay shown in the homepage journal section."
        options={posts}
        current={journal}
        placeholder=""
      />
      <SlotForm
        slot="featured_memory"
        title="Featured memory"
        description="The memory highlighted at the top of the memories page and homepage."
        options={memories}
        current={memory}
        placeholder=""
      />

      <section className="border border-line bg-charcoal p-5">
        <h2 className="font-serif text-lg text-soft">How the homepage is assembled</h2>
        <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-silver/50">
          <li>· Hero artwork and headline come from this page.</li>
          <li>· “Featured” games (set inside each game) populate the featured strip.</li>
          <li>· Recently completed games are the four most recent completion dates.</li>
          <li>· Latest journal entries and memories are pulled automatically.</li>
          <li>· Empty slots fall back to the most recent published content.</li>
        </ul>
      </section>
    </div>
  );
}
