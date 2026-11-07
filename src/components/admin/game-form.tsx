"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { createGameAction, updateGameAction } from "@/lib/actions/games";
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
import { GAME_STATUSES, GAME_STATUS_LABELS, type Game } from "@/lib/types";

export function GameForm({ game }: { game?: Game }) {
  const action = game ? updateGameAction.bind(null, game.id) : createGameAction;
  const [state, formAction] = useActionState(action, IDLE_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-void px-4 py-3 md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/45">
            {game ? "Editing game" : "New game"}
          </span>
          {game && (
            <span className="max-w-[220px] truncate text-[12px] text-soft">{game.title}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {game?.is_published && (
            <Link
              href={`/games/${game.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 border border-white/12 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/60 transition-colors hover:border-white/25 hover:text-soft"
            >
              <ExternalLink className="size-3" /> View
            </Link>
          )}
          <SubmitButton label={game ? "Save game" : "Create game"} />
        </div>
      </div>

      <FormAlert state={state} />

      <SectionCard
        id="identity"
        title="Identity"
        description="Title, URL slug and how the entry appears across the archive."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="title"
            label="Title"
            defaultValue={game?.title}
            required
            error={errors.title}
            placeholder="Red Dead Redemption 2"
          />
          <SlugField defaultValue={game?.slug} error={errors.slug} />
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={game?.tagline}
            placeholder="An elegy for the outlaw age."
            className="md:col-span-2"
          />
          <SelectField
            name="status"
            label="Playing status"
            defaultValue={game?.status ?? "backlog"}
            options={GAME_STATUSES.map((status) => ({
              value: status,
              label: GAME_STATUS_LABELS[status],
            }))}
          />
          <TextField
            name="rating"
            label="Personal rating (0–10)"
            type="number"
            step="0.1"
            min={0}
            max={10}
            defaultValue={game?.rating ?? ""}
            error={errors.rating}
            placeholder="9.8"
          />
          <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
            <CheckboxField
              name="is_published"
              label="Published"
              description="Visible on the public archive. Unpublishing hides it immediately."
              defaultChecked={game?.is_published ?? false}
            />
            <CheckboxField
              name="featured"
              label="Featured"
              description="Shown in featured sections on the homepage."
              defaultChecked={game?.featured ?? false}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="metadata"
        title="Metadata"
        description="Release details, playtime and the dates that anchor the entry in the timeline."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="developer" label="Developer" defaultValue={game?.developer} />
          <TextField name="publisher" label="Publisher" defaultValue={game?.publisher} />
          <TextField
            name="release_year"
            label="Release year"
            type="number"
            min={1958}
            max={2100}
            defaultValue={game?.release_year ?? ""}
            error={errors.release_year}
          />
          <TextField
            name="playtime_hours"
            label="Playtime (hours)"
            type="number"
            step="0.5"
            min={0}
            defaultValue={game?.playtime_hours ?? ""}
          />
          <TextField
            name="genres"
            label="Genres"
            defaultValue={game?.genres?.join(", ")}
            hint="Comma separated — e.g. Action-Adventure, Open World, Western"
          />
          <TextField
            name="platforms"
            label="Platforms"
            defaultValue={game?.platforms?.join(", ")}
            hint="Comma separated — e.g. PS5, PC"
          />
          <TextField
            name="started_on"
            label="Started on"
            type="date"
            defaultValue={game?.started_on?.slice(0, 10) ?? ""}
          />
          <TextField
            name="completed_on"
            label="Completed on"
            type="date"
            defaultValue={game?.completed_on?.slice(0, 10) ?? ""}
          />
        </div>
      </SectionCard>

      <SectionCard
        id="artwork"
        title="Artwork"
        description="Paste ImgBB direct image URLs. A live preview validates each URL before saving."
      >
        <div className="space-y-6">
          <ImageUrlField name="cover_url" label="Cover artwork" defaultValue={game?.cover_url} aspect="cover" />
          <ImageUrlField
            name="hero_url"
            label="Hero artwork"
            defaultValue={game?.hero_url}
            aspect="hero"
            hint="Wide cinematic image used behind the game page title."
          />
        </div>
      </SectionCard>

      <SectionCard
        id="overview"
        title="Game overview"
        description="Summary, setting, gameplay type, theme and why this game belongs in the archive."
      >
        <div className="space-y-5">
          <MarkdownField
            name="summary"
            label="Summary"
            defaultValue={game?.summary}
            rows={6}
            hint="A short editorial summary. Markdown supported."
          />
          <div className="grid gap-5 md:grid-cols-3">
            <TextareaField name="setting" label="Setting" rows={4} defaultValue={game?.setting} />
            <TextareaField
              name="gameplay_type"
              label="Gameplay type"
              rows={4}
              defaultValue={game?.gameplay_type}
            />
            <TextareaField
              name="main_theme"
              label="Main story theme"
              rows={4}
              defaultValue={game?.main_theme}
            />
          </div>
          <TextareaField
            name="why_archived"
            label="Why it is in the archive"
            rows={4}
            defaultValue={game?.why_archived}
            hint="The personal reason this entry exists. Displayed as a pull quote."
          />
        </div>
      </SectionCard>

      <SectionCard
        id="story"
        title="Complete storyline"
        description="Full plot documentation. Shown publicly behind a spoiler gate."
      >
        <MarkdownField
          name="storyline"
          label="Storyline"
          defaultValue={game?.storyline}
          rows={16}
          hint="Chapters, characters and plot can all be managed below this form, once the game is saved."
        />
      </SectionCard>

      <SectionCard
        id="verdict"
        title="Final verdict"
        description="The fields that make the recommendation feel like a person wrote it."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextareaField
            name="best_aspect"
            label="Best aspect"
            rows={3}
            defaultValue={game?.best_aspect}
          />
          <TextareaField
            name="biggest_weakness"
            label="Biggest weakness"
            rows={3}
            defaultValue={game?.biggest_weakness}
          />
          <TextareaField
            name="recommendation"
            label="Recommendation"
            rows={3}
            defaultValue={game?.recommendation}
          />
          <TextareaField
            name="replay_recommendation"
            label="Replay recommendation"
            rows={3}
            defaultValue={game?.replay_recommendation}
          />
          <div className="md:col-span-2">
            <MarkdownField
              name="final_verdict"
              label="Final personal verdict"
              defaultValue={game?.final_verdict}
              rows={6}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-between border-t border-white/10 pt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-silver/35">
          Changes publish instantly
        </p>
        <SubmitButton label={game ? "Save game" : "Create game"} />
      </div>
    </form>
  );
}
