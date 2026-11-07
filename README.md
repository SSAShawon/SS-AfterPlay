# SS AFTERPLAY

> **The game ends. The memories don't.**

A cinematic gaming archive and journal: a personal record of the games that were finished, the ones that were abandoned, the chapters that mattered, and the moments that stayed. Built as a real, editable publication — not a static prototype.

- **Live site:** https://ss-afterplay.vercel.app
- **Admin:** https://ss-afterplay.vercel.app/admin/login
- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui primitives · Supabase (Postgres, Auth, RLS) · Vercel

---

## 1. What is in here

### Public experience

| Route | Purpose |
| --- | --- |
| `/` | Cinematic hero, featured game, featured essay, latest memories, collection strip, journal, stats |
| `/collection` | The full shelf — search, status filters, platform filters, sort, pagination |
| `/games/[slug]` | The game record: nine sections, sticky section nav, spoiler-gated storyline, chapter breakdown, characters, memorable moments, per-category review, verdict, related games, reading progress |
| `/journal` | Essays with category filters and pagination |
| `/journal/[slug]` | Long-form article, reading progress, related posts |
| `/memories` | The memories collection — the emotional centre of the archive |
| `/rankings` | Ranked lists across custom categories |
| `/timeline` | The chronological record of playing, finishing, and writing |
| `/about` | What the archive is and how it is made |
| `/search` | Full search results page (the overlay is available on every page with `⌘K` / `Ctrl K`) |
| Global search overlay | Games, journal entries, characters, storyline excerpts, memories |

**Intro sequence.** A one-time full-screen opener: embers drifting over black, a logo sweep, the tagline, `PREPARING YOUR ARCHIVE…`, then `ENTER ARCHIVE →`. Skippable at any moment, respects `prefers-reduced-motion`, stores the choice in `localStorage`, never runs on the admin side, and can be replayed from the footer. The homepage renders behind it so there is no second load.

**Design system.** Dark-only. `#08090C` void, `#14161B` slab, `#D94747` blood, `#A5A8B0` silver, `#F4F4F5` soft. Editorial serif display + geometric sans body + mono for metadata. Hairline rules, generous negative space, no rounded card grids, no glassmorphism, no neon, no heavy gradients.

### Admin (`/admin`)

| Route | Purpose |
| --- | --- |
| `/admin/login` | Email + password only. No sign-up, no social login, no guest access |
| `/admin` | Overview: counts, publishing state, recent activity, quick actions |
| `/admin/games` | All games incl. drafts — search, status filter, publish/feature toggles |
| `/admin/games/new` · `/admin/games/[id]` | Full game editor: core record, storyline, review criteria, verdict, chapters, characters, memorable moments, reviews, related games |
| `/admin/journal` | Essays with publish/feature toggles |
| `/admin/journal/new` · `/admin/journal/[id]` | Markdown editor with live preview, category and cover |
| `/admin/journal/categories` | Journal categories |
| `/admin/memories` | Memories: add, edit, reorder, feature, publish |
| `/admin/rankings` | Ranking categories and ordered entries with inline notes |
| `/admin/timeline` | Timeline events: date, type, related game, publish |
| `/admin/homepage` | Hero slot, featured essay, featured memory |
| `/admin/settings` | Site identity, hero defaults, About content, footer + social links, password change |

Every write is a Server Action that `revalidatePath`s the affected public routes, so edits are visible on the live site immediately — no redeploy, no cache-busting.

---

## 2. Architecture

```
src/
├─ app/
│  ├─ (site)/                 # public route group — shared header/footer/intro
│  │  ├─ page.tsx             # homepage
│  │  ├─ collection/          # shelf
│  │  ├─ games/[slug]/        # the game record
│  │  ├─ journal/             # index + [slug]
│  │  ├─ memories|rankings|timeline|about|search/
│  ├─ admin/
│  │  ├─ layout.tsx           # noindex shell
│  │  ├─ login/               # unauthenticated gate
│  │  └─ (dashboard)/         # requireAdmin() + sidebar
│  ├─ layout.tsx  globals.css  icon.svg
│  ├─ not-found.tsx  error.tsx  loading.tsx
│  ├─ robots.ts  sitemap.ts
├─ components/
│  ├─ ui/                     # shadcn-style primitives
│  ├─ public/                 # intro, header, cards, spoiler gate, progress, search
│  └─ admin/                  # forms, children editors, managers
├─ lib/
│  ├─ supabase/{client,server,public}.ts
│  ├─ auth.ts                 # requireAdmin(), getAdminUser()
│  ├─ actions/                # server actions per entity
│  ├─ queries/                # read helpers per entity
│  ├─ types.ts  validation.ts  action-state.ts  utils.ts
└─ middleware.ts              # session refresh + /admin gate
supabase/migrations/          # schema + RLS
scripts/create-admin.mjs      # the only place the service role key is used
```

**Three Supabase clients, deliberately separated**

1. `supabase/public.ts` — publishable key, used by public reads. RLS returns published rows only.
2. `supabase/server.ts` — publishable key bound to the request's cookies, used by admin reads/writes and Server Actions. `is_admin()` decides what it may touch.
3. `create-admin.mjs` — service-role key, local/CI only. **The application never imports the service-role key anywhere.**

