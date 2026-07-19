# Supabase setup

Apply these in order. Two routes — pick one.

## Route A — dashboard (no tooling)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard). Region: **eu-central-1 (Frankfurt)** or **eu-west-2 (London)** — closest to NL, and it keeps the data in the EU, which matters because the pitch form collects names and email addresses.
2. Open **SQL Editor** and run, in order, pasting each file whole:
   - `migrations/0001_schema.sql`
   - `migrations/0002_rls.sql`
   - `migrations/0003_storage.sql`
   - `seed.sql`
3. Then do the admin bootstrap below.

If `0003_storage.sql` errors on `create policy ... on storage.objects`, create the two buckets by hand under **Storage** (`media` public, `demos` **private**) and add the policies through the Storage → Policies UI. Some projects don't grant policy ownership on `storage.objects` from the SQL editor.

## Route B — CLI

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies migrations/
npx supabase db seed          # applies seed.sql
```

## Admin bootstrap

Nothing in the app can grant admin rights — deliberately. There's no policy allowing an admin to create another admin, so a compromised admin session can't mint more of them. You do it once, by hand:

1. **Authentication → Users → Add user**. Use your friend's real email. Tick *auto-confirm*.
2. Copy the new user's UUID.
3. SQL Editor:

```sql
insert into public.admins (user_id, email)
values ('<paste-uuid>', '<paste-email>');
```

To revoke later, delete the row. It takes effect on the next request rather than whenever a token happens to expire — which is why admin status is a table here and not a JWT claim.

## Then send me

From **Project Settings → API**:

- Project URL
- `anon` / publishable key

Put the `service_role` key straight into `.env.local` yourself — I don't need to see it, and it should exist in as few places as possible. Copy `.env.example` to `.env.local` as the template.

## How the security fits together

| | public (anon) | admin | service role |
|---|---|---|---|
| Published artists/releases/tracks/events/posts | read | read + write | full |
| Unpublished rows | **no access** | read + write | full |
| Submissions | **no access at all** | read + set status | full |
| `media` bucket | read | write | full |
| `demos` bucket | **no access** | read via signed URL | full |

Two consequences worth understanding:

**The pitch form does not write to the database from the browser.** It posts to a Next.js route that holds the service role key. An anon insert policy would be simpler, but it would also be an unauthenticated write endpoint aimed directly at your database — spam bots find those within days.

**Demo audio is never publicly readable.** People are sending unreleased music on trust. The admin panel plays it through signed URLs that expire in minutes, so no permanent link to anyone's demo ever exists.
