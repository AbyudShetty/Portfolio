"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import {
  screensFor,
  windowAspect,
  type ProjectScreen,
  type TourStop,
} from "@/projects/projectScreens";
import { screenLayout, type ScreenLayout } from "@/projects/screenLayout";
import { PlateViewer } from "@/ui/PlateViewer";

import "./SpecimenScreen.css";

/**
 * SpecimenScreen — the project running, beside its stone.
 *
 * When a stone with a screenshot reaches the lens it steps left, and a screen
 * slides out from behind it into the frame on its right — the pair centred
 * together (projects/screenLayout.ts) — turned a little toward the stone like
 * the wing of a triptych, joined to it by a hairline in the stone's own
 * colour. It arrives after the stone, on the same --specimen-presence the
 * engraving and the controls use.
 *
 * It is too small to read whole, so it is toured: a slow camera leans in on
 * one part of the screen after another (projects/projectScreens.ts), and
 * holds still while the pointer is on it. A project with several screens is
 * a deck — the next ones edged in behind — and moves on to the next screen
 * after each tour; the dots under it choose one directly. Choosing the
 * screen opens it full size (ui/PlateViewer.tsx), stepping through the deck.
 *
 * Where the frame beside the stone is too narrow — a phone, a squarer window
 * — the plate stays away and the stone's footer offers the screens instead
 * (SpecimenScreenButton).
 */

/** How long each tour stop lasts, move and hold together. */
const STOP_MS = 4600;

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
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const tour = useRef<Animation | null>(null);

  const screen = screens[current];
  const count = screens.length;
  const aspect = windowAspect(projectId);
  const windowWidth = layout?.width ?? 0;
  const windowHeight = windowWidth / aspect;
  const fitted = screen ? fit(screen, windowWidth, windowHeight) : null;

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

  // The tour: move, hold, move, hold. One screen loops on itself; a deck
  // plays each screen's tour once and moves on to the next.
  useEffect(() => {
    const el = image.current;
    if (!el || !screen || !fitted || reducedMotion) return;
    const animation = el.animate(
      tourFrames(screen.tour, fitted, windowWidth, windowHeight),
      {
        duration: screen.tour.length * STOP_MS,
        iterations: count > 1 ? 1 : Infinity,
        delay: current === 0 ? 900 : 300,
        fill: "both",
      },
    );
    if (count > 1) {
      animation.onfinish = () => setCurrent((index) => (index + 1) % count);
    }
    tour.current = animation;
    return () => animation.cancel();
    // `fitted` is left out on purpose: it is rebuilt every render from the
    // screen and the window size, which are here.
  }, [screen, count, current, reducedMotion, windowWidth, windowHeight]);

  if (!screen || !layout || !fitted) return null;

  return (
    <figure
      className="screen-plate"
      data-deck={count > 1 ? "true" : "false"}
      style={
        {
          "--accent": accent,
          "--plate-width": `${layout.width}px`,
          "--plate-left": `${layout.left}px`,
        } as Styled
      }
    >
      <div className="screen-plate__stack">
        {/* The rest of the deck, edged in behind the screen on show. */}
        {count > 1 ? (
          <span className="screen-plate__card" aria-hidden="true" />
        ) : null}
        {count > 2 ? (
          <span
            className="screen-plate__card screen-plate__card--far"
            aria-hidden="true"
          />
        ) : null}

        <button
          type="button"
          className="screen-plate__window"
          data-screen={screen.screen ? "true" : "false"}
          onClick={() => setOpen(current)}
          onPointerEnter={() => tour.current?.pause()}
          onPointerLeave={() => tour.current?.play()}
          aria-label={`${screen.title}: open full size`}
          style={{ aspectRatio: String(aspect) }}
        >
          <img
            key={screen.id}
            ref={image}
            src={screen.src}
            width={screen.width}
            height={screen.height}
            alt={screen.alt}
            decoding="async"
            style={{
              width: fitted.width,
              height: fitted.height,
              transform: `translate(${fitted.x}px, ${fitted.y}px)`,
            }}
          />
        </button>
      </div>

      <figcaption className="screen-plate__caption">
        <span className="screen-plate__code">
          {count > 1 ? `${screen.code} / ${pad(count)}` : `Screen ${screen.code}`}
        </span>
        <span className="screen-plate__title">{screen.title}</span>
        {count > 1 ? (
          <span className="screen-plate__dots">
            {screens.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="screen-plate__dot"
                aria-label={`Show ${item.title}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => setCurrent(index)}
              />
            ))}
          </span>
        ) : (
          <span className="screen-plate__open" aria-hidden="true">
            Open ↗
          </span>
        )}
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
 * to the screens at a time.
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
        {screens.length > 1 ? ` (${screens.length})` : ""}
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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface Fitted {
  /** The image's size fitted whole inside the window, px. */
  width: number;
  height: number;
  /** Where it sits when fitted: centred, px. */
  x: number;
  y: number;
}

/** The image fitted whole inside the window (contain), centred. */
function fit(screen: ProjectScreen, w: number, h: number): Fitted {
  const k = Math.min(w / screen.width, h / screen.height);
  const width = screen.width * k;
  const height = screen.height * k;
  return { width, height, x: (w - width) / 2, y: (h - height) / 2 };
}

/**
 * Tour stops to keyframes, in pixels of the window. Each stop centres its
 * point (x, y) at its scale — 1 being the image fitted whole — and is
 * clamped so the view never runs off the image where the image is larger
 * than the window; where it is smaller, it stays centred. Each stop is held
 * for two thirds of its leg, then the view moves on; the last leg returns to
 * the first stop, so a loop, or the change to the next screen, is seamless.
 */
function tourFrames(
  stops: TourStop[],
  fitted: Fitted,
  w: number,
  h: number,
): Keyframe[] {
  const axis = (focus: number, size: number, view: number) => {
    if (size <= view) return (view - size) / 2;
    const t = view / 2 - focus * size;
    return Math.min(0, Math.max(view - size, t));
  };
  const place = ({ x, y, scale }: TourStop) => {
    const tx = axis(x, fitted.width * scale, w);
    const ty = axis(y, fitted.height * scale, h);
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${scale})`;
  };
  const leg = 1 / stops.length;
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)";
  const frames: Keyframe[] = [];
  stops.forEach((stop, i) => {
    frames.push({ offset: i * leg, transform: place(stop), easing: ease });
    frames.push({ offset: (i + 0.66) * leg, transform: place(stop), easing: ease });
  });
  frames.push({ offset: 1, transform: place(stops[0]) });
  return frames;
}
