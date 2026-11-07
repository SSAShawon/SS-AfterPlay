-- ═══════════════════════════════════════════════════════════════════════════
-- SS AFTERPLAY — database schema (part 1 / 3)
-- Core content tables. Run order: 20261107000001_schema.sql →
-- 20261107000002_rls.sql → 20261107000003_seed.sql (optional sample archive)
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── helpers ────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Single-administrator registry. Only rows created server-side (service role)
-- can exist here, and every write policy depends on membership.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

-- ── games ──────────────────────────────────────────────────────────────────
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  developer text,
  publisher text,
  release_year integer check (release_year between 1958 and 2100),
  genres text[] not null default '{}',
  platforms text[] not null default '{}',
  status text not null default 'backlog'
    check (status in ('completed', 'playing', 'on_hold', 'dropped', 'backlog')),
  rating numeric(3, 1) check (rating >= 0 and rating <= 10),
  cover_url text,
  hero_url text,
  summary text,
  setting text,
  gameplay_type text,
  main_theme text,
  why_archived text,
  storyline text,
  playtime_hours numeric(6, 1) check (playtime_hours >= 0),
  started_on date,
  completed_on date,
  featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint games_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists games_status_idx on public.games (status);
create index if not exists games_published_idx on public.games (is_published, published_at desc);
create index if not exists games_featured_idx on public.games (featured) where featured;
create index if not exists games_title_idx on public.games (lower(title));
create index if not exists games_release_year_idx on public.games (release_year);

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- ── chapters ───────────────────────────────────────────────────────────────
create table if not exists public.game_chapters (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  title text not null,
  summary text,
  important_events text,
  story_developments text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_chapters_game_idx
  on public.game_chapters (game_id, sort_order);

drop trigger if exists game_chapters_set_updated_at on public.game_chapters;
create trigger game_chapters_set_updated_at
  before update on public.game_chapters
  for each row execute function public.set_updated_at();

-- ── characters ─────────────────────────────────────────────────────────────
create table if not exists public.game_characters (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  name text not null,
  portrait_url text,
  role text,
  personality text,
  background text,
  development text,
  analysis text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_characters_game_idx
  on public.game_characters (game_id, sort_order);

drop trigger if exists game_characters_set_updated_at on public.game_characters;
create trigger game_characters_set_updated_at
  before update on public.game_characters
  for each row execute function public.set_updated_at();

-- ── memorable moments (per game) ───────────────────────────────────────────
create table if not exists public.game_memorable_moments (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  title text not null,
  description text,
  why_memorable text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_moments_game_idx
  on public.game_memorable_moments (game_id, sort_order);

drop trigger if exists game_moments_set_updated_at on public.game_memorable_moments;
create trigger game_moments_set_updated_at
  before update on public.game_memorable_moments
  for each row execute function public.set_updated_at();

-- ── technical review criteria (gameplay, graphics, … configurable) ─────────
create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  category text not null,
  label text not null,
  score numeric(3, 1) check (score >= 0 and score <= 10),
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, category)
);

create index if not exists game_reviews_game_idx
  on public.game_reviews (game_id, sort_order);

drop trigger if exists game_reviews_set_updated_at on public.game_reviews;
create trigger game_reviews_set_updated_at
  before update on public.game_reviews
  for each row execute function public.set_updated_at();

-- ── related games ──────────────────────────────────────────────────────────
create table if not exists public.game_related (
  game_id uuid not null references public.games (id) on delete cascade,
  related_game_id uuid not null references public.games (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (game_id, related_game_id),
  constraint game_related_not_self check (game_id <> related_game_id)
);

-- ── journal ────────────────────────────────────────────────────────────────
create table if not exists public.journal_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_categories_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

drop trigger if exists journal_categories_set_updated_at on public.journal_categories;
create trigger journal_categories_set_updated_at
  before update on public.journal_categories
  for each row execute function public.set_updated_at();

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  category_id uuid references public.journal_categories (id) on delete set null,
  reading_minutes integer check (reading_minutes > 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists journal_posts_status_idx
  on public.journal_posts (status, published_at desc);
create index if not exists journal_posts_category_idx on public.journal_posts (category_id);
create index if not exists journal_posts_featured_idx
  on public.journal_posts (featured) where featured;

drop trigger if exists journal_posts_set_updated_at on public.journal_posts;
create trigger journal_posts_set_updated_at
  before update on public.journal_posts
  for each row execute function public.set_updated_at();

-- ── memories (curated archive moments) ─────────────────────────────────────
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game_id uuid references public.games (id) on delete set null,
  description text,
  timeframe text,
  occurred_on date,
  image_url text,
  featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_published_idx
  on public.memories (is_published, sort_order);

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- ── rankings ───────────────────────────────────────────────────────────────
create table if not exists public.ranking_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ranking_categories_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

drop trigger if exists ranking_categories_set_updated_at on public.ranking_categories;
create trigger ranking_categories_set_updated_at
  before update on public.ranking_categories
  for each row execute function public.set_updated_at();

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.ranking_categories (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  position integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, game_id)
);

create index if not exists rankings_category_idx
  on public.rankings (category_id, position);

drop trigger if exists rankings_set_updated_at on public.rankings;
create trigger rankings_set_updated_at
  before update on public.rankings
  for each row execute function public.set_updated_at();

-- ── timeline ───────────────────────────────────────────────────────────────
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_type text not null default 'milestone'
    check (event_type in ('game_started', 'game_completed', 'milestone', 'journal', 'other')),
  game_id uuid references public.games (id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timeline_events_date_idx
  on public.timeline_events (event_date desc);
create index if not exists timeline_events_type_idx on public.timeline_events (event_type);

drop trigger if exists timeline_events_set_updated_at on public.timeline_events;
create trigger timeline_events_set_updated_at
  before update on public.timeline_events
  for each row execute function public.set_updated_at();

-- ── site settings (single row) ─────────────────────────────────────────────
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'SS AFTERPLAY',
  tagline text not null default 'The game ends. The memories don''t.',
  hero_kicker text,
  hero_headline text,
  hero_subline text,
  about_content text,
  footer_note text,
  contact_email text,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ── featured content (homepage curation) ───────────────────────────────────
create table if not exists public.featured_content (
  id uuid primary key default gen_random_uuid(),
  slot text not null check (slot in ('hero', 'featured_game', 'featured_memory', 'featured_journal')),
  game_id uuid references public.games (id) on delete cascade,
  memory_id uuid references public.memories (id) on delete cascade,
  journal_post_id uuid references public.journal_posts (id) on delete cascade,
  headline text,
  subline text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists featured_content_slot_idx
  on public.featured_content (slot, sort_order);

drop trigger if exists featured_content_set_updated_at on public.featured_content;
create trigger featured_content_set_updated_at
  before update on public.featured_content
  for each row execute function public.set_updated_at();
