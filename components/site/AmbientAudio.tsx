"use client";

import { usePathname } from "next/navigation";
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
// Slow enough to arrive rather than announce itself, short enough that the
// opening seconds are actually audible — at six seconds the first bars were
// effectively silent and the music seemed not to have started.
const FADE_MS = 3000;
const STORAGE_KEY = "ocham:audio-muted";

export function AmbientAudio() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  // Sound is on unless the visitor has turned it off. Starting this at
  // `false` made the control show the muted line during the second or two
  // before playback is allowed — so a page that was about to play looked
  // like a page that had decided not to.
  const [soundOn, setSoundOn] = useState(true);
  const [available, setAvailable] = useState(false);

  // Same treatment as the logo: the icon splits along a dark section edge
  // rather than switching colour at a threshold.
  //
  // `pathname` is load-bearing. Without it the hook never re-queries after a
  // client-side navigation, so it keeps measuring against the previous
  // page's dark sections — which are no longer in the document and report an
  // empty rect, leaving the icon dark on a dark page.
  const [band] = useDarkBands([buttonRef], [available, soundOn, pathname]);

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
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      setSoundOn(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    let raf = 0;
    const fadeIn = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FADE_MS);
        // Ramp from a floor, not from silence.
        audio.volume = TARGET_VOLUME * (0.15 + 0.85 * t);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // Guard against re-entry. Without it a single scroll — which fires
    // dozens of events — called start() dozens of times, and each call reset
    // the volume to 0 and began a fresh fade. The track was playing the
    // whole time, held at silence by its own restarts, which is why it only
    // seemed to work when the button forced the volume up.
    let started = false;

    /**
     * Unmute an already-running track, or start it outright.
     *
     * Browsers refuse *audible* autoplay before a gesture, but they permit
     * muted playback. So on load the track starts muted and keeps running:
     * by the time permission arrives it is already thirty seconds in and
     * simply becomes audible, instead of beginning from the top. That is as
     * close to "it was always playing" as the platform allows.
     */
    const goAudible = () => {
      if (started) return;
      started = true;
      detach();

      audio.muted = false;
      audio.volume = 0;

      const resume = audio.paused ? audio.play() : Promise.resolve();
      resume
        .then(() => {
          // Verify, don't assume. Setting `muted = false` on an already
          // playing element does not reject — the browser simply ignores it,
          // or pauses the element, and the promise still resolves. Trusting
          // it meant we detached the gesture listeners while the track was
          // still silent, so nothing but the button could ever recover it.
          // That is the "sometimes there is no sound until you press it".
          window.setTimeout(() => {
            if (audio.muted || audio.paused) {
              started = false;
              audio.muted = true;
              if (audio.paused) void audio.play().catch(() => {});
              attach();
              return;
            }
            setPlaying(true);
            setSoundOn(true);
            fadeIn();
          }, 60);
        })
        .catch(() => {
          // Refused outright. Fall back to silent playback and wait.
          started = false;
          audio.muted = true;
          void audio.play().catch(() => {});
          attach();
        });
    };

    // Muted playback is allowed without a gesture, so get the track moving
    // immediately and try to make it audible in the same breath. On a repeat
    // visit the browser usually says yes and nothing is ever silent.
    const start = () => {
      audio.muted = true;
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          goAudible();
        })
        .catch(() => {
          // Even muted playback refused — rare. Gestures will handle it.
          attach();
        });
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    // Not `{ once: true }`. A gesture that fails to win permission would
    // otherwise consume the only listener and leave the page permanently
    // silent; goAudible's own re-entry guard already prevents duplicates.
    const attach = () =>
      events.forEach((e) =>
        window.addEventListener(e, goAudible, { passive: true }),
      );
    const detach = () =>
      events.forEach((e) => window.removeEventListener(e, goAudible));

    // Straight away, while the intro curtain is still up — so the music is
    // already rising by the time the page is revealed, rather than starting
    // after it. Blocked attempts fall through to the gesture listeners.
    const timer = window.setTimeout(start, 150);
    attach();

    return () => {
      window.clearTimeout(timer);
      detach();
      cancelAnimationFrame(raf);
    };
  }, [available]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn && playing && !audio.muted) {
      audio.pause();
      setSoundOn(false);
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      audio.muted = false;
      audio.volume = TARGET_VOLUME;
      audio.play().then(() => {
        setPlaying(true);
        setSoundOn(true);
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
        aria-label={soundOn ? "Mute music" : "Play music"}
        title={soundOn ? "Mute music" : "Play music"}
        // Above the grain layer (z-50), which is multiply-blended: sitting
        // under it dragged the light colourway back toward the background
        // and hid the switch entirely. The header is at z-60 for the same
        // reason — anything that has to stay a specific colour belongs on
        // top of the grain.
        className="group fixed bottom-7 right-7 z-[60] block h-5 w-9 sm:bottom-9 sm:right-10"
      >
        <span className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
          <Icon muted={!soundOn} color="bg-bronze" line="bg-bronze" />
        </span>
        <span
          aria-hidden
          className="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          style={{ clipPath: bandClip(band) }}
        >
          <Icon muted={!soundOn} color="bg-bone" line="bg-bone" />
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
