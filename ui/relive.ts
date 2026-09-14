import { useEffect } from "react";

import { cameraSnap } from "@/hooks/useScrollProgress";

/**
 * relive — back to the first frame, through a flash of light.
 *
 * The journey ends inside a room of the tesseract whose light fills the
 * screen. Reaching the bottom of the page turns that light into this flash:
 * it rises, the document jumps to the top behind it, the camera is told to
 * cut rather than fly the whole distance back, and the flash falls away on
 * the landing — the reader is at the beginning again, free to scroll down and
 * live it a second time.
 */

const FLASH_IN_MS = 520;
const FLASH_OUT_MS = 1400;

let running = false;

export function relive(): void {
  if (running) return;
  running = true;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.dataset.relive = "in";
  window.setTimeout(
    () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      cameraSnap.pending = true;
      root.dataset.relive = "out";
      window.setTimeout(() => {
        delete root.dataset.relive;
        running = false;
      }, FLASH_OUT_MS);
    },
    reduced ? 0 : FLASH_IN_MS,
  );
}

/**
 * Relives automatically when the reader scrolls to the very bottom.
 *
 * Armed only once the reader has been somewhere above the last stretch, so a
 * page that loads (or restores) already at the bottom doesn't bounce away.
 */
export function useReliveAtEnd(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let armed = false;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const y = window.scrollY;
      if (y < max * 0.9) armed = true;
      if (armed && y >= max - 2) {
        armed = false;
        relive();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}
