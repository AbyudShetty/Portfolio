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
 * Row structure of the puddle, top-down: 4 / 4 / 5 with irregular spacing.
 * Listed here in settling order so the layout is legible in source.
 *
 * Recomposed for thirteen stones. The twelfth-stone layout had no room for a
 * thirteenth that did not read as a row of its own, so every gathered
 * position was re-solved together by a search constrained to the field's
 * existing on-screen footprint in all three field shots (inspection,
 * overhead, and the descent between them): nothing reaches further toward a
 * frame edge than the twelve-stone field already did. Measured against the
 * old layout on the same model: tightest stone pair 2.98 units (was 2.93),
 * tightest label pair 16px (was 10px), centroid within 0.3 of FIELD_CENTER.
 */
export const COORDINATES: Record<string, Coordinate> = {
  // The Experience is not a specimen. It has one position and never moves.
  slimevr: {
    code: "EXP-00",
    scattered: [-2.2, 0.15, 0],
    gathered: [-2.2, 0.15, 0],
  },

  // ── Front row (4) ───────────────────────────────────────────────────────
  splats: {
    code: "XR-01",
    scattered: [-16.5, 4.2, -30],
    gathered: [-4.27, 0.42, -22.88],
  },
  cardiotriage: {
    code: "SIM-02",
    scattered: [7.5, 5.6, -21],
    gathered: [-1.5, 0.55, -21.79],
  },
  aegis: {
    code: "SYS-01",
    scattered: [18.5, 2.4, -33],
    gathered: [1.48, 0.38, -21.88],
  },
  affordability: {
    code: "AI-04",
    scattered: [-2.5, 8.8, -37],
    gathered: [4.22, 0.1, -23.03],
  },

  // ── Middle row (4) ──────────────────────────────────────────────────────
  kirana: {
    code: "AI-01",
    scattered: [-20, -3.5, -25],
    gathered: [-5.97, 0.18, -25.33],
  },
  astronaut: {
    code: "SIM-01",
    scattered: [-9, 6.5, -44],
    gathered: [-1.99, 0.62, -24.99],
  },
  msgrouter: {
    code: "AI-02",
    scattered: [12, -5.2, -38],
    gathered: [1.66, 0.3, -24.94],
  },
  miniraft: {
    code: "SYS-02",
    scattered: [22, 5.5, -27],
    gathered: [4.6, 0.22, -25.98],
  },

  // ── Back row (5) ────────────────────────────────────────────────────────
  vrata: {
    code: "RES-01",
    scattered: [-24, 1.8, -47],
    gathered: [-6.77, -0.15, -28.19],
  },
  medivault: {
    code: "AI-03",
    scattered: [-13, -6.2, -34],
    gathered: [-3.69, 0.1, -28.11],
  },
  ipl: {
    code: "PRD-01",
    scattered: [4, -7.5, -50],
    gathered: [-0.72, -0.05, -27.78],
  },
  realitycompiler: {
    code: "PRD-02",
    scattered: [16, 7.2, -46],
    gathered: [2.51, 0.15, -28.09],
  },
  hcrm: {
    code: "PRD-03",
    scattered: [25, -2.6, -40],
    gathered: [7.09, -0.2, -27.62],
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
  "simulation",
  "ai",
  "graphics",
  "xr",
  "systems",
  "product",
];
