import type { Metadata } from "next";
import Link from "next/link";
import { LightWash } from "@/components/LightWash";
import { Reveal } from "@/components/Reveal";
import { SITE, activeSocials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Ocham Records.",
};

/**
 * Contact.
 *
 * One real person, two real ways to reach him. The previous version had
 * three invented department addresses in cards — which made a two-person
 * label look like it had a press office, and gave a visitor three doors to
 * choose between when there is only one.
 *
 * Set as large type on the page rather than in panels: an email address is
 * the content here, so it gets to be the biggest thing on the screen.
 */
export default function ContactPage() {
  const socials = activeSocials();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-20 pt-40 sm:px-10">
        <LightWash origin="top-left" />
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow">Get in touch</p>
          <h1 className="display-lg mt-4 text-bronze">Contact</h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
        <Reveal>
          <div className="rule" />

          <a
            href={`mailto:${SITE.email.general}`}
            className="group flex flex-col gap-2 border-b border-bronze/12 py-9 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
          >
            <span className="eyebrow shrink-0 sm:w-32">Email</span>
            <span
              className="min-w-0 flex-1 break-words font-display text-bronze transition-colors duration-500 group-hover:text-copper"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)", lineHeight: 1.05 }}
            >
              {SITE.email.general}
            </span>
            <span className="hidden font-mono text-xs text-dust transition-transform duration-500 group-hover:translate-x-1 sm:block">
              →
            </span>
          </a>

          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="group flex flex-col gap-2 border-b border-bronze/12 py-9 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
          >
            <span className="eyebrow shrink-0 sm:w-32">Phone</span>
            <span
              className="min-w-0 flex-1 font-display text-bronze transition-colors duration-500 group-hover:text-copper"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)", lineHeight: 1.05 }}
            >
              {SITE.phone}
            </span>
            <span className="hidden font-mono text-xs text-dust transition-transform duration-500 group-hover:translate-x-1 sm:block">
              →
            </span>
          </a>

          {socials.length > 0 && (
            <div className="flex flex-col gap-4 border-b border-bronze/12 py-9 sm:flex-row sm:items-baseline sm:gap-10">
              <span className="eyebrow shrink-0 sm:w-32">Elsewhere</span>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-display text-xl text-bronze transition-colors duration-500 hover:text-copper sm:text-2xl"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* Demos are routed away from the inbox on purpose — the portal is the
          only place a submission gets a reference number and a status. */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-32 sm:px-10">
        <Reveal delay={100}>
          <p className="prose-warm">
            Sending music? Use{" "}
            <Link
              href="/submit"
              className="text-copper underline decoration-copper/40 underline-offset-4 transition-colors duration-500 hover:decoration-copper"
            >
              the demo portal
            </Link>{" "}
            rather than email — it gives you a reference number and a status
            you can check, instead of a thread that goes quiet.
          </p>
        </Reveal>
      </section>
    </main>
  );
}
