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
  const trailRef = useRef<HTMLCanvasElement>(null);
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

    /*
      The shooting-star tail. The reticle's recent path, kept for TRAIL_MS
      and drawn as a line that tapers and fades from the head back — thick
      and bright where the pointer is, a hairline where it was. When the
      pointer stops, the tail catches up and vanishes into the head.
    */
    const TRAIL_MS = 250;
    const canvas = trailRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    const trail: { x: number; y: number; t: number }[] = [];
    let drawn = false;
    const size = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
    };
    size();
    window.addEventListener("resize", size);

    const drawTrail = (now: number) => {
      if (!canvas || !ctx) return;
      while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
      if (drawn) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawn = false;
      if (trail.length < 2) return;
      const n = trail.length;
      for (let i = 1; i < n; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const fresh = 1 - (now - b.t) / TRAIL_MS;
        const along = i / (n - 1);
        const k = Math.max(0, Math.min(fresh, along));
        ctx.strokeStyle = `rgba(255, 240, 222, ${(0.7 * k * k).toFixed(3)})`;
        ctx.lineWidth = 0.3 + 2.2 * k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      drawn = true;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      x = damp(x, pointer.x, 13, dt);
      y = damp(y, pointer.y, 13, dt);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      const tail = trail[trail.length - 1];
      if (!tail || Math.hypot(tail.x - x, tail.y - y) > 0.4) {
        trail.push({ x, y, t: now });
      }
      drawTrail(now);

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
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
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
    <>
      <canvas ref={trailRef} className="cursor-trail" aria-hidden="true" />
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
    </>
  );
}
