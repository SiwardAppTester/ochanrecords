import Image from "next/image";
import Link from "next/link";
import { LightWash } from "@/components/LightWash";
import { LiquidDivider } from "@/components/LiquidDivider";
import { Reveal } from "@/components/Reveal";
import { Artwork } from "@/components/site/Artwork";
import { PhotoBackdrop } from "@/components/site/PhotoBackdrop";
import { Waveform } from "@/components/site/Waveform";
import { ButtonLink } from "@/components/ui/Button";
import { ReleaseMarquee } from "@/components/site/ReleaseMarquee";
import { getArtists, getEvents } from "@/lib/content";
import { getDiscography } from "@/lib/spotify";

import { formatMonthYear, formatEventDate } from "@/lib/format";

// Spotify data is cached for an hour inside lib/spotify; this stops the page
// itself from being frozen at build time. Without it the page is generated
// once, during the deploy, and a build that happened while Spotify was
// unreachable stays empty forever — which is exactly what happened here.
export const revalidate = 3600;


export default async function Home() {
  const [artists, events] = await Promise.all([getArtists(), getEvents()]);

  const artist = artists[0];
  const albums = await getDiscography(artist?.links.spotify);
  const nextEvent = events.upcoming[0];

  return (
    <main className="flex-1">
      {/* ---------- Hero
           No headline, no buttons. The logo already carries the name in the
           corner, so repeating it in 9rem type is decoration, and a CTA pair
           here would make an image this quiet work as a billboard. What's
           left is the picture, one line, and room. ---------- */}
      <section
        data-surface="dark"
        className="relative flex h-svh flex-col justify-end overflow-hidden px-6 pb-10 sm:px-10 sm:pb-12"
      >
        {/* Anchored left: the ribbons and their specular highlights live on
            the right of the frame, so pulling the crop left keeps the open
            side of the picture under the type. */}
        <PhotoBackdrop
          src="/textures/accent.jpg"
          scrim="hairline-dark"
          position="35% center"
          priority
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="flex items-end justify-between gap-10">
            <p className="max-w-md font-display text-2xl leading-[1.25] text-bone sm:text-3xl">
              A short roster,
              <br />
              <em className="italic">released slowly.</em>
            </p>

            {/* Small, faint, and sitting just above the ruled footer line —
                the picture of the music that is already playing, not a
                control and not a second headline. */}
            <Waveform
              height={30}
              color="bg-bone"
              className="hidden w-36 opacity-40 sm:flex"
            />


          </div>

          {/* Ruled footer line: where the label is, and the cue to move on.
              Minimal, but it stops the frame ending in nothing. */}
          <div
            className="mt-8 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, color-mix(in oklab, var(--color-bone) 30%, transparent), color-mix(in oklab, var(--color-bone) 8%, transparent))",
            }}
          />
          <div className="mt-4 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
            <span>Amsterdam</span>
            <span className="hidden sm:inline">Independent — Est. 1807</span>
            <span>Scroll ↓</span>
          </div>
        </div>
      </section>

      <LiquidDivider fill="var(--color-shell)" />

      {/* ---------- Roster
           No artist grid. One artist in a three-across grid looks like a
           site waiting for content; the same artist given a full-width
           editorial panel looks like a deliberate choice. ---------- */}
      {artist && (
        <section className="relative overflow-hidden bg-shell">
          {/* The misty image as texture rather than subject — veiled almost
              all the way back to the surface colour, so it reads as an
              unevenness in the paper instead of a photograph. */}
          <PhotoBackdrop
            src="/textures/veil.jpg"
            scrim="veil"
            position="center"
          />
          <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
            <Reveal>
              <p className="eyebrow">The roster</p>
              <div className="rule mt-5 mb-12" />

              <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                <div>
                  <p className="eyebrow">{artist.role}</p>
                  <h2 className="display-lg mt-3 text-bronze">{artist.name}</h2>
                  <p className="prose-warm mt-6">{artist.bio}</p>
                  <div className="mt-8">
                    <ButtonLink
                      href={`/artists/${artist.slug}`}
                      variant="outline"
                    >
                      Read more
                    </ButtonLink>
                  </div>
                </div>

                {artist.portraitUrl ? (
                  <Image
                    src={artist.portraitUrl}
                    alt={artist.name}
                    width={1080}
                    height={1080}
                    className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 object-cover"
                  />
                ) : (
                  <div className="panel flex aspect-[4/5] items-end p-8 lg:aspect-square">
                    <p className="font-display text-2xl leading-snug text-bronze/70">
                      One artist.
                      <br />
                      <em className="italic">That&apos;s the point.</em>
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <LiquidDivider fill="var(--color-bone)" />

      {/* ---------- Releases
           A drifting wall rather than a four-up grid: the catalogue is long
           enough that a fixed grid would have to pick winners, and this way
           records keep arriving without anyone clicking. ---------- */}
      {albums.length > 0 && (
        <section className="py-24">
          <div className="mx-auto mb-12 flex w-full max-w-6xl items-end justify-between px-6 sm:px-10">
            <div>
              <p className="eyebrow">Catalogue</p>
              <h2 className="display-md mt-3 text-bronze">Records</h2>
            </div>
            <Link
              href="/releases"
              className="eyebrow transition-colors duration-500 hover:text-copper"
            >
              All →
            </Link>
          </div>
          <ReleaseMarquee albums={albums} />
        </section>
      )}

      {/* ---------- Next date ---------- */}
      {nextEvent && (
        <section
          data-surface="dark"
          className="relative overflow-hidden bg-pitch"
        >
          {/* Flat, deliberately. The ribbon image now carries the hero at the
              top of this same page; repeating it here would read as one long
              backdrop rather than two moments. A plain dark band gives the
              picture above somewhere to land. */}
          <LightWash origin="bottom-left" className="opacity-25" />
          <div className="mx-auto w-full max-w-6xl px-6 py-32 sm:px-10">
            <Reveal>
              <p className="eyebrow" style={{ color: "var(--color-amber)" }}>
                Next date
              </p>
              <h2 className="display-lg mt-4 text-bone">{nextEvent.title}</h2>
              <p className="mt-4 font-mono text-sm text-bone/60">
                {formatEventDate(nextEvent.startsAt)}
                {nextEvent.venue && ` — ${nextEvent.venue}`}
                {nextEvent.city && `, ${nextEvent.city}`}
              </p>
              <div className="mt-9">
                <Link
                  href="/dates"
                  className="inline-flex items-center rounded-[var(--radius-edge)] border border-bone/30 px-6 py-3 text-sm tracking-wide text-bone transition-colors duration-500 hover:bg-bone/10"
                >
                  All dates
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Pitch
           One line, one link, two rules. Everything the section used to say
           — the reference code, the three states, what not to send — is on
           the portal page itself, where someone is actually about to send
           something. Here it only has to be an invitation. ---------- */}
      <section className="mx-auto w-full max-w-6xl px-6 py-40 sm:px-10">
        <Reveal>
          <div className="rule" />

          <div className="flex items-baseline justify-between pt-6">
            <p className="eyebrow">Demos</p>
            <p className="eyebrow">Open</p>
          </div>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
            <h2
              className="font-display text-bronze"
              style={{
                fontSize: "clamp(2.75rem, 9vw, 7rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              Send one track.
            </h2>
            {/* The track itself, as a figure. Sits on the baseline of the
                headline so the two read as one line rather than as a
                heading with a graphic parked next to it. */}
            <Waveform
              height={72}
              color="bg-copper"
              className="w-full max-w-sm lg:flex-1"
            />
          </div>

          <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <Link
              href="/submit"
              className="group inline-flex items-baseline gap-4 border-b border-bronze/25 pb-2 transition-colors duration-500 hover:border-copper"
            >
              <span className="font-display text-2xl text-bronze transition-colors duration-500 group-hover:text-copper sm:text-3xl">
                Open the portal
              </span>
              <span className="font-mono text-xs text-dust transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-dust">
              We reply to all of them
            </p>
          </div>
        </Reveal>
      </section>

    </main>
  );
}
