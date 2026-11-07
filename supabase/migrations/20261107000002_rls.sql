-- ═══════════════════════════════════════════════════════════════════════════
-- SS AFTERPLAY — row level security (part 2 / 3)
-- Public (anon): read published content only.
-- Authenticated: full CRUD, but *only* members of public.admins.
-- Service role bypasses RLS entirely and is never used in the browser.
-- ═══════════════════════════════════════════════════════════════════════════

revoke all on schema public from anon;
grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public.admins enable row level security;
alter table public.games enable row level security;
alter table public.game_chapters enable row level security;
alter table public.game_characters enable row level security;
alter table public.game_memorable_moments enable row level security;
alter table public.game_reviews enable row level security;
alter table public.game_related enable row level security;
alter table public.journal_categories enable row level security;
alter table public.journal_posts enable row level security;
alter table public.memories enable row level security;
alter table public.ranking_categories enable row level security;
alter table public.rankings enable row level security;
alter table public.timeline_events enable row level security;
alter table public.site_settings enable row level security;
alter table public.featured_content enable row level security;

-- admins: no anon/authenticated policies → only service role can read/write.
-- (is_admin() is SECURITY DEFINER, so policies may consult it safely.)

-- ── games ──────────────────────────────────────────────────────────────────
drop policy if exists "games_public_read" on public.games;
create policy "games_public_read" on public.games
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists "games_admin_all" on public.games;
create policy "games_admin_all" on public.games
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── game children ──────────────────────────────────────────────────────────
drop policy if exists "game_chapters_public_read" on public.game_chapters;
create policy "game_chapters_public_read" on public.game_chapters
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g where g.id = game_chapters.game_id and g.is_published
  ));

drop policy if exists "game_chapters_admin_all" on public.game_chapters;
create policy "game_chapters_admin_all" on public.game_chapters
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "game_characters_public_read" on public.game_characters;
create policy "game_characters_public_read" on public.game_characters
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g where g.id = game_characters.game_id and g.is_published
  ));

drop policy if exists "game_characters_admin_all" on public.game_characters;
create policy "game_characters_admin_all" on public.game_characters
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "game_moments_public_read" on public.game_memorable_moments;
create policy "game_moments_public_read" on public.game_memorable_moments
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g
    where g.id = game_memorable_moments.game_id and g.is_published
  ));

drop policy if exists "game_moments_admin_all" on public.game_memorable_moments;
create policy "game_moments_admin_all" on public.game_memorable_moments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "game_reviews_public_read" on public.game_reviews;
create policy "game_reviews_public_read" on public.game_reviews
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g where g.id = game_reviews.game_id and g.is_published
  ));

drop policy if exists "game_reviews_admin_all" on public.game_reviews;
create policy "game_reviews_admin_all" on public.game_reviews
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "game_related_public_read" on public.game_related;
create policy "game_related_public_read" on public.game_related
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g where g.id = game_related.game_id and g.is_published
  ));

drop policy if exists "game_related_admin_all" on public.game_related;
create policy "game_related_admin_all" on public.game_related
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── journal ────────────────────────────────────────────────────────────────
drop policy if exists "journal_categories_public_read" on public.journal_categories;
create policy "journal_categories_public_read" on public.journal_categories
  for select to anon, authenticated using (true);

drop policy if exists "journal_categories_admin_all" on public.journal_categories;
create policy "journal_categories_admin_all" on public.journal_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "journal_posts_public_read" on public.journal_posts;
create policy "journal_posts_public_read" on public.journal_posts
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "journal_posts_admin_all" on public.journal_posts;
create policy "journal_posts_admin_all" on public.journal_posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── memories ───────────────────────────────────────────────────────────────
drop policy if exists "memories_public_read" on public.memories;
create policy "memories_public_read" on public.memories
  for select to anon, authenticated using (is_published = true);

drop policy if exists "memories_admin_all" on public.memories;
create policy "memories_admin_all" on public.memories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── rankings ───────────────────────────────────────────────────────────────
drop policy if exists "ranking_categories_public_read" on public.ranking_categories;
create policy "ranking_categories_public_read" on public.ranking_categories
  for select to anon, authenticated using (true);

drop policy if exists "ranking_categories_admin_all" on public.ranking_categories;
create policy "ranking_categories_admin_all" on public.ranking_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "rankings_public_read" on public.rankings;
create policy "rankings_public_read" on public.rankings
  for select to anon, authenticated
  using (exists (
    select 1 from public.games g where g.id = rankings.game_id and g.is_published
  ));

drop policy if exists "rankings_admin_all" on public.rankings;
create policy "rankings_admin_all" on public.rankings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── timeline ───────────────────────────────────────────────────────────────
drop policy if exists "timeline_public_read" on public.timeline_events;
create policy "timeline_public_read" on public.timeline_events
  for select to anon, authenticated using (is_published = true);

drop policy if exists "timeline_admin_all" on public.timeline_events;
create policy "timeline_admin_all" on public.timeline_events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── settings & curation ────────────────────────────────────────────────────
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings_admin_all" on public.site_settings;
create policy "settings_admin_all" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "featured_public_read" on public.featured_content;
create policy "featured_public_read" on public.featured_content
  for select to anon, authenticated using (is_active = true);

drop policy if exists "featured_admin_all" on public.featured_content;
create policy "featured_admin_all" on public.featured_content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
