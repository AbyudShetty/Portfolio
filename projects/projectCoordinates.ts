/**
 * projectCoordinates — two arrangements, and the journey between them.
 *
 * `scattered` is where a specimen drifts while the camera is with the
 * astronaut: far out, spread across the whole volume, deliberately peripheral
 * so nothing crowds the Experience composition.
 *
 * `gathered` is the puddle — an organic top-down arrangement of stones settled
 * together. Not a grid, not a pile: rows of unequal length with uneven
 * spacing, wider through the middle.
 *
 * Spacing was opened up by 20% across and 34% in depth. The extra depth is
 * deliberate and does more work than the width: under an overhead camera it
 * separates the rows vertically on screen, which is what gives each project
 * name its own territory. The cluster still reads as one collection.
 *
 * Scroll interpolates between them (see scene/reveal.ts). Both arrangements
 * are fixed constants — each project's coordinate is part of its identity,
 * printed on its label, and nothing here is generated at runtime.
 */

import type { Domain } from "./ProjectData";

export interface Coordinate {
  /** Printed identity, e.g. "XR-01". Appears in label, cursor and rail. */
  code: string;
  /** Where it drifts during the Experience — distant environment. */
  scattered: [number, number, number];
  /** Where it settles in the final field. */
  gathered: [number, number, number];
}

/** Centre of the settled puddle; the overhead keyframe looks here. */
export const FIELD_CENTER: [number, number, number] = [0, 0, -25.6];

/**
 * Row structure of the puddle, top-down: 3 / 4 / 5 with irregular spacing.
 * Listed here in settling order so the layout is legible in source.
 */
export const COORDINATES: Record<string, Coordinate> = {
  // The Experience is not a specimen. It has one position and never moves.
  slimevr: {
    code: "EXP-00",
    scattered: [-2.2, 0.15, 0],
    gathered: [-2.2, 0.15, 0],
  },

  // ── Front row (3) ───────────────────────────────────────────────────────
  splats: {
    code: "XR-01",
    scattered: [-16.5, 4.2, -30],
    gathered: [-3.06, 0.42, -22.25],
  },
  cardiotriage: {
    code: "GFX-01",
    scattered: [7.5, 5.6, -21],
    gathered: [0.33, 0.55, -21.78],
  },
  aegis: {
    code: "SYS-01",
    scattered: [18.5, 2.4, -33],
    gathered: [3.5, 0.38, -22.72],
  },

  // ── Middle rows (4) ─────────────────────────────────────────────────────
  kirana: {
    code: "AI-01",
    scattered: [-20, -3.5, -25],
    gathered: [-5.67, 0.18, -24.86],
  },
  astronaut: {
    code: "RES-01",
    scattered: [-9, 6.5, -44],
    gathered: [-2.34, 0.62, -25.1],
  },
  msgrouter: {
    code: "AI-02",
    scattered: [12, -5.2, -38],
    gathered: [1.26, 0.3, -25.53],
  },
  miniraft: {
    code: "SYS-02",
    scattered: [22, 5.5, -27],
    gathered: [5.22, 0.22, -25.26],
  },

  // ── Back row (5) ────────────────────────────────────────────────────────
  vrata: {
    code: "RES-02",
    scattered: [-24, 1.8, -47],
    gathered: [-6.72, -0.15, -27.81],
  },
  medivault: {
    code: "AI-03",
    scattered: [-13, -6.2, -34],
    gathered: [-3.54, 0.1, -28.14],
  },
  ipl: {
    code: "PRD-01",
    scattered: [4, -7.5, -50],
    gathered: [0.18, -0.05, -28.28],
  },
  realitycompiler: {
    code: "PRD-02",
    scattered: [16, 7.2, -46],
    gathered: [3.66, 0.15, -27.74],
  },
  hcrm: {
    code: "PRD-03",
    scattered: [25, -2.6, -40],
    gathered: [7.14, -0.2, -27.61],
  },
};

export function getCoordinate(id: string): Coordinate {
  const c = COORDINATES[id];
  if (!c) throw new Error(`No coordinate defined for object "${id}"`);
  return c;
}

/**
 * How far out a specimen starts, normalised. Drives the convergence stagger
 * so the outermost stones set off first and the puddle forms outside-in.
 */
export function scatterDistance(coordinate: Coordinate): number {
  const [x, y, z] = coordinate.scattered;
  const [gx, gy, gz] = coordinate.gathered;
  return Math.hypot(x - gx, y - gy, z - gz);
}

/** Formats a position for the mono readout: "−8.7, 0.6, −4.6". */
export function formatCoordinate(p: readonly [number, number, number]): string {
  return p.map((n) => (n < 0 ? "−" : "") + Math.abs(n).toFixed(1)).join(", ");
}

/** Kept for the Index and for domain labelling in later milestones. */
export const DOMAIN_ORDER: Domain[] = [
  "research",
  "ai",
  "graphics",
  "xr",
  "systems",
  "product",
];
