/**
 * reveal — the staging system.
 *
 * Three scroll-driven factors govern what exists in the scene and where:
 *
 *   reveal      0 → 1   the world emerging, immediately after the hero
 *   convergence 0 → 1   the project pebbles gathering into the field
 *   atmosphere  1 → 0   the non-project pebbles dissolving away
 *
 * All are pure functions of scroll progress, so every object computes its own
 * state each frame without coordination or shared mutable state.
 */

import { progressAt } from "./cameraChoreography";

/**
 * The world arrives early and quickly. First movement at ~2% of the journey,
 * clearly present by ~5% — the opening is a held breath, not a long wait.
 *
 * The hero title finishes fading at 30vh, and the camera stays pitched up
 * through the overlap so the arriving objects rise into the lower frame
 * rather than crossing the typography. The title is never intersected.
 */
export const REVEAL_START = progressAt(70);
export const REVEAL_END = progressAt(200);

/**
 * A late arrival, for objects that belong to the field rather than to the
 * world: they are absent through the hero, the About and the Experience, and
 * come in only as the field gathers — the toolkit stone, whose blue among
 * the drifting graphite ones would be a question the Experience never
 * answers. See `arrivesWithField` in ProjectData.
 */
export const LATE_REVEAL_START = progressAt(600);
export const LATE_REVEAL_END = progressAt(690);

/** The gathering. Complete slightly before the overhead keyframe settles. */
export const CONVERGE_START = progressAt(580);
export const CONVERGE_END = progressAt(750);

/**
 * The atmospheric pebbles leave while the real ones gather, so the field
 * resolves to exactly the portfolio and nothing else. They begin drifting
 * with the convergence and are gone before it completes — a fade and a drift,
 * never a visibility toggle.
 */
export const ATMOSPHERE_FADE_START = progressAt(610);
export const ATMOSPHERE_FADE_END = progressAt(730);

export function smoothstep01(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

/** A decelerating ease — objects settle into place rather than arriving flat. */
export function easeOutCubic(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Emergence for one object. `stagger` (0–1) spreads arrivals across the
 * window so the world assembles in sequence instead of appearing at once —
 * but the window is short, so even the last object is present early.
 */
export function revealFactor(progress: number, stagger = 0): number {
  const window = REVEAL_END - REVEAL_START;
  const start = REVEAL_START + window * 0.35 * stagger;
  const end = start + window * 0.65;
  return easeOutCubic((progress - start) / (end - start));
}

/** Emergence for an object that arrives with the field, not with the world. */
export function lateRevealFactor(progress: number): number {
  return easeOutCubic(
    (progress - LATE_REVEAL_START) / (LATE_REVEAL_END - LATE_REVEAL_START),
  );
}

/**
 * The gathering factor for one object. The stagger is keyed to travel
 * distance in the caller: specimens furthest out set off first, so the
 * cluster forms from the outside in rather than collapsing to a point.
 */
export function convergeFactor(progress: number, stagger = 0): number {
  const window = CONVERGE_END - CONVERGE_START;
  const start = CONVERGE_START + window * 0.3 * stagger;
  const end = start + window * 0.7;
  return smoothstep01((progress - start) / (end - start));
}

/** Opacity for the atmospheric pebbles: present, then gone, never popping. */
export function atmosphereFactor(progress: number, stagger = 0): number {
  const window = ATMOSPHERE_FADE_END - ATMOSPHERE_FADE_START;
  const start = ATMOSPHERE_FADE_START + window * 0.35 * stagger;
  const end = start + window * 0.65;
  return 1 - smoothstep01((progress - start) / (end - start));
}
