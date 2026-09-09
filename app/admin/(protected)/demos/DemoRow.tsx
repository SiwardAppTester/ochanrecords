"use client";

import { useActionState, useState } from "react";
import {
  createDemoPlaybackUrl,
  updateSubmission,
  type ActionResult,
} from "../../actions";

export type SubmissionRow = {
  id: string;
  ref_code: string;
  artist_name: string;
  email: string;
  links: string | null;
  message: string | null;
  audio_path: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  listening: "Listening",
  passed: "Passed",
  in_conversation: "In conversation",
};

const FIELD =
  "w-full border border-bronze/20 bg-white/40 px-3 py-2 text-sm text-bronze " +
  "focus:border-bronze focus:outline-none focus:ring-0";

const LABEL =
  "block font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/50";

export function DemoRow({
  submission,
  fileExists,
}: {
  submission: SubmissionRow;
  fileExists: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => updateSubmission(form),
    null,
  );

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  async function handlePlay() {
    if (!submission.audio_path) return;
    setLoadingAudio(true);
    setAudioError(null);

    const result = await createDemoPlaybackUrl(submission.audio_path);
    if (result.ok) setAudioUrl(result.url);
    else setAudioError(result.message);

    setLoadingAudio(false);
  }

  return (
    <div className="grid gap-6 border-t border-bronze/10 bg-shell/40 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={LABEL}>Email</span>
          <p className="mt-1 text-sm">
            <a
              href={`mailto:${submission.email}?subject=Your demo (${submission.ref_code})`}
              className="underline underline-offset-2"
            >
              {submission.email}
            </a>
          </p>
        </div>
        <div>
          <span className={LABEL}>Sent</span>
          <p className="mt-1 text-sm text-bronze/70">
            {new Date(submission.created_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {submission.links && (
        <div>
          <span className={LABEL}>Links</span>
          <p className="mt-1 whitespace-pre-wrap text-sm text-bronze/80">
            {submission.links}
          </p>
        </div>
      )}

      {submission.message && (
        <div>
          <span className={LABEL}>Message</span>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-bronze/80">
            {submission.message}
          </p>
        </div>
      )}

      <div>
        <span className={LABEL}>Track</span>
        {!submission.audio_path ? (
          <p className="mt-1 text-sm text-red-700">
            No file was recorded on this submission.
          </p>
        ) : !fileExists ? (
          // The row is written before the upload, so details survive a failed
          // upload. This is where that shows up.
          <p className="mt-1 text-sm text-red-700">
            The upload never finished — the details arrived but the audio did
            not. Worth emailing them for it.
          </p>
        ) : audioUrl ? (
          <audio controls src={audioUrl} className="mt-2 w-full max-w-md">
            Your browser can&apos;t play this file.
          </audio>
        ) : (
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={handlePlay}
              disabled={loadingAudio}
              className="border border-bronze/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bronze hover:text-bone disabled:opacity-50"
            >
              {loadingAudio ? "Opening…" : "Listen"}
            </button>
            {audioError && (
              <span className="text-sm text-red-700">{audioError}</span>
            )}
          </div>
        )}
      </div>

      <form action={formAction} className="grid gap-5 border-t border-bronze/10 pt-5">
        <input type="hidden" name="id" value={submission.id} />

        <label className="max-w-xs">
          <span className={LABEL}>Status</span>
          <select
            name="status"
            defaultValue={submission.status}
            className={`${FIELD} mt-1.5`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL}>Notes (only you see these)</span>
          <textarea
            name="admin_notes"
            rows={3}
            defaultValue={submission.admin_notes ?? ""}
            className={`${FIELD} mt-1.5 resize-y`}
          />
        </label>

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={pending}
            className="border border-bronze/40 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bronze hover:text-bone disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {state && (
            <span
              className={`text-sm ${state.ok ? "text-bronze/60" : "text-red-700"}`}
            >
              {state.ok ? "Saved." : state.message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export { STATUS_LABELS };
