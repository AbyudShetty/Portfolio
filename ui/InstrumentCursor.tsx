"use client";

import { useEffect, useRef } from "react";

import { pointer, readout, useFieldSelector } from "@/hooks/useFieldState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasFinePointer, useMounted } from "@/hooks/useViewport";
import { damp } from "@/lib/spring";

/**
 * InstrumentCursor — a reticle, not a blob (DESIGN.md §8.2).
 *
 * Three states built from hairlines: a dot at rest, a ring over anything
 * interactive, and a ring plus coordinate readout over a field object. It
 * trails at a lerp of 0.22 — enough lag to feel like a physical instrument,
 * little enough to stay accurate.
 *
 * Removed entirely on touch devices and under reduced motion, where the native
 * cursor is returned rather than approximated.
 */
export function InstrumentCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const hoveredId = useFieldSelector((s) => s.hoveredId);
  const reducedMotion = useReducedMotion();
  const finePointer = useHasFinePointer();
  const mounted = useMounted();

  const enabled = mounted && finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = pointer.x;
    let y = pointer.y;
    let last = performance.now();
    let lastText = "";

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      x = damp(x, pointer.x, 13, dt);
      y = damp(y, pointer.y, 13, dt);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      const text = readout.objectCode
        ? `${readout.objectCode}  ${readout.objectCoordinate ?? ""}`
        : "";
      if (text !== lastText && readoutRef.current) {
        readoutRef.current.textContent = text;
        lastText = text;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    document.body.dataset.customCursor = "true";
    return () => {
      delete document.body.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className="cursor"
      data-state={hoveredId ? "object" : "default"}
      aria-hidden="true"
    >
      <span className="cursor__ring" />
      <span className="cursor__dot" />
      <span ref={readoutRef} className="cursor__readout" />
    </div>
  );
}
