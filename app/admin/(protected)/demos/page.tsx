import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/supabase/public";
import { DemoRow, STATUS_LABELS, type SubmissionRow } from "./DemoRow";

export const dynamic = "force-dynamic";

/**
 * Which submissions actually have their audio in the bucket.
 *
 * The submission row is written before the upload is allowed to start, so a
 * failed upload leaves a row pointing at a file that was never created. Rather
 * than checking each row separately, the folders in play are listed once and
 * matched — a handful of calls instead of one per demo.
 */
async function existingFiles(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  paths: string[],
): Promise<Set<string>> {
  const folders = new Set(
    paths.map((path) => path.split("/").slice(0, -1).join("/")).filter(Boolean),
  );

  const found = new Set<string>();

  await Promise.all(
    [...folders].map(async (folder) => {
      const { data, error } = await supabase.storage
        .from("demos")
        .list(folder, { limit: 1000 });
      if (error || !data) return;
      for (const file of data) found.add(`${folder}/${file.name}`);
    }),
  );

  return found;
}

export default async function AdminDemos() {
  if (!supabasePublicConfigured()) return null;

  const supabase = await createSupabaseServerClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      "id, ref_code, artist_name, email, links, message, audio_path, status, admin_notes, created_at",
    )
    .order("created_at", { ascending: false });

  const rows = (submissions ?? []) as SubmissionRow[];
  const present = await existingFiles(
    supabase,
    rows.map((row) => row.audio_path).filter((path): path is string => !!path),
  );

  return (
    <div>
      <h1 className="font-display text-4xl">Demos</h1>
      <p className="mt-3 max-w-xl text-sm text-bronze/50">
        Everything sent through the form. Audio is private — pressing Listen
        opens a link that works for an hour and is not shareable beyond that.
      </p>

      <div className="mt-10 border border-bronze/15">
        {rows.length === 0 && (
          <p className="px-6 py-8 text-sm text-bronze/50">
            Nothing has come in yet.
          </p>
        )}

        {rows.map((submission) => (
          <details
            key={submission.id}
            className="border-b border-bronze/10 last:border-b-0"
          >
            <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 hover:bg-shell/50">
              <span className="font-mono text-[11px] text-bronze/50">
                {submission.ref_code}
              </span>
              <span className="font-display text-xl">
                {submission.artist_name}
              </span>
              <span className="text-sm text-bronze/50">
                {new Date(submission.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/40">
                {STATUS_LABELS[submission.status] ?? submission.status}
              </span>
            </summary>
            <DemoRow
              submission={submission}
              fileExists={
                !!submission.audio_path && present.has(submission.audio_path)
              }
            />
          </details>
        ))}
      </div>
    </div>
  );
}
