"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import "./PlateViewer.css";

/**
 * PlateViewer — one image, large, over the scene.
 *
 * Shared by the lab plates in the Experience (ui/sections/LabPlates.tsx) and
 * the screens beside an opened stone (ui/SpecimenScreen.tsx). Arrows step
 * through the set, Escape or any scroll puts it back.
 *
 * Its keys are taken in the capture phase and stopped there: an opened stone
 * listens for the same Escape and arrows on the window, and a reader closing
 * a screenshot must not also close the stone or step to the next project.
 */

export interface Plate {
  id: string;
  /** Mono index, e.g. "01". */
  code: string;
  title: string;
  caption: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** A screenshot rather than a cut-out subject: shown as the screen it is. */
  screen?: boolean;
}

export function PlateViewer({
  plates,
  index,
  onStep,
  onClose,
}: {
  plates: Plate[];
  index: number;
  onStep: (index: number) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const plate = plates[index];
  const count = plates.length;
  const step = useCallback(
    (by: number) => onStep((index + by + count) % count),
    [index, count, onStep],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) step(1);
      else if (e.key === "ArrowLeft" && count > 1) step(-1);
      else if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    // The journey goes on underneath; scrolling it means the reader is done.
    const onScroll = () => onClose();
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, [onClose, step, count]);

  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
  }, []);

  return createPortal(
    <div className="plate-view">
      <button
        type="button"
        className="plate-view__scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panel}
        className="plate-view__panel"
        role="dialog"
        aria-modal="true"
        aria-label={plate.title}
        tabIndex={-1}
      >
        <figure className="plate-view__figure">
          {/* Keyed, so each plate arrives with its own fade while the
              controls (and their focus) stay put. */}
          <span
            key={plate.id}
            className="plate-view__frame"
            data-screen={plate.screen ? "true" : "false"}
          >
            <img
              src={plate.src}
              width={plate.width}
              height={plate.height}
              alt={plate.alt}
            />
          </span>
          <div className="plate-view__foot">
            <figcaption className="plate-view__caption">
              <span className="plate-view__code">
                {plate.code} / {String(count).padStart(2, "0")}
              </span>
              <span className="plate-view__title">{plate.title}</span>
              <span className="plate-view__text">{plate.caption}</span>
            </figcaption>

            <div className="plate-view__controls">
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    className="plate-view__step"
                    onClick={() => step(-1)}
                    aria-label="Previous"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="plate-view__step"
                    onClick={() => step(1)}
                    aria-label="Next"
                  >
                    →
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="plate-view__close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        </figure>
      </div>
    </div>,
    document.body,
  );
}
