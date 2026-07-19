-- ============================================================
-- Ocham Records — 0002 row level security
--
-- Shape of the rules:
--   * The public can read published rows and nothing else.
--   * Only admins write, ever.
--   * Submissions are invisible to the public entirely — the pitch form
--     and the status lookup both go through server routes holding the
--     service role key, which bypasses RLS. Nothing touching demos is
--     reachable from a browser.
-- ============================================================

alter table public.admins      enable row level security;
alter table public.artists     enable row level security;
alter table public.releases    enable row level security;
alter table public.tracks      enable row level security;
alter table public.events      enable row level security;
alter table public.posts       enable row level security;
alter table public.submissions enable row level security;

-- Base grants. RLS filters rows; grants decide whether the role may look at
-- the table at all. Both are required.
grant usage on schema public to anon, authenticated;
grant select on public.artists, public.releases, public.tracks,
                 public.events, public.posts
  to anon, authenticated;
grant select, insert, update, delete on public.artists, public.releases,
                 public.tracks, public.events, public.posts, public.submissions
  to authenticated;
grant select on public.admins to authenticated;

-- ------------------------------------------------------------
-- admins — readable only to yourself, writable only from the dashboard
-- or a service-role connection. There is deliberately no policy that lets
-- an admin add another admin from the app.
-- ------------------------------------------------------------
create policy "admins read own row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- artists
-- ------------------------------------------------------------
create policy "artists public read published"
  on public.artists for select
  to anon, authenticated
  using (published);

create policy "artists admin read all"
  on public.artists for select
  to authenticated
  using (public.is_admin());

create policy "artists admin write"
  on public.artists for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- releases
-- ------------------------------------------------------------
create policy "releases public read published"
  on public.releases for select
  to anon, authenticated
  using (published);

create policy "releases admin read all"
  on public.releases for select
  to authenticated
  using (public.is_admin());

create policy "releases admin write"
  on public.releases for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- tracks — visibility is inherited from the parent release, so an
-- unpublished record's tracklist can't leak ahead of announcement.
-- ------------------------------------------------------------
create policy "tracks public read published"
  on public.tracks for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.releases r
      where r.id = tracks.release_id and r.published
    )
  );

create policy "tracks admin read all"
  on public.tracks for select
  to authenticated
  using (public.is_admin());

create policy "tracks admin write"
  on public.tracks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- events
-- ------------------------------------------------------------
create policy "events public read published"
  on public.events for select
  to anon, authenticated
  using (published);

create policy "events admin read all"
  on public.events for select
  to authenticated
  using (public.is_admin());

create policy "events admin write"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- posts — a future published_at stays hidden, so notes can be scheduled
-- ------------------------------------------------------------
create policy "posts public read published"
  on public.posts for select
  to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy "posts admin read all"
  on public.posts for select
  to authenticated
  using (public.is_admin());

create policy "posts admin write"
  on public.posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- submissions — admin only. No anon policy of any kind: an anon insert
-- policy would turn the pitch form into an unauthenticated write endpoint
-- pointed straight at the database.
-- ------------------------------------------------------------
create policy "submissions admin read"
  on public.submissions for select
  to authenticated
  using (public.is_admin());

create policy "submissions admin write"
  on public.submissions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
