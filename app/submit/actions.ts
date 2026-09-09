"use server";

import { randomInt } from "node:crypto";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/admin";

/**
 * Demo intake.
 *
 * The audio never passes through this server. Server Actions cap the request
 * body at 1MB and the docs warn against raising it, so a 50MB WAV posted to an
 * action is not a tuning problem, it is the wrong shape. Instead the action
 * validates the details, writes the row, and hands back a signed upload URL
 * that the browser PUTs the file to directly. The `demos` bucket stays closed
 * to anonymous writes, which is what its migration comment asks for.
 *
 * Order matters: the row is written *before* the upload URL is issued. A
 * signed URL is a licence to put 50MB somewhere, so it is only ever minted as
 * a consequence of a submission we have already recorded and can look at.
 */

/** Must stay in step with the demos bucket in 0003_storage.sql. */
const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/x-aiff",
  "audio/flac",
  "audio/mp4",
  "audio/aac",
]);

/** Extension is chosen by us from the declared type, never taken from the
 *  uploaded filename — that string is attacker-controlled. */
const EXTENSION: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/aiff": "aiff",
  "audio/x-aiff": "aiff",
  "audio/flac": "flac",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
};

/** No 0/O/1/I: the code gets read aloud and typed back in by hand. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function makeRefCode(): string {
  let body = "";
  for (let i = 0; i < 6; i++) body += ALPHABET[randomInt(ALPHABET.length)];
  return `OCH-${body}`;
}

export type SubmitInput = {
  artistName: string;
  email: string;
  links: string;
  message: string;
  fileSize: number;
  fileType: string;
};

export type SubmitResult =
  | { ok: true; refCode: string; uploadUrl: string }
  | { ok: false; message: string };

function fail(message: string): SubmitResult {
  return { ok: false, message };
}

export async function startSubmission(
  input: SubmitInput,
): Promise<SubmitResult> {
  if (!supabaseConfigured()) {
    return fail("The portal isn't connected yet. Nothing was sent.");
  }

  // Everything below is re-checked here even though the form checks it too.
  // The form is a convenience; this is the boundary.
  const artistName = String(input.artistName ?? "").trim();
  const email = String(input.email ?? "").trim();
  const links = String(input.links ?? "").trim();
  const message = String(input.message ?? "").trim();

  if (artistName.length < 1 || artistName.length > 120) {
    return fail("Please give an artist name.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return fail("That email address doesn't look right.");
  }
  if (links.length > 500) return fail("That's a lot of links — trim it down.");
  if (message.length > 2000) return fail("Keep the message under 2000 characters.");

  if (!Number.isFinite(input.fileSize) || input.fileSize <= 0) {
    return fail("That file looks empty.");
  }
  if (input.fileSize > MAX_BYTES) {
    return fail("That track is over the 50 MB limit.");
  }
  if (!ALLOWED_MIME.has(input.fileType)) {
    return fail("Send an MP3, WAV, AIFF or FLAC.");
  }

  const db = supabaseAdmin();
  const extension = EXTENSION[input.fileType];
  const year = new Date().getUTCFullYear();

  // ref_code is unique in the schema. Six random characters collide rarely
  // enough that a handful of retries is plenty, and letting the database be
  // the judge avoids a read-then-write race.
  for (let attempt = 0; attempt < 5; attempt++) {
    const refCode = makeRefCode();
    const audioPath = `${year}/${refCode}.${extension}`;

    const { error } = await db.from("submissions").insert({
      ref_code: refCode,
      artist_name: artistName,
      email,
      links: links || null,
      message: message || null,
      audio_path: audioPath,
    });

    if (error) {
      if (error.code === "23505") continue; // ref_code taken, draw another
      console.error("submission insert failed", error);
      return fail("Something went wrong saving that. Try again in a moment.");
    }

    const { data, error: urlError } = await db.storage
      .from("demos")
      .createSignedUploadUrl(audioPath);

    if (urlError || !data) {
      console.error("signed upload url failed", urlError);
      // The row stands. The details are worth more than the retry is worth
      // saving, and an admin can chase a submission with no audio.
      return fail(
        `Your details reached us as ${refCode}, but the upload couldn't start. Please try again.`,
      );
    }

    return { ok: true, refCode, uploadUrl: data.signedUrl };
  }

  return fail("Something went wrong saving that. Try again in a moment.");
}
