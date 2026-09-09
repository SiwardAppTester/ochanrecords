"use client";

import { useActionState, useState } from "react";
import {
  createImageUpload,
  deleteRelease,
  saveRelease,
  type ActionResult,
} from "../../actions";

export type ReleaseRow = {
  id: string;
  slug: string;
  cat_no: string;
  title: string;
  artist_id: string;
  release_date: string | null;
  format: string | null;
  artwork_url: string | null;
  liner_notes: string | null;
  published: boolean;
};

export type ArtistOption = { id: string; name: string };

const FIELD =
  "w-full border border-bronze/20 bg-white/40 px-3 py-2 text-sm text-bronze " +
  "focus:border-bronze focus:outline-none focus:ring-0";

const LABEL =
  "block font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/50";

export function ReleaseForm({
  release,
  artists,
}: {
  release?: ReleaseRow;
  artists: ArtistOption[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => saveRelease(form),
    null,
  );
  const [deleteState, deleteAction, deleting] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, form) => deleteRelease(form), null);

  // The artwork URL is held here rather than posted with the file: the image
  // goes straight to storage, and only the resulting URL travels with the form.
  const [artworkUrl, setArtworkUrl] = useState(release?.artwork_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [catNo, setCatNo] = useState(release?.cat_no ?? "");

  async function handleArtwork(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const ticket = await createImageUpload({
        folder: "artwork",
        key: catNo || "release",
        fileType: file.type,
        fileSize: file.size,
      });

      if (!ticket.ok) {
        setUploadError(ticket.message);
        return;
      }

      const body = new FormData();
      body.append("cacheControl", "3600");
      body.append("", file);

      const upload = await fetch(ticket.uploadUrl, { method: "PUT", body });
      if (!upload.ok) {
        setUploadError("The upload didn't finish. Try again.");
        return;
      }

      setArtworkUrl(ticket.publicUrl);
    } catch {
      setUploadError("The upload didn't finish. Try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-6 border-t border-bronze/10 bg-shell/40 p-6">
      <form action={formAction} className="grid gap-5">
        {release && <input type="hidden" name="id" value={release.id} />}
        <input type="hidden" name="artwork_url" value={artworkUrl} />

        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <label>
            <span className={LABEL}>Title</span>
            <input
              required
              name="title"
              defaultValue={release?.title ?? ""}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>Catalogue no.</span>
            <input
              required
              name="cat_no"
              value={catNo}
              onChange={(e) => setCatNo(e.target.value)}
              placeholder="OCH001"
              className={`${FIELD} mt-1.5`}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <label>
            <span className={LABEL}>Artist</span>
            <select
              required
              name="artist_id"
              defaultValue={release?.artist_id ?? ""}
              className={`${FIELD} mt-1.5`}
            >
              <option value="">Pick one…</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={LABEL}>Release date</span>
            <input
              type="date"
              name="release_date"
              defaultValue={release?.release_date ?? ""}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>Format</span>
            <input
              name="format"
              defaultValue={release?.format ?? ""}
              placeholder='12" / Digital'
              className={`${FIELD} mt-1.5`}
            />
          </label>
        </div>

        <label>
          <span className={LABEL}>
            Web address (leave empty to build it from the title)
          </span>
          <input
            name="slug"
            defaultValue={release?.slug ?? ""}
            placeholder="auto"
            className={`${FIELD} mt-1.5`}
          />
        </label>

        <div>
          <span className={LABEL}>Artwork</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {artworkUrl && (
              // Deliberately a plain <img>: the URL is only known at runtime
              // and next/image would need the Supabase host whitelisted.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl}
                alt=""
                className="h-20 w-20 border border-bronze/20 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleArtwork}
              disabled={uploading}
              className="text-xs text-bronze/70 file:mr-4 file:border file:border-bronze/30 file:bg-transparent file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.18em]"
            />
            {uploading && (
              <span className="text-sm text-bronze/50">Uploading…</span>
            )}
            {uploadError && (
              <span className="text-sm text-red-700">{uploadError}</span>
            )}
          </div>
        </div>

        <label>
          <span className={LABEL}>Liner notes</span>
          <textarea
            name="liner_notes"
            rows={4}
            defaultValue={release?.liner_notes ?? ""}
            className={`${FIELD} mt-1.5 resize-y`}
          />
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={release?.published ?? false}
            className="h-4 w-4 accent-bronze"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze/70">
            Visible on the site
          </span>
        </label>

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={pending || uploading}
            className="border border-bronze/40 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bronze hover:text-bone disabled:opacity-50"
          >
            {pending ? "Saving…" : release ? "Save changes" : "Add release"}
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

      {release && (
        <form action={deleteAction} className="border-t border-bronze/10 pt-5">
          <input type="hidden" name="id" value={release.id} />
          <button
            type="submit"
            disabled={deleting}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700/70 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete this release"}
          </button>
          {deleteState && !deleteState.ok && (
            <span className="ml-4 text-sm text-red-700">
              {deleteState.message}
            </span>
          )}
        </form>
      )}
    </div>
  );
}
