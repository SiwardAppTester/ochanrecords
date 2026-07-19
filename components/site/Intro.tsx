import Image from "next/image";
import { Waveform } from "@/components/site/Waveform";

/**
 * Load curtain.
 *
 * A server component with no state and no effects: the whole thing is a CSS
 * animation with `forwards` fill, so it clears itself even if JavaScript
 * never runs. An overlay whose removal depends on JS is one failed bundle
 * away from a site nobody can use — worth avoiding for two seconds of motion.
 *
 * `pointer-events-none` from the start means it never swallows a click even
 * while it's still fading.
 */
export function Intro() {
  return (
    <div
      aria-hidden
      className="intro pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-bone"
    >
      <Image
        src="/brand/logo/lockup-dark.png"
        alt=""
        width={900}
        height={900}
        priority
        className="intro-mark h-40 w-auto sm:h-52"
      />
      <div className="intro-mark w-56 sm:w-80" style={{ animationDelay: "260ms" }}>
        <Waveform height={40} color="bg-bronze" />
      </div>
    </div>
  );
}
