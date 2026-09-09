"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin mutations.
 *
 * Every one of these calls `requireAdmin()` first. That is not belt and
 * braces with the layout guard — the layout only decides what gets rendered,
 * and an action is a public endpoint that can be called without ever loading
 * the page. Rendering is not a security boundary.
 *
 * Writes go through the session client, so RLS still has the final say: even
 * with a bug here, a non-admin session cannot write.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

function fail(message: string): ActionResult {
  return { ok: false, message };
}

/** The public pages are statically generated, so a write that isn't followed
 *  by a revalidate won't show up until the next natural rebuild. */
function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/dates");
  revalidatePath("/releases");
}

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function optional(form: FormData, key: string): string | null {
  const value = text(form, key);
  return value === "" ? null : value;
}

/** Lowercase, dashes, nothing else — it ends up in a URL. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents left by NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ------------------------------------------------------------
// Session
// ------------------------------------------------------------

export async function signIn(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");

  if (!email || !password) return fail("Fill in both fields.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Deliberately not "no such user" vs "wrong password" — that difference
  // tells someone whether an address is worth attacking.
  if (error) return fail("That didn't work. Check the email and password.");

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ------------------------------------------------------------
// Dates
// ------------------------------------------------------------

export async function saveEvent(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  const title = text(form, "title");
  const startsAt = text(form, "starts_at");

  if (!title) return fail("A date needs a title.");
  if (!startsAt) return fail("A date needs a date and time.");

  // datetime-local gives back local wall time with no zone. Date.parse reads
  // it as the server's zone, which is why it is normalised to an instant here
  // rather than handed to Postgres as a bare string.
  const parsed = Date.parse(startsAt);
  if (Number.isNaN(parsed)) return fail("That date didn't make sense.");

  const row = {
    title,
    venue: optional(form, "venue"),
    city: optional(form, "city"),
    country: optional(form, "country"),
    starts_at: new Date(parsed).toISOString(),
    ticket_url: optional(form, "ticket_url"),
    artist_id: optional(form, "artist_id"),
    published: form.get("published") === "on",
  };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("events").update(row).eq("id", id)
    : await supabase.from("events").insert(row);

  if (error) {
    console.error("saveEvent", error);
    return fail("Saving failed. Try again.");
  }

  revalidatePublic();
  revalidatePath("/admin/dates");
  return { ok: true };
}

export async function deleteEvent(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  if (!id) return fail("Nothing to delete.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    console.error("deleteEvent", error);
    return fail("Deleting failed.");
  }

  revalidatePublic();
  revalidatePath("/admin/dates");
  return { ok: true };
}

// ------------------------------------------------------------
// Releases
// ------------------------------------------------------------

export async function saveRelease(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  const title = text(form, "title");
  const catNo = text(form, "cat_no");
  const artistId = optional(form, "artist_id");

  if (!title) return fail("A release needs a title.");
  if (!catNo) return fail("A release needs a catalogue number.");
  if (!artistId) return fail("Pick an artist.");

  const slug = slugify(text(form, "slug") || title);
  if (!slug) return fail("That title doesn't make a usable web address.");

  const row = {
    slug,
    cat_no: catNo,
    title,
    artist_id: artistId,
    release_date: optional(form, "release_date"),
    format: optional(form, "format"),
    artwork_url: optional(form, "artwork_url"),
    liner_notes: optional(form, "liner_notes"),
    published: form.get("published") === "on",
  };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("releases").update(row).eq("id", id)
    : await supabase.from("releases").insert(row);

  if (error) {
    console.error("saveRelease", error);
    // slug and cat_no are both unique in the schema.
    if (error.code === "23505") {
      return fail("That catalogue number or web address is already taken.");
    }
    return fail("Saving failed. Try again.");
  }

  revalidatePublic();
  revalidatePath(`/releases/${slug}`);
  revalidatePath("/admin/releases");
  return { ok: true };
}

export async function deleteRelease(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  if (!id) return fail("Nothing to delete.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("releases").delete().eq("id", id);

  if (error) {
    console.error("deleteRelease", error);
    return fail("Deleting failed.");
  }

  revalidatePublic();
  revalidatePath("/admin/releases");
  return { ok: true };
}


// ------------------------------------------------------------
// Artists
// ------------------------------------------------------------

/** The four accounts the site knows how to render — see SOCIAL_LABELS in
 *  lib/site.ts. Anything else would be stored and never shown. */
const SOCIAL_KEYS = ["instagram", "spotify", "soundcloud", "bandcamp"] as const;

