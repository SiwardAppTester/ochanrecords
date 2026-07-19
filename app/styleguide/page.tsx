import type { Metadata } from "next";
import { LightWash } from "@/components/LightWash";
import { LiquidDivider } from "@/components/LiquidDivider";
import { Reveal } from "@/components/Reveal";
import { Button, ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const SURFACES = [
  { name: "bone", hex: "#F0ECE4", note: "page background" },
  { name: "shell", hex: "#E4DED2", note: "raised sections" },
  { name: "sand", hex: "#CFC7B6", note: "cards, wells" },
  { name: "clay", hex: "#ADA492", note: "borders, dividers" },
  { name: "pitch", hex: "#1C1A17", note: "inverted sections" },
];

const INK = [
  { name: "bronze", hex: "#262320", note: "headings, primary text" },
  { name: "umber", hex: "#443F38", note: "body copy" },
  { name: "dust", hex: "#766F63", note: "metadata, captions" },
];

const ACCENT = [
  { name: "copper", hex: "#9A6A45", note: "links, hover, accents" },
  { name: "amber", hex: "#C2946A", note: "glows, highlights" },
];

function Swatch({
  name,
  hex,
  note,
}: {
  name: string;
  hex: string;
  note: string;
}) {
  return (
    <div>
      <div
        className="h-24 w-full rounded-[var(--radius-panel)] border border-bronze/15"
        style={{ backgroundColor: hex }}
      />
      <p className="mt-3 font-mono text-xs text-bronze">{name}</p>
      <p className="font-mono text-xs text-dust">{hex}</p>
      <p className="mt-1 text-xs text-dust">{note}</p>
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10">
      <Reveal>
        <p className="eyebrow">{label}</p>
        <h2 className="display-md mt-3 text-bronze">{title}</h2>
        <div className="rule mt-6 mb-10" />
        {children}
      </Reveal>
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="relative">
      {/* ---------- Hero: the full atmosphere in one screen ---------- */}
      <div className="relative flex min-h-[80vh] flex-col justify-end overflow-hidden px-6 pb-20 pt-32 sm:px-10">
        <LightWash origin="top-left" />
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow">Ocham Records — Design System v0.1</p>
          <h1 className="display-xl mt-6 text-bronze">
            Stone, paper,
            <br />
            <em className="italic text-copper">oxide.</em>
          </h1>
          <p className="prose-warm mt-8">
            Everything below is generated from the tokens in{" "}
            <code className="font-mono text-sm text-copper">
              app/globals.css
            </code>
            . Change a value there and the whole site follows. Nothing here is
            final — this page exists so we argue about colour and type once,
            cheaply, before it is spread across eight pages.
          </p>
        </div>
      </div>

      <LiquidDivider fill="var(--color-shell)" />

      {/* ---------- Palette ---------- */}
      <div className="bg-shell">
        <Section label="01 — Colour" title="Palette">
          <div className="space-y-12">
            <div>
              <p className="eyebrow mb-4">Surfaces</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {SURFACES.map((c) => (
                  <Swatch key={c.name} {...c} />
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Ink</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {INK.map((c) => (
                  <Swatch key={c.name} {...c} />
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Accent</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {ACCENT.map((c) => (
                  <Swatch key={c.name} {...c} />
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <LiquidDivider fill="var(--color-bone)" />

      {/* ---------- Typography ---------- */}
      <Section label="02 — Type" title="Instrument Serif × Inter">
        <div className="space-y-10">
          <div>
            <p className="eyebrow mb-3">display-xl — hero only</p>
            <p className="display-xl text-bronze">Ocham</p>
          </div>
          <div>
            <p className="eyebrow mb-3">display-lg — page titles</p>
            <p className="display-lg text-bronze">
              Mats Westbroek
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">display-md — section headings</p>
            <p className="display-md text-bronze">Two releases. One artist.</p>
          </div>
          <div>
            <p className="eyebrow mb-3">display italic — emphasis / pull</p>
            <p className="display-lg italic text-copper">That&apos;s the point.</p>
          </div>
          <div>
            <p className="eyebrow mb-3">prose-warm — body copy</p>
            <p className="prose-warm">
              Ocham is a small label with a deliberately short roster. We work
              slowly, release rarely, and stay with an artist across records
              rather than singles. Everything we put out is something we would
              still want to hear in ten years.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">eyebrow — metadata</p>
            <p className="eyebrow">OCH001 — Released 14.03.2026 — 12&quot; / Digital</p>
          </div>
        </div>
      </Section>

      <LiquidDivider fill="var(--color-shell)" />

      {/* ---------- Components ---------- */}
      <div className="bg-shell">
        <Section label="03 — Components" title="Primitives">
          <div className="space-y-14">
            <div>
              <p className="eyebrow mb-5">Buttons</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="solid">Submit a demo</Button>
                <Button variant="outline">View release</Button>
                <Button variant="ghost">Read more</Button>
                <ButtonLink href="/styleguide" variant="outline">
                  As a link
                </ButtonLink>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-5">Release card</p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { cat: "OCH001", title: "Tidal Drift", date: "March 2026" },
                  { cat: "OCH002", title: "Salt & Static", date: "June 2026" },
                ].map((r, i) => (
                  <Reveal key={r.cat} delay={i * 100}>
                    <article className="group">
                      <div
                        className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15"
                        style={{
                          background:
                            "linear-gradient(145deg, var(--color-sand), var(--color-clay) 60%, var(--color-copper))",
                        }}
                      />
                      <p className="eyebrow mt-5">{r.cat}</p>
                      <h3 className="display-md mt-2 text-bronze transition-colors duration-500 group-hover:text-copper">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm text-dust">
                        Mats Westbroek — {r.date}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-5">Hairline rule</p>
              <div className="rule" />
            </div>

            <div>
              <p className="eyebrow mb-5">Form field</p>
              <div className="max-w-md space-y-4">
                <label className="block">
                  <span className="eyebrow">Artist name</span>
                  <input
                    type="text"
                    placeholder="Your name or project"
                    className="mt-2 w-full rounded-[var(--radius-edge)] border border-bronze/25 bg-bone px-4 py-3 text-bronze placeholder:text-dust/60 transition-colors duration-500 focus:border-bronze focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow">What should we know?</span>
                  <textarea
                    rows={4}
                    placeholder="Keep it short."
                    className="mt-2 w-full resize-none rounded-[var(--radius-edge)] border border-bronze/25 bg-bone px-4 py-3 text-bronze placeholder:text-dust/60 transition-colors duration-500 focus:border-bronze focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ---------- Inverted section ---------- */}
      <div data-surface="dark" className="relative overflow-hidden bg-pitch">
        <LightWash origin="bottom-left" className="opacity-40" />
        <section className="mx-auto w-full max-w-6xl px-6 py-28 sm:px-10">
          <Reveal>
            <p className="eyebrow" style={{ color: "var(--color-amber)" }}>
              04 — Inverted
            </p>
            <h2 className="display-lg mt-4 text-bone">
              For the pitch portal
              <br />
              and late-night pages.
            </h2>
            <p
              className="prose-warm mt-8"
              style={{ color: "color-mix(in oklab, var(--color-bone) 72%, transparent)" }}
            >
              The dark surface is a companion to the light one, not a dark mode.
              It marks a change of register — submissions, sessions, anything
              that should feel like a different room.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <span className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-edge)] bg-amber px-6 py-3 text-sm tracking-wide text-pitch">
                Submit a demo
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-edge)] border border-bone/30 px-6 py-3 text-sm tracking-wide text-bone">
                Check status
              </span>
            </div>
          </Reveal>
        </section>
      </div>

      <LiquidDivider fill="var(--color-bone)" />

      <div className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
        <p className="eyebrow">End of styleguide</p>
      </div>
    </main>
  );
}
