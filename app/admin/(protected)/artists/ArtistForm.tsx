"use client";

import { useActionState, useState } from "react";
import {
  createImageUpload,
  deleteArtist,
  saveArtist,
  type ActionResult,
} from "../../actions";

export type ArtistRow = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  portrait_url: string | null;
  links: Record<string, string> | null;
  sort_order: number;
  published: boolean;
};

const SOCIALS = [
  { key: "instagram", label: "Instagram" },
  { key: "spotify", label: "Spotify" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "bandcamp", label: "Bandcamp" },
] as const;

const FIELD =
  "w-full border border-bronze/20 bg-white/40 px-3 py-2 text-sm text-bronze " +
  "focus:border-bronze focus:outline-none focus:ring-0";

const LABEL =
  "block font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/50";

export function ArtistForm({ artist }: { artist?: ArtistRow }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => saveArtist(form),
    null,
  );
  const [deleteState, deleteAction, deleting] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, form) => deleteArtist(form), null);

  const [portraitUrl, setPortraitUrl] = useState(artist?.portrait_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [name, setName] = useState(artist?.name ?? "");

  async function handlePortrait(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const ticket = await createImageUpload({
        folder: "portraits",
        key: name || "artist",
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

      setPortraitUrl(ticket.publicUrl);
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
        {artist && <input type="hidden" name="id" value={artist.id} />}
        <input type="hidden" name="portrait_url" value={portraitUrl} />

        <div className="grid gap-5 sm:grid-cols-[1fr_1fr_8rem]">
          <label>
            <span className={LABEL}>Name</span>
            <input
              required
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>Role</span>
            <input
              name="role"
              defaultValue={artist?.role ?? ""}
              placeholder="Producer / DJ"
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>Order</span>
            <input
              type="number"
              name="sort_order"
              defaultValue={artist?.sort_order ?? 0}
              className={`${FIELD} mt-1.5`}
            />
          </label>
        </div>

        <label>
          <span className={LABEL}>
            Web address (leave empty to build it from the name)
          </span>
          <input
            name="slug"
            defaultValue={artist?.slug ?? ""}
            placeholder="auto"
            className={`${FIELD} mt-1.5`}
          />
        </label>

        <div>
          <span className={LABEL}>Portrait</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {portraitUrl && (
              // Plain <img>: the URL is only known at runtime, and next/image
              // would need the Supabase host added to next.config.ts.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt=""
                className="h-20 w-20 border border-bronze/20 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handlePortrait}
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
          <span className={LABEL}>Bio</span>
          <textarea
            name="bio"
            rows={5}
            defaultValue={artist?.bio ?? ""}
            placeholder="Blank line between paragraphs — the homepage shows only the first."
            className={`${FIELD} mt-1.5 resize-y`}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIALS.map((social) => (
            <label key={social.key}>
              <span className={LABEL}>{social.label}</span>
              <input
                type="url"
                name={`link_${social.key}`}
                defaultValue={artist?.links?.[social.key] ?? ""}
                placeholder="https://"
                className={`${FIELD} mt-1.5`}
              />
            </label>
          ))}
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={artist?.published ?? false}
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
            {pending ? "Saving…" : artist ? "Save changes" : "Add artist"}
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

      {artist && (
        <form action={deleteAction} className="border-t border-bronze/10 pt-5">
          <input type="hidden" name="id" value={artist.id} />
          <button
            type="submit"
            disabled={deleting}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700/70 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete this artist"}
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