**Auth.** Supabase Auth, email + password, one account. `src/middleware.ts` refreshes the session cookie and gates `/admin/*` server-side (redirecting to `/admin/login?next=…`, and bouncing an authenticated admin away from the login screen). `requireAdmin()` re-checks on every dashboard render, so a missing/expired session never reaches a page. Sign-up is disabled at the Supabase project level.

---

## 3. Database

Normalised, no mega-JSON content columns:

| Table | Notes |
| --- | --- |
| `games` | PK, unique `slug`, title, platform, developer, genre, status, scores, dates, cover/banner URLs, storyline (spoiler text), review copy, five verdict fields, publish/feature flags, timestamps |
| `game_chapters` | FK → games, ordered, title, summary, body |
| `game_characters` | FK → games, name, role, description, image |
| `game_memorable_moments` | FK → games, title, description, chapter reference, image |
| `game_reviews` | FK → games, per-criterion score + note (Gameplay, Story, Visuals, Sound, Performance, Longevity…) |
| `journal_posts` | Unique `slug`, title, excerpt, body (markdown), category FK, cover, read time, status, featured, published_at |
| `journal_categories` | Name, unique slug, description |
| `memories` | Title, description, timeframe/exact date, optional game FK, image, featured, published, sort order |
| `ranking_categories` | Name, unique slug, description, sort order |
| `rankings` | FK → ranking_categories + games, unique (category, game), position, note |
| `timeline_events` | Date, title, description, event type, optional game FK, published |
| `site_settings` | Single row (`id = 1`): identity, hero defaults, About content, footer, social links |
| `featured_content` | Slot → entity mapping (`hero`, `featured_journal`, `featured_memory`) |
| `games_related` | Join table, game ↔ related game |
| `admins` | `user_id` (FK → `auth.users`), email — the allow-list |

Indexes cover publish/feature flags, slugs, foreign keys, ordering columns, and `published_at`.

**RLS.** Every table has RLS enabled. Anonymous and authenticated readers see published rows only (and children of published parents). Full read/write is granted exclusively to `public.is_admin()` — a `SECURITY DEFINER` function that checks the `admins` table for `auth.uid()`.

---

## 4. Local setup

```bash
git clone https://github.com/SSAShawon/SS-AfterPlay.git
cd SS-AfterPlay
npm install
cp .env.example .env.local   # then fill in the values
```

`.env.local`:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable / anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # only for scripts, never shipped
ADMIN_EMAIL=samsul261103@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Apply the migrations** — in order, in the Supabase SQL Editor (or `supabase db push`):

```
supabase/migrations/20261107000001_schema.sql
supabase/migrations/20261107000002_rls.sql
```

**Create the administrator** (sign-up is disabled, so this is the only path):

```bash
npm run create-admin -- --email samsul261103@gmail.com --password 'a-long-password'
```

The script creates or updates the Auth user with a confirmed email and registers it in `public.admins`. Then:

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm start          # serve the production build
```

---

## 5. Using the admin

1. Sign in at `/admin/login`.
2. **Games** — create a game, fill the core record, write the full storyline (hidden behind a spoiler gate on the public page), set per-criterion review scores, write the verdict, then add chapters, characters, moments and reviews from the same page and link related games. Save as draft, publish when ready.
3. **Journal** — markdown with a live preview tab; drafts never appear publicly.
4. **Memories / Timeline / Rankings** — inline add/edit/reorder; the arrows swap positions rather than renumbering everything.
5. **Homepage** — choose the hero game, the featured essay and the featured memory. Empty slots fall back to the newest published content.
6. **Settings** — identity, hero defaults, About copy, footer note, social links, password.
7. Changes appear on the public site immediately.

**Images** are pasted as ImgBB direct URLs (`https://i.ibb.co/…/file.jpg`). The admin shows a live preview and validates the URL shape; a designed placeholder is used when an image is missing or fails to load. No Supabase Storage, no uploads.

---

## 6. Deploying

1. Push the repository to GitHub.
2. Import it into Vercel (framework preset: Next.js, no build overrides).
3. Add the environment variables from `.env.local` in **Project → Settings → Environment Variables** (`SUPABASE_SERVICE_ROLE_KEY` is not needed at runtime — add it only if you intend to run maintenance scripts from CI).
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL so canonical links, Open Graph images and the sitemap are absolute.
5. Deploy. Sign in at `/admin/login` and confirm a draft is invisible while logged out.

`robots.txt` disallows `/admin` and `/search`; `sitemap.xml` lists static routes plus every published game and journal entry, and regenerates on each request.

---

## 7. Notes

- **Drafts are never public.** Enforced twice: in queries (`is_published` / `status = 'published'`) and in RLS.
- **No secrets in the repo.** `.env.local` is git-ignored; `.env.example` holds placeholders only.
- **No fake data in the UI.** If a section has no content it renders a designed empty state, not placeholder lorem.
- **Accessibility.** Semantic landmarks, visible focus rings, keyboard-navigable menus and dialogs, labelled controls, reduced-motion support, and an intro that can be skipped or permanently disabled.
