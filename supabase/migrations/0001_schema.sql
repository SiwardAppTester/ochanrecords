-- ============================================================
-- Ocham Records — 0001 schema
-- Tables, types, triggers. No security here; RLS lands in 0002.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Admin roster
--
-- Membership is a table rather than a JWT claim: claims are baked into a
-- token at sign-in, so revoking access would mean waiting for the token to
-- expire. A table revokes instantly and is readable from every policy.
-- ------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- `security definer` so the function can read public.admins from inside a
-- policy on public.admins without recursing into that same policy.
-- `search_path` is pinned to defeat search-path hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- updated_at maintenance
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Artists
-- ------------------------------------------------------------
create table public.artists (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  role         text,                        -- "Producer / DJ"
  bio          text,
  portrait_url text,
  links        jsonb not null default '{}'::jsonb,  -- {instagram, spotify, ...}
  sort_order   integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index artists_published_idx on public.artists (published, sort_order);

create trigger artists_touch
  before update on public.artists
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Releases
-- ------------------------------------------------------------
create table public.releases (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  cat_no       text not null unique,        -- OCH001
  title        text not null,
  artist_id    uuid not null references public.artists (id) on delete restrict,
  release_date date,
  format       text,                        -- '12" / Digital'
  artwork_url  text,
  liner_notes  text,
  credits      jsonb not null default '[]'::jsonb,  -- [{role, name}]
  stream_links jsonb not null default '{}'::jsonb,  -- {spotify, bandcamp, ...}
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index releases_published_idx on public.releases (published, release_date desc);
create index releases_artist_idx on public.releases (artist_id);

create trigger releases_touch
  before update on public.releases
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Tracks
--
-- Separate table so a release page can list a real tracklist. This is what
-- makes two releases read as a catalogue rather than two thumbnails.
-- ------------------------------------------------------------
create table public.tracks (
  id               uuid primary key default gen_random_uuid(),
  release_id       uuid not null references public.releases (id) on delete cascade,
  position         integer not null,
  title            text not null,
  duration_seconds integer,
  created_at       timestamptz not null default now(),
  unique (release_id, position)
);

create index tracks_release_idx on public.tracks (release_id, position);

-- ------------------------------------------------------------
-- Events
-- ------------------------------------------------------------
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist_id  uuid references public.artists (id) on delete set null,
  venue      text,
  city       text,
  country    text,
  starts_at  timestamptz not null,
  ticket_url text,
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (published, starts_at desc);

create trigger events_touch
  before update on public.events
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Field notes
--
-- published_at doubles as the visibility flag and the sort key: null means
-- draft, a future date means scheduled. One column, no drift between a
-- `published` boolean and a date that disagree with each other.
-- ------------------------------------------------------------
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body         text,
  cover_url    text,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index posts_published_idx on public.posts (published_at desc);

create trigger posts_touch
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Demo submissions
-- ------------------------------------------------------------
create type public.submission_status as enum (
  'received',
  'listening',
  'passed',
  'in_conversation'
);

-- Reference code an artist can quote back to check status.
-- Alphabet excludes 0/O/1/I/L so codes survive being read over the phone
-- or copied out of an email by hand.
create or replace function public.gen_ref_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text;
  i integer;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(
        alphabet,
        1 + floor(random() * length(alphabet))::integer,
        1
      );
    end loop;
    code := 'OCH-' || code;
    exit when not exists (
      select 1 from public.submissions s where s.ref_code = code
    );
  end loop;
  return code;
end;
$$;

create table public.submissions (
  id          uuid primary key default gen_random_uuid(),
  ref_code    text not null unique,
  artist_name text not null,
  email       text not null,
  links       text,
  message     text,
  audio_path  text,                          -- object key in the `demos` bucket
  status      public.submission_status not null default 'received',
  admin_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ref_code already has an index from its unique constraint.
create index submissions_status_idx on public.submissions (status, created_at desc);

create trigger submissions_touch
  before update on public.submissions
  for each row execute function public.touch_updated_at();

-- Assign a ref code on insert unless one was supplied.
create or replace function public.set_ref_code()
returns trigger
language plpgsql
as $$
begin
  if new.ref_code is null or new.ref_code = '' then
    new.ref_code := public.gen_ref_code();
  end if;
  return new;
end;
$$;

create trigger submissions_ref_code
  before insert on public.submissions
  for each row execute function public.set_ref_code();
