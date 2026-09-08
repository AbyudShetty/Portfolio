"use client";

import { useSyncExternalStore } from "react";

/**
 * Field state — a tiny external store rather than React context.
 *
 * Two reasons. First, React context does not cross the R3F reconciler
 * boundary without a bridge, and the DOM chrome and the scene both need this
 * state. Second, and more importantly: pointer position and the live
 * coordinate readout change every frame. Routing those through React state
 * would re-render the whole tree 60 times a second, so the high-frequency
 * values live in plain mutable objects that consumers read inside their own
 * animation loop, and only discrete state changes (hover in/out, focus,
 * selection, view) go through the subscription.
 */

export type FieldView = "field" | "experience";

export interface FieldState {
  hoveredId: string | null;
  /** Keyboard focus — moves the camera exactly as pointer hover does (§12.4). */
  focusedId: string | null;
  selectedId: string | null;
  view: FieldView;
  /** True once the calibration sequence has finished (§10.0). */
  calibrated: boolean;
}

let state: FieldState = {
  hoveredId: null,
  focusedId: null,
  selectedId: null,
  view: "field",
  calibrated: false,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(patch: Partial<FieldState>) {
  let changed = false;
  for (const key of Object.keys(patch) as (keyof FieldState)[]) {
    if (state[key] !== patch[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  emit();
}

export const fieldActions = {
  hover(id: string | null) {
    setState({ hoveredId: id });
  },
  focus(id: string | null) {
    setState({ focusedId: id });
  },
  select(id: string | null) {
    setState({ selectedId: id });
  },
  setView(view: FieldView) {
    // Leaving a marked position clears transient object state so the camera
    // always returns to a known frame rather than a half-interacted one.
    setState({ view, selectedId: null, focusedId: null });
  },
  setCalibrated(calibrated: boolean) {
    setState({ calibrated });
  },
};

export function useFieldState(): FieldState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function getFieldState(): FieldState {
  return state;
}

/**
 * Selector subscription — an object only re-renders when the slice it cares
 * about changes, so hovering one object doesn't re-render the other twelve.
 * Selectors must return primitives.
 */
export function useFieldSelector<T>(selector: (s: FieldState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

/* ── High-frequency values — read per frame, never through React ─────────── */

/** Pointer in CSS pixels, plus whether a fine pointer is present at all. */
export const pointer = {
  x: -9999,
  y: -9999,
  /** −1..1 normalised, for parallax. */
  nx: 0,
  ny: 0,
  present: false,
  down: false,
};

/** What the top rail and cursor print. Written by the scene each frame. */
export const readout = {
  code: "FIELD",
  coordinate: "0.0, 0.0, 0.0",
  /** Set while hovering an object; the rail falls back to camera position. */
  objectCode: null as string | null,
  objectCoordinate: null as string | null,
};

export function attachPointerTracking(): () => void {
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.present = e.pointerType === "mouse";
  };
  const onDown = () => {
    pointer.down = true;
  };
  const onUp = () => {
    pointer.down = false;
  };
  const onLeave = () => {
    pointer.x = -9999;
    pointer.y = -9999;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointerleave", onLeave, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointerleave", onLeave);
  };
}
