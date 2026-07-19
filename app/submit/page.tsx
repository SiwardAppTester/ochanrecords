import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { PhotoBackdrop } from "@/components/site/PhotoBackdrop";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit a demo",
  description:
    "Send a track to Ocham Records. You get a reference code and can check your submission status at any time.",
};

/**
 * The portal is the form and nothing else.
 *
 * The process — reference code, the three states, what we want — is already
 * explained on the counterfoil on the home page. Repeating it above the
 * fields would make someone who arrived here ready to send read a pitch
 * about sending first.
 */
export default function SubmitPage() {
  return (
    <main
      data-surface="dark"
      className="relative flex-1 overflow-hidden bg-pitch"
    >
      {/* Image behind the whole page: fixed while the form scrolls over it,
          washing down to near-black exactly where the fields begin. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-svh w-full">
          <PhotoBackdrop
            src="/textures/accent.jpg"
            scrim="dark"
            position="80% center"
            priority
            className="!static h-full w-full"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--color-pitch) 55%, transparent) 38%, color-mix(in oklab, var(--color-pitch) 92%, transparent) 64%, var(--color-pitch) 100%)",
          }}
        />
      </div>

      <section className="relative mx-auto w-full max-w-4xl px-6 pb-40 pt-40 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
          Demos
        </p>
        <h1 className="display-lg mt-4 text-bone">
          Send one track.
        </h1>

        <div className="mt-16">
          <Reveal>
            <SubmitForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