export async function saveArtist(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  const name = text(form, "name");
  if (!name) return fail("An artist needs a name.");

  const slug = slugify(text(form, "slug") || name);
  if (!slug) return fail("That name doesn't make a usable web address.");

  // Empty fields are dropped rather than stored as "": activeSocials() in
  // lib/site.ts decides what to show by truthiness, and a stored empty string
  // would render a link pointing nowhere.
  const links: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    const value = text(form, `link_${key}`);
    if (value) links[key] = value;
  }

  const sortOrder = Number(text(form, "sort_order") || "0");

  const row = {
    slug,
    name,
    role: optional(form, "role"),
    bio: optional(form, "bio"),
    portrait_url: optional(form, "portrait_url"),
    links,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published: form.get("published") === "on",
  };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("artists").update(row).eq("id", id)
    : await supabase.from("artists").insert(row);

  if (error) {
    console.error("saveArtist", error);
    if (error.code === "23505") return fail("That web address is already taken.");
    return fail("Saving failed. Try again.");
  }

  revalidatePublic();
  revalidatePath("/artists");
  revalidatePath(`/artists/${slug}`);
  revalidatePath("/admin/artists");
  return { ok: true };
}

export async function deleteArtist(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  if (!id) return fail("Nothing to delete.");

  const supabase = await createSupabaseServerClient();

  // Checked here rather than left to the foreign key.
  //
  // 0001_schema.sql declares releases.artist_id as ON DELETE RESTRICT, but
  // this database does not behave that way: deleting an artist took their
  // releases (and, through those, their tracks) with it. Whatever the live
  // constraint actually is, a delete button that silently destroys a
  // catalogue is not one worth shipping, so the refusal is enforced in the
  // application where it can be relied on.
  const { count, error: countError } = await supabase
    .from("releases")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", id);

  if (countError) {
    console.error("deleteArtist count", countError);
    return fail("Couldn't check this artist's releases. Nothing was deleted.");
  }

  if (count && count > 0) {
    return fail(
      `This artist still has ${count} release${count === 1 ? "" : "s"}. Delete or reassign ${count === 1 ? "it" : "those"} first — removing the artist would take the releases with them.`,
    );
  }

  const { error } = await supabase.from("artists").delete().eq("id", id);

  if (error) {
    console.error("deleteArtist", error);
    if (error.code === "23503") {
      return fail(
        "This artist still has releases. Delete or reassign those first.",
      );
    }
    return fail("Deleting failed.");
  }

  revalidatePublic();
  revalidatePath("/artists");
  revalidatePath("/admin/artists");
  return { ok: true };
}

// ------------------------------------------------------------
// Demos
// ------------------------------------------------------------

const SUBMISSION_STATUS = [
  "received",
  "listening",
  "passed",
  "in_conversation",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUS)[number];

export async function updateSubmission(form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = optional(form, "id");
  if (!id) return fail("Nothing to update.");

  const status = text(form, "status");
  if (!SUBMISSION_STATUS.includes(status as SubmissionStatus)) {
    return fail("That isn't a valid status.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("submissions")
    .update({ status, admin_notes: optional(form, "admin_notes") })
    .eq("id", id);

  if (error) {
    console.error("updateSubmission", error);
    return fail("Saving failed. Try again.");
  }

  revalidatePath("/admin/demos");
  return { ok: true };
}

/**
 * A link to listen to one demo.
 *
 * The `demos` bucket is private and stays that way — it holds unreleased
 * music people sent in confidence. So playback goes through a signed URL
 * minted per click and good for an hour, rather than making the object
 * public. Created through the session client, so the storage policy still
 * checks `is_admin()` rather than trusting this code.
 */
export type PlaybackResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function createDemoPlaybackUrl(
  audioPath: string,
): Promise<PlaybackResult> {
  await requireAdmin();

  if (!audioPath) return { ok: false, message: "No file on this submission." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from("demos")
    .createSignedUrl(audioPath, 60 * 60);

  if (error || !data) {
    console.error("createDemoPlaybackUrl", error);
    return { ok: false, message: "Couldn't open that file." };
  }

  return { ok: true, url: data.signedUrl };
}


/**
 * Artwork upload.
 *
 * Same shape as the demo intake and for the same reason: a Server Action body
 * is capped at 1MB and the media bucket allows 10MB. The browser PUTs the
 * image straight to the signed URL.
 */
const ARTWORK_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type UploadTicket =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; message: string };

export async function createImageUpload(input: {
  /** Subfolder in the media bucket: "artwork" or "portraits". */
  folder: "artwork" | "portraits";
  /** Human-readable stem for the filename — cat number, artist name. */
  key: string;
  fileType: string;
  fileSize: number;
}): Promise<UploadTicket> {
  await requireAdmin();

  const extension = ARTWORK_MIME[input.fileType];
  if (!extension) return { ok: false, message: "Use a JPG, PNG, WebP or AVIF." };
  if (!(input.fileSize > 0) || input.fileSize > 10 * 1024 * 1024) {
    return { ok: false, message: "The image must be under 10 MB." };
  }

  const key = slugify(input.key) || "image";
  // Date.now keeps a re-upload from colliding with the cached old file.
  const path = `${input.folder}/${key}-${Date.now()}.${extension}`;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from("media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createImageUpload", error);
    return { ok: false, message: "Couldn't start the upload." };
  }

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

  return { ok: true, uploadUrl: data.signedUrl, publicUrl: publicUrl.publicUrl };
}
