-- ============================================================
-- Ocham Records — 0004 service_role grants
--
-- Why this exists
-- ---------------
-- 0002 granted table privileges to `anon` and `authenticated` but never to
-- `service_role`, on the assumption that Supabase's default privileges would
-- cover it. On this project they did not: every table came back 42501
-- "permission denied for table ..." when read with the service key.
--
-- RLS and grants are two separate gates. `service_role` bypasses RLS, but it
-- still needs the grant to open the table at all — which is why the demo
-- intake could not write a submission even though it holds the secret key.
--
-- This is safe in the way the other grants are not: the service key is never
-- sent to a browser (lib/supabase/admin.ts is `server-only`), and it is the
-- role Supabase itself expects to be unrestricted.
-- ============================================================

grant usage on schema public to service_role;

grant select, insert, update, delete
  on public.admins, public.artists, public.releases, public.tracks,
     public.events, public.posts, public.submissions
  to service_role;

-- New tables added later should not have to remember this.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
