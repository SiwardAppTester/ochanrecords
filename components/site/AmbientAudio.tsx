"use client";

import { useEffect, useRef, useState } from "react";
import { Waveform } from "@/components/site/Waveform";
import { bandClip, useDarkBands } from "@/lib/useDarkBand";

/**
 * Background music.
 *
 * Starts as close to automatically as the web permits. Every browser blocks
 * audio until the visitor has interacted with the page, so this tries to
 * play immediately after the intro clears, and if that is refused it waits
 * for the first pointer, key or scroll event and starts then — usually
 * within a second or two, which reads as automatic.
 *
 * Volume fades in rather than cutting on, and there is always a visible mute
 * control: unexpected sound with no obvious way to stop it is the single
 * fastest way to lose a visitor.
 *
 * The choice is remembered, so someone who mutes stays muted on return.
 */

// AAC at 128 kbps rather than the 320 kbps source: a third of the weight,
// and nobody is judging fidelity through a laptop speaker while reading a
// homepage. Universally supported.
const SRC = "/audio/theme.m4a";
const TARGET_VOLUME = 0.32;
// Long, slow rise. The track should arrive under the intro rather than
// announce itself once the page is already up.
const FADE_MS = 6000;
const STORAGE_KEY = "ocham:audio-muted";

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [available, setAvailable] = useState(false);

  // Same treatment as the logo: the icon splits along a dark section edge
  // rather than switching colour at a threshold.
  const [band] = useDarkBands([buttonRef], [available, muted]);

  // Only mount the control once the file is confirmed present, so a missing
  // track leaves no orphan button on the page.
  useEffect(() => {
    let cancelled = false;
    fetch(SRC, { method: "HEAD" })
      .then((res) => !cancelled && setAvailable(res.ok))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!available) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const audio = audioRef.current;
    if (!audio) return;

    let raf = 0;
    const fadeIn = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FADE_MS);
        audio.volume = TARGET_VOLUME * t;
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setMuted(false);
          fadeIn();
          detach();
        })
        .catch(() => {
          // Blocked. The listeners below will catch the first gesture.
        });
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    const detach = () =>
      events.forEach((e) => window.removeEventListener(e, start));

    // Straight away, while the intro curtain is still up — so the music is
    // already rising by the time the page is revealed, rather than starting
    // after it. Blocked attempts fall through to the gesture listeners.
    const timer = window.setTimeout(start, 150);
    events.forEach((e) =>
      window.addEventListener(e, start, { once: false, passive: true }),
    );

    return () => {
      window.clearTimeout(timer);
      detach();
      cancelAnimationFrame(raf);
    };
  }, [available]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing && !muted) {
      audio.pause();
      setMuted(true);
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      audio.volume = TARGET_VOLUME;
      audio.play().then(() => {
        setPlaying(true);
        setMuted(false);
        localStorage.removeItem(STORAGE_KEY);
      });
    }
  }

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="auto" />

      {/* Icon only, no chrome. Both colourways stacked and the light one
          clipped to the dark band, exactly as the logo behaves — so the
          control reads on a sand page and on the near-black hero without
          a box drawn around it. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={muted ? "Play music" : "Mute music"}
        title={muted ? "Play music" : "Mute music"}
        className="group fixed bottom-7 right-7 z-40 block h-5 w-9 sm:bottom-9 sm:right-10"
      >
        <span className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
          <Icon muted={muted} color="bg-bronze" line="bg-bronze" />
        </span>
        <span
          aria-hidden
          className="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          style={{ clipPath: bandClip(band) }}
        >
          <Icon muted={muted} color="bg-bone" line="bg-bone" />
        </span>
      </button>
    </>
  );
}

/**
 * Playing: the waveform moves. Muted: it collapses to a flat line.
 * No speaker glyph and no cross — the same figure used everywhere else on
 * the site, simply at rest.
 */
function Icon({
  muted,
  color,
  line,
}: {
  muted: boolean;
  color: string;
  line: string;
}) {
  if (muted) {
    return (
      <span className="flex h-full w-full items-center">
        <span className={`h-[2px] w-full rounded-full ${line}`} />
      </span>
    );
  }
  // Five bars, not thirty-two: at this size the full figure has no room and
  // every bar collapses to zero width.
  return (
    <Waveform
      height={20}
      count={5}
      gap={3}
      color={color}
      className="w-full"
    />
  );
}
