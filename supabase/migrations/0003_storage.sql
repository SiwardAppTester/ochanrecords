-- ============================================================
-- Ocham Records — 0003 storage
--
-- Two buckets with opposite postures:
--   media — public. Artwork and portraits are meant to be hotlinked and
--           cached on a CDN.
--   demos — private, and strictly so. These are unreleased tracks by people
--           who trusted the label with them. A public demos bucket means any
--           unreleased demo is one guessed URL away from the open internet.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media',
    'media',
    true,
    10485760,  -- 10 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'demos',
    'demos',
    false,
    52428800,  -- 50 MB
    array['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aiff',
          'audio/x-aiff', 'audio/flac', 'audio/mp4', 'audio/aac']
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- media
-- ------------------------------------------------------------
create policy "media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ------------------------------------------------------------
-- demos
--
-- Read is admin-only. Uploads arrive through a server route on the service
-- role key, so there is intentionally no insert policy here — a browser
-- cannot put anything in this bucket directly, which keeps it from being
-- used as free anonymous file hosting.
--
-- The admin panel plays demos through short-lived signed URLs.
-- ------------------------------------------------------------
create policy "demos admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'demos' and public.is_admin());

create policy "demos admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'demos' and public.is_admin());
