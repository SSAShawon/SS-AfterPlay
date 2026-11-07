import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ChildrenEditor } from "@/components/admin/children-editor";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { GameForm } from "@/components/admin/game-form";
import { SectionCard } from "@/components/admin/form-fields";
import {
  addRelatedGameAction,
  removeRelatedGameAction,
} from "@/lib/actions/children";
import { deleteGameAction } from "@/lib/actions/games";
import { getAdminGame, listAdminGames } from "@/lib/queries/admin";
import { GAME_STATUS_LABELS, STORY_CRITERIA } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;
  const [data, allGames] = await Promise.all([getAdminGame(id), listAdminGames()]);

  if (!data) notFound();

  const { game, chapters, characters, moments, reviews, relatedIds } = data;
  const relatedGames = relatedIds
    .map((relatedId) => allGames.rows.find((row) => row.id === relatedId))
    .filter(Boolean);
  const available = allGames.rows.filter(
    (row) => row.id !== game.id && !relatedIds.includes(row.id),
  );

  return (
    <>
      <AdminHeader
        kicker="Content / Games"
        title={game.title}
        description={`${GAME_STATUS_LABELS[game.status]} · ${game.is_published ? "Published" : "Draft"} · Updated ${new Date(game.updated_at).toLocaleDateString("en-GB")}`}
        actions={
          <>
            <Link
              href="/admin/games"
              className="inline-flex h-10 items-center border border-line-strong px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-silver/70 transition-colors hover:text-soft"
            >
              All games
            </Link>
            {game.is_published && (
              <Link
                href={`/games/${game.slug}`}
                target="_blank"
                className="inline-flex h-10 items-center gap-2 border border-line-strong px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-soft transition-colors hover:border-blood/50"
              >
                View <ExternalLink className="size-3" />
              </Link>
            )}
            <ConfirmDelete
              action={deleteGameAction}
              id={game.id}
              title={`Delete “${game.title}”?`}
              description="All chapters, characters, moments, reviews and ranking references will be deleted. This cannot be undone."
            />
          </>
        }
      />

      <nav className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-3">
        {[
          { href: "#identity", label: "Game details" },
          { href: "#chapters", label: `Chapters (${chapters.length})` },
          { href: "#characters", label: `Characters (${characters.length})` },
          { href: "#moments", label: `Moments (${moments.length})` },
          { href: "#reviews", label: `Craft (${reviews.length})` },
          { href: "#related", label: `Related (${relatedGames.length})` },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50 transition-colors hover:text-soft"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div id="identity" className="scroll-mt-24">
        <GameForm game={game} />
      </div>

      <div className="mt-10 space-y-6">
        <SectionCard
          id="chapters"
          title="Chapter-wise story breakdown"
          description="Ordered as they appear on the public archive page. Use the arrows to reorder."
        >
          <ChildrenEditor
            kind="chapter"
            gameId={game.id}
            gameSlug={game.slug}
            items={chapters}
            titleField="title"
            subtitleField="summary"
            singular="Chapter"
            plural="Chapters"
            fields={[
              { name: "title", label: "Chapter title", type: "text", span: 2 },
              { name: "summary", label: "Chapter description", type: "textarea", rows: 5, span: 2 },
              { name: "important_events", label: "Important events", type: "textarea", rows: 4 },
              { name: "story_developments", label: "Major story developments", type: "textarea", rows: 4 },
            ]}
          />
        </SectionCard>

        <SectionCard
          id="characters"
          title="Characters & analysis"
          description="Portrait URLs, personality, background, development and personal analysis."
        >
          <ChildrenEditor
            kind="character"
            gameId={game.id}
            gameSlug={game.slug}
            items={characters}
            titleField="name"
            subtitleField="role"
            singular="Character"
            plural="Characters"
            fields={[
              { name: "name", label: "Character name", type: "text" },
              { name: "role", label: "Role in the story", type: "text" },
              {
                name: "portrait_url",
                label: "Portrait URL",
                type: "text",
                span: 2,
                hint: "Direct ImgBB image URL (https://i.ibb.co/…). Leave empty to show a placeholder.",
              },
              { name: "personality", label: "Personality", type: "textarea" },
              { name: "background", label: "Background", type: "textarea" },
              { name: "development", label: "Character development", type: "textarea" },
              { name: "analysis", label: "Personal analysis", type: "textarea", rows: 4, span: 2 },
            ]}
          />
        </SectionCard>

        <SectionCard
          id="moments"
          title="Best & most memorable moments"
          description="The scenes worth documenting, with an optional screenshot URL."
        >
          <ChildrenEditor
            kind="moment"
            gameId={game.id}
            gameSlug={game.slug}
            items={moments}
            titleField="title"
            subtitleField="description"
            singular="Moment"
            plural="Moments"
            fields={[
              { name: "title", label: "Moment title", type: "text", span: 2 },
              { name: "description", label: "Detailed description", type: "textarea", rows: 4, span: 2 },
              { name: "why_memorable", label: "Why it is memorable", type: "textarea", rows: 4, span: 2 },
              { name: "image_url", label: "Image URL (optional)", type: "text", span: 2 },
            ]}
          />
        </SectionCard>

        <SectionCard
          id="reviews"
          title="Gameplay & technical review"
          description="One row per criterion. Suggested keys: gameplay, graphics, sound, music, open_world, storytelling — add your own if needed."
        >
          <ChildrenEditor
            kind="review"
            gameId={game.id}
            gameSlug={game.slug}
            items={reviews}
            titleField="label"
            subtitleField="body"
            singular="Criterion"
            plural="Criteria"
            scoreField="score"
            fields={[
              {
                name: "category",
                label: "Category key",
                type: "text",
                placeholder: "gameplay",
                hint: STORY_CRITERIA.map((item) => item.value).join(", "),
              },
              { name: "label", label: "Display label", type: "text", placeholder: "Gameplay" },
              { name: "score", label: "Score (0–10)", type: "number" },
              { name: "body", label: "Review", type: "textarea", rows: 5, span: 2 },
            ]}
          />
        </SectionCard>

        <SectionCard
          id="related"
          title="Related games"
          description="Shown at the end of the public archive page."
        >
          <div className="space-y-4">
            <ul className="divide-y divide-white/[0.06] border border-line">
              {relatedGames.length === 0 && (
                <li className="px-4 py-4 text-[12px] text-silver/45">No related games selected.</li>
              )}
              {relatedGames.map((related) =>
                related ? (
                  <li key={related.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="min-w-0 truncate text-[12px] text-soft">{related.title}</span>
                    <form action={removeRelatedGameAction}>
                      <input type="hidden" name="game_id" value={game.id} />
                      <input type="hidden" name="related_game_id" value={related.id} />
                      <input type="hidden" name="slug" value={game.slug} />
                      <button
                        type="submit"
                        aria-label={`Remove ${related.title}`}
                        className="flex size-8 items-center justify-center border border-line text-silver/50 transition-colors hover:border-blood/50 hover:text-blood"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </li>
                ) : null,
              )}
            </ul>

            {available.length > 0 && (
              <form action={addRelatedGameAction} className="flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="game_id" value={game.id} />
                <input type="hidden" name="slug" value={game.slug} />
                <select
                  name="related_game_id"
                  required
                  defaultValue=""
                  className="h-10 flex-1 border border-line bg-void px-3 text-[12px] text-soft focus:border-blood/60 focus:outline-none"
                >
                  <option value="" disabled>
                    Choose a game to relate…
                  </option>
                  {available.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-1.5 border border-line-strong px-4 font-mono text-[9px] uppercase tracking-[0.16em] text-soft transition-colors hover:border-blood/50 hover:bg-blood/[0.06]"
                >
                  <Plus className="size-3" /> Add
                </button>
              </form>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
