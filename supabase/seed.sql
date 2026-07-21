-- ============================================================
-- Ocham Records — seed data
--
-- Placeholder content so the site renders before real assets exist.
-- Copy is written to be *replaced*, not kept. Fixed UUIDs mean re-running
-- this updates rows instead of duplicating them.
--
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- Artist
-- ------------------------------------------------------------
insert into public.artists (id, slug, name, role, bio, portrait_url, links, sort_order, published)
values (
  '11111111-1111-4111-8111-111111111111',
  'mats-westbroek',
  'Mats Westbroek',
  'Producer',
  -- E'' string so the \n\n paragraph break is stored as real newlines.
  E'Mats Westbroek is an Amsterdam-based DJ and producer creating melodic house with deeper grooves and a funkier edge. His tracks blend warm analog synths with organic instruments, all shaped through creative processing and driven by groovy drums. The result is a melodic sound that feels warm, human, and built for the dancefloor.\n\nHis sets revolve around his own original music and have taken him to clubs and venues across the Netherlands, Indonesia (Bali), Costa Rica, and Bonaire. His music has also been played at renowned events and venues including Burning Man, Tomorrowland, Ultra, and Pacha Ibiza.',
  '/artists/mats-westbroek.jpg',
  '{"instagram": "https://www.instagram.com/matswestbroek", "spotify": "https://open.spotify.com/artist/22bQJrUFkEHoC4Srw85AuA", "soundcloud": "https://soundcloud.com/matswestbroek"}'::jsonb,  -- awaiting real profile URLs
  0,
  true
)
on conflict (id) do update set
  slug         = excluded.slug,
  name         = excluded.name,
  role         = excluded.role,
  bio          = excluded.bio,
  portrait_url = excluded.portrait_url,
  links     = excluded.links,
  published = excluded.published;

-- ------------------------------------------------------------
-- Releases
-- ------------------------------------------------------------
insert into public.releases (
  id, slug, cat_no, title, artist_id, release_date, format,
  liner_notes, credits, stream_links, published
)
values
  (
    '22222222-2222-4222-8222-222222222221',
    'tidal-drift',
    'OCH001',
    'Tidal Drift',
    '11111111-1111-4111-8111-111111111111',
    '2026-03-14',
    '12" / Digital',
    'Placeholder liner note. Two or three sentences about how the record came together — a room, a machine, a season. This is the part of a release page nobody else bothers to write, which is exactly why it is worth writing.',
    '[{"role": "Written & produced by", "name": "Mats Westbroek"},
      {"role": "Mixed by", "name": "TBC"},
      {"role": "Mastered by", "name": "TBC"},
      {"role": "Artwork by", "name": "TBC"}]'::jsonb,
    '{"spotify": "", "bandcamp": "", "apple": ""}'::jsonb,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'salt-and-static',
    'OCH002',
    'Salt & Static',
    '11111111-1111-4111-8111-111111111111',
    '2026-06-20',
    'Digital',
    'Placeholder liner note for the second release.',
    '[{"role": "Written & produced by", "name": "Mats Westbroek"}]'::jsonb,
    '{"spotify": "", "bandcamp": ""}'::jsonb,
    true
  )
on conflict (id) do update set
  slug         = excluded.slug,
  cat_no       = excluded.cat_no,
  title        = excluded.title,
  release_date = excluded.release_date,
  format       = excluded.format,
  liner_notes  = excluded.liner_notes,
  credits      = excluded.credits,
  stream_links = excluded.stream_links,
  published    = excluded.published;

-- ------------------------------------------------------------
-- Tracks
-- ------------------------------------------------------------
insert into public.tracks (id, release_id, position, title, duration_seconds)
values
  ('33333333-3333-4333-8333-333333333331', '22222222-2222-4222-8222-222222222221', 1, 'Tidal Drift',        382),
  ('33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222221', 2, 'Low Water',          415),
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222221', 3, 'Undertow',           298),
  ('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222221', 4, 'Tidal Drift (Reprise)', 204),
  ('33333333-3333-4333-8333-333333333335', '22222222-2222-4222-8222-222222222222', 1, 'Salt',               356),
  ('33333333-3333-4333-8333-333333333336', '22222222-2222-4222-8222-222222222222', 2, 'Static',             401)
on conflict (id) do update set
  position         = excluded.position,
  title            = excluded.title,
  duration_seconds = excluded.duration_seconds;

-- ------------------------------------------------------------
-- Events
--
-- One past, one upcoming. A dates page with only future entries looks empty
-- on a quiet month; the past list is the track record that carries it.
-- ------------------------------------------------------------
insert into public.events (id, title, artist_id, venue, city, country, starts_at, ticket_url, published)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'Ocham 001 — Release Night',
    '11111111-1111-4111-8111-111111111111',
    'Placeholder Venue',
    'Amsterdam',
    'NL',
    '2026-03-20 21:00:00+01',
    '',
    true
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'Placeholder Festival',
    '11111111-1111-4111-8111-111111111111',
    'Placeholder Stage',
    'Rotterdam',
    'NL',
    '2026-08-15 18:00:00+02',
    '',
    true
  )
on conflict (id) do update set
  title      = excluded.title,
  venue      = excluded.venue,
  city       = excluded.city,
  starts_at  = excluded.starts_at,
  published  = excluded.published;

-- ------------------------------------------------------------
-- Field notes
-- ------------------------------------------------------------
insert into public.posts (id, slug, title, excerpt, body, published_at)
values (
  '55555555-5555-4555-8555-555555555551',
  'why-we-release-slowly',
  'Why we release slowly',
  'A short note on the pace of the label.',
  'Placeholder body copy. Field notes exist so the site has a pulse between releases — a paragraph and a photo is enough. Anything longer than four paragraphs belongs somewhere else.',
  '2026-02-01 12:00:00+01'
)
on conflict (id) do update set
  title        = excluded.title,
  excerpt      = excluded.excerpt,
  body         = excluded.body,
  published_at = excluded.published_at;
