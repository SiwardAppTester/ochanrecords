"use client";

import { useActionState } from "react";
import { deleteEvent, saveEvent, type ActionResult } from "../../actions";

export type EventRow = {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  starts_at: string;
  ticket_url: string | null;
  artist_id: string | null;
  published: boolean;
};

export type ArtistOption = { id: string; name: string };

const FIELD =
  "w-full border border-bronze/20 bg-white/40 px-3 py-2 text-sm text-bronze " +
  "focus:border-bronze focus:outline-none focus:ring-0";

const LABEL =
  "block font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/50";

/** <input type="datetime-local"> wants local wall time with no zone and no
 *  seconds. Slicing the ISO string keeps it in UTC, which is what the row
 *  holds — good enough for a two-person label and unambiguous to read. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function DateForm({
  event,
  artists,
}: {
  event?: EventRow;
  artists: ArtistOption[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => saveEvent(form),
    null,
  );

  const [deleteState, deleteAction, deleting] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, form) => deleteEvent(form), null);

  return (
    <div className="grid gap-6 border-t border-bronze/10 bg-shell/40 p-6">
      <form action={formAction} className="grid gap-5">
        {event && <input type="hidden" name="id" value={event.id} />}

        <label>
          <span className={LABEL}>Title</span>
          <input
            required
            name="title"
            defaultValue={event?.title ?? ""}
            placeholder="Ocham Night"
            className={`${FIELD} mt-1.5`}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className={LABEL}>Date and time</span>
            <input
              required
              type="datetime-local"
              name="starts_at"
              defaultValue={toLocalInput(event?.starts_at ?? null)}
              className={`${FIELD} mt-1.5`}
            />
          </label>

          <label>
            <span className={LABEL}>Artist (optional)</span>
            <select
              name="artist_id"
              defaultValue={event?.artist_id ?? ""}
              className={`${FIELD} mt-1.5`}
            >
              <option value="">—</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <label>
            <span className={LABEL}>Venue</span>
            <input
              name="venue"
              defaultValue={event?.venue ?? ""}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>City</span>
            <input
              name="city"
              defaultValue={event?.city ?? ""}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <label>
            <span className={LABEL}>Country</span>
            <input
              name="country"
              defaultValue={event?.country ?? ""}
              className={`${FIELD} mt-1.5`}
            />
          </label>
        </div>

        <label>
          <span className={LABEL}>Ticket link</span>
          <input
            name="ticket_url"
            type="url"
            defaultValue={event?.ticket_url ?? ""}
            placeholder="https://"
            className={`${FIELD} mt-1.5`}
          />
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={event?.published ?? false}
            className="h-4 w-4 accent-bronze"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze/70">
            Visible on the site
          </span>
        </label>

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={pending}
            className="border border-bronze/40 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bronze hover:text-bone disabled:opacity-50"
          >
            {pending ? "Saving…" : event ? "Save changes" : "Add date"}
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

      {event && (
        <form action={deleteAction} className="border-t border-bronze/10 pt-5">
          <input type="hidden" name="id" value={event.id} />
          <button
            type="submit"
            disabled={deleting}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700/70 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete this date"}
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
