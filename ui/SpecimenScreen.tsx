"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { screensFor, type TourStop } from "@/projects/projectScreens";
import { screenLayout, type ScreenLayout } from "@/projects/screenLayout";
import { PlateViewer } from "@/ui/PlateViewer";

import "./SpecimenScreen.css";

/**
 * SpecimenScreen — the project running, beside its stone.
 *
 * When a stone with a screenshot reaches the lens it steps left, and a screen
 * slides out from behind it into the frame on its right — the pair centred
 * together (projects/screenLayout.ts) — turned a little toward the
 * stone like the wing of a triptych, joined to it by a hairline in the
 * stone's own colour. It arrives after the stone, on the same
 * --specimen-presence the engraving and the controls use.
 *
 * It is too small to read whole, so it is toured: a slow camera leans in on
 * one part of the screen after another (projects/projectScreens.ts), and
 * holds still while the pointer is on it. Choosing it opens the full
 * screenshot (ui/PlateViewer.tsx).
 *
 * Where the frame beside the stone is too narrow — a phone, a squarer window
 * — the plate stays away and the stone's footer offers the screen instead
 * (SpecimenScreenButton).
 */

/** Where the plate stands for this window (screenLayout.ts), kept current. */
function useLayout(projectId: string): ScreenLayout | null {
  const [layout, setLayout] = useState<ScreenLayout | null>(null);
  useEffect(() => {
    const update = () =>
      setLayout(screenLayout(projectId, window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [projectId]);
  return layout;
}

type Styled = CSSProperties & {
  "--accent"?: string;
  "--plate-width"?: string;
  "--plate-left"?: string;
};

export function SpecimenScreen({
  projectId,
  accent,
  reducedMotion,
}: {
  projectId: string;
  accent: string;
  reducedMotion: boolean;
}) {
  const screens = screensFor(projectId);
  const layout = useLayout(projectId);
  const width = layout?.width ?? 0;
  const [open, setOpen] = useState<number | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const tour = useRef<Animation | null>(null);

  const screen = screens[0];

  // The stone has stepped left, under where the section heading sits; the
  // heading gives way while the pair is on screen (globals.css).
  useEffect(() => {
    if (!layout) return;
    const root = document.documentElement;
    root.dataset.specimenPaired = "true";
    return () => {
      delete root.dataset.specimenPaired;
    };
  }, [layout]);

  // The tour: move, hold, move, hold — and round again.
  useEffect(() => {
    const el = image.current;
    if (!el || !screen || reducedMotion || width === 0) return;
    tour.current = el.animate(tourFrames(screen.tour), {
      duration: screen.tour.length * 4600,
      iterations: Infinity,
      delay: 900,
    });
    return () => tour.current?.cancel();
  }, [screen, reducedMotion, width]);

  if (!screen || !layout) return null;

  return (
    <figure
      className="screen-plate"
      style={
        {
          "--accent": accent,
          "--plate-width": `${layout.width}px`,
          "--plate-left": `${layout.left}px`,
        } as Styled
      }
    >
      <button
        type="button"
        className="screen-plate__window"
        onClick={() => setOpen(0)}
        onPointerEnter={() => tour.current?.pause()}
        onPointerLeave={() => tour.current?.play()}
        aria-label={`${screen.title}: open the full screenshot`}
        style={{ aspectRatio: `${screen.width} / ${screen.height}` }}
      >
        <img
          ref={image}
          src={screen.src}
          width={screen.width}
          height={screen.height}
          alt={screen.alt}
          decoding="async"
        />
      </button>
      <figcaption className="screen-plate__caption">
        <span className="screen-plate__code">Screen {screen.code}</span>
        <span className="screen-plate__title">{screen.title}</span>
        <span className="screen-plate__open" aria-hidden="true">
          Open ↗
        </span>
      </figcaption>

      {open !== null ? (
        <PlateViewer
          plates={screens}
          index={open}
          onStep={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </figure>
  );
}

/**
 * The same screens, from the stone's footer, for the windows where the plate
 * has no room beside the stone. Absent where the plate is showing: one way
 * to the screen at a time.
 */
export function SpecimenScreenButton({ projectId }: { projectId: string }) {
  const screens = screensFor(projectId);
  const layout = useLayout(projectId);
  const [open, setOpen] = useState<number | null>(null);
  if (screens.length === 0 || layout) return null;

  return (
    <>
      <button
        type="button"
        className="specimen__link specimen__link--screen"
        onClick={() => setOpen(0)}
      >
        See it running
        <span aria-hidden="true">▣</span>
      </button>
      {open !== null ? (
        <PlateViewer
          plates={screens}
          index={open}
          onStep={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

/**
 * Tour stops to keyframes. Each stop centres its point (x, y) in the window
 * at its scale, clamped so the view never runs off the edge of the image.
 * Each stop is held for two thirds of its leg, then the view moves on.
 */
function tourFrames(stops: TourStop[]): Keyframe[] {
  const place = ({ x, y, scale }: TourStop) => {
    const half = 0.5 / scale;
    const cx = Math.min(Math.max(x, half), 1 - half);
    const cy = Math.min(Math.max(y, half), 1 - half);
    const tx = scale * (0.5 - cx) * 100;
    const ty = scale * (0.5 - cy) * 100;
    return `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${scale})`;
  };
  const leg = 1 / stops.length;
  const frames: Keyframe[] = [];
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)";
  stops.forEach((stop, i) => {
    frames.push({ offset: i * leg, transform: place(stop), easing: ease });
    frames.push({ offset: (i + 0.66) * leg, transform: place(stop), easing: ease });
  });
  // ...and back to the first stop, so the loop is seamless.
  frames.push({ offset: 1, transform: place(stops[0]) });
  return frames;
}
