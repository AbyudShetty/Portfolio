"use client";

/**
 * Horizon — a single hairline at a fixed screen position (DESIGN.md §7.1).
 *
 * It is deliberately a DOM element rather than scene geometry: the horizon is
 * the one constant that must sit at the same place in every view, including
 * the 2D layers that come in later milestones. Making it part of the chrome
 * rather than the scene is what lets the field and the flat views feel like
 * the same instrument.
 */
export function Horizon() {
  return <div className="horizon" aria-hidden="true" />;
}
