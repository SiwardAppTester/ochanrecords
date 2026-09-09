"use client";

import { useState } from "react";

import { startSubmission } from "./actions";

/**
 * Pitch form.
 *
 * Deliberately not a card. A bordered box floating on a page is the shape of
 * every SaaS signup; this is set as a printed form instead — numbered rows,
 * hairline rules, no container. Inputs are transparent with a single bottom
 * rule, so what you see is the page with writing on it rather than a widget
 * dropped onto the page.
 *
 * The audio does not go through our server. `startSubmission` records the
 * details and hands back a signed URL; the file is PUT straight to Supabase
 * Storage from here. That is also why the form is submitted by hand instead
 * of with `<form action={...}>` — a form action would serialise the file
 * input into the request body and hit the 1MB Server Action cap.
 */

const MAX_BYTES = 50 * 1024 * 1024; // must match the demos bucket limit

/** Transparent, one rule underneath, no box. */
const FIELD =
  "w-full border-0 border-b border-bone/20 bg-transparent px-0 pb-3 pt-1 " +
  "text-lg text-bone placeholder:text-bone/25 transition-colors duration-500 " +
  "focus:border-amber focus:outline-none focus:ring-0 sm:text-xl";

function Row({
  n,
  label,
  hint,
  children,
}: {
  n: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 py-8 sm:grid-cols-[5.5rem_1fr] sm:gap-8">
      <div className="pt-1">
        <span className="font-mono text-[11px] tracking-[0.22em] text-bone/35">
          {n}
        </span>
      </div>
      <div>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
            {label}
          </span>
          <div className="mt-3">{children}</div>
        </label>
        {hint && <p className="mt-3 text-xs text-bone/30">{hint}</p>}
      </div>
    </div>
  );
}

export function SubmitForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    setFileError(null);

    if (picked && picked.size > MAX_BYTES) {
      setFileError(
        `That file is ${(picked.size / 1024 / 1024).toFixed(0)} MB. The limit is 50 MB — send an MP3, or link a WAV instead.`,
      );
      setFile(null);
      event.target.value = "";
      return;
    }
    setFile(picked);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const fields = new FormData(event.currentTarget);
    if (!file) {
      setFileError("Pick a track to send.");
      return;
    }

    setPending(true);
    setNotice(null);

    try {
      // Only the details travel here. The server writes the row first, then
      // issues a URL for the audio.
      const started = await startSubmission({
        artistName: String(fields.get("artist_name") ?? ""),
        email: String(fields.get("email") ?? ""),
        links: String(fields.get("links") ?? ""),
        message: String(fields.get("message") ?? ""),
        fileSize: file.size,
        fileType: file.type,
      });

      if (!started.ok) {
        setNotice(started.message);
        return;
      }

      // Shaped the way supabase-js posts to a signed upload URL: PUT, the
      // file under an empty key, cache-control alongside it. No content-type
      // header — the browser has to set the multipart boundary itself.
      const body = new FormData();
      body.append("cacheControl", "3600");
      body.append("", file);

      const upload = await fetch(started.uploadUrl, { method: "PUT", body });
      if (!upload.ok) {
        setNotice(
          `We have your details as ${started.refCode}, but the track didn't finish uploading. Send it again and mention that code.`,
        );
        return;
      }

      setRefCode(started.refCode);
    } catch {
      setNotice("That didn't send. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  // Once it is in, the form is gone. Leaving the fields on screen behind a
  // confirmation invites a second identical submission.
  if (refCode) {
    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
          Received
        </p>
        <p className="display-lg mt-4 text-bone">Thank you.</p>
        <p className="prose-warm mt-6 max-w-md text-bone/70">
          Your track is with us. Keep this reference — it is how you can ask
          after it later.
        </p>
        <p className="mt-8 border-l-2 border-amber/50 py-2 pl-4 font-mono text-2xl tracking-[0.18em] text-amber">
          {refCode}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
          Submission
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/35">
          Form A — one track
        </p>
      </div>
      <div
        className="mt-4 h-px"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklab, var(--color-bone) 34%, transparent), color-mix(in oklab, var(--color-bone) 34%, transparent) 92%, transparent)",
        }}
      />

      <div className="divide-y divide-bone/10">
        <Row n="01" label="Artist name">
          <input
            required
            type="text"
            name="artist_name"
            placeholder="Your name or project"
            className={FIELD}
          />
        </Row>

        <Row n="02" label="Email" hint="So we can reply. Nothing else.">
          <input
            required
            type="email"
            name="email"
            placeholder="you@somewhere"
            className={FIELD}
          />
        </Row>

        <Row n="03" label="Links">
          <input
            type="text"
            name="links"
            placeholder="SoundCloud, Bandcamp, Instagram…"
            className={FIELD}
          />
        </Row>

        <Row
          n="04"
          label="One track"
          hint="MP3, WAV, AIFF or FLAC. 50 MB maximum."
        >
          <input
            required
            type="file"
            name="audio"
            accept="audio/*"
            onChange={handleFile}
            className={`${FIELD} text-sm file:mr-5 file:border-0 file:border-b file:border-amber/40 file:bg-transparent file:px-0 file:pb-1 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.2em] file:text-amber`}
          />
          {fileError && (
            <p className="mt-3 text-xs text-amber">{fileError}</p>
          )}
          {file && !fileError && (
            <p className="mt-3 font-mono text-xs text-bone/45">
              {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </Row>

        <Row n="05" label="What should we know?" hint="Keep it short.">
          <textarea
            name="message"
            rows={3}
            placeholder="A sentence is plenty."
            className={`${FIELD} resize-none`}
          />
        </Row>
      </div>

      {/* Submit reads as a signature line at the foot of a form, not a
          rounded button in the middle of a card. */}
      <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-baseline gap-4 border-b border-amber/50 pb-2 transition-colors duration-500 hover:border-amber disabled:cursor-wait disabled:opacity-50"
        >
          <span className="font-display text-3xl text-bone transition-colors duration-500 group-hover:text-amber sm:text-4xl">
            {pending ? "Sending…" : "Send it"}
          </span>
          <span className="font-mono text-xs text-amber">→</span>
        </button>
        <p className="max-w-xs text-xs leading-relaxed text-bone/30">
          By sending you agree we may keep your track and details on file.
        </p>
      </div>

      {notice && (
        <p className="mt-8 border-l-2 border-amber/50 py-2 pl-4 text-sm text-amber/90">
          {notice}
        </p>
      )}
    </form>
  );
}
