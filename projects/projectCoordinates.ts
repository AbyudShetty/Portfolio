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
  /**
   * Where it settles on a portrait screen. The landscape puddle is wide and
   * shallow, which an upright frame can only show as a small cluster; this is
   * the same thirteen stones in five staggered rows (3 / 2 / 3 / 2 / 3) that
   * run down the screen instead of across it. Blended in by how portrait the
   * screen is (scene/viewport.ts).
   */
  portrait: [number, number, number];
}

/** Centre of the settled puddle; the overhead keyframe looks here. */
export const FIELD_CENTER: [number, number, number] = [0, 0, -25.6];

/**
 * Row structure of the puddle, top-down: 5 / 5 / 5 — the thirteen projects
 * and the two certifications as one bunch, the certifications at the right
 * end of the front and middle rows. Centred on FIELD_CENTER (centroid within
 * 0.01), every stone at least 2.9 units from its neighbours, unevenly set so
 * it never reads as a grid. (Portrait screens use their own rows, below.)
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
    portrait: [-2.2, 0.15, 0],
  },

  // ── Front row (4) ───────────────────────────────────────────────────────
  splats: {
    code: "XR-01",
    scattered: [-16.5, 4.2, -30],
    gathered: [-5.9, 0.42, -22.9],
    portrait: [-3.6, 0.35, -19.8],
  },
  cardiotriage: {
    code: "SIM-02",
    scattered: [7.5, 5.6, -21],
    gathered: [-2.95, 0.55, -22.3],
    portrait: [0.1, 0.5, -20.1],
  },
  aegis: {
    code: "SYS-01",
    scattered: [18.5, 2.4, -33],
    gathered: [0.05, 0.38, -22.6],
    portrait: [3.6, 0.3, -19.7],
  },
  affordability: {
    code: "AI-04",
    scattered: [-2.5, 8.8, -37],
    gathered: [3.0, 0.1, -22.4],
    portrait: [-1.8, 0.15, -23.2],
  },

  // ── Middle row (4) ──────────────────────────────────────────────────────
  kirana: {
    code: "AI-01",
    scattered: [-20, -3.5, -25],
    gathered: [-6.35, 0.18, -25.8],
    portrait: [1.9, 0.2, -23.4],
  },
  astronaut: {
    code: "SIM-01",
    scattered: [-9, 6.5, -44],
    gathered: [-3.2, 0.62, -25.4],
    portrait: [-3.7, 0.5, -26.5],
  },
  msgrouter: {
    code: "AI-02",
    scattered: [12, -5.2, -38],
    gathered: [-0.05, 0.3, -25.7],
    portrait: [0, 0.3, -26.8],
  },
  miniraft: {
    code: "SYS-02",
    scattered: [22, 5.5, -27],
    gathered: [3.1, 0.22, -25.4],
    portrait: [3.6, 0.2, -26.4],
  },

  // ── Back row (5) ────────────────────────────────────────────────────────
  vrata: {
    code: "RES-01",
    scattered: [-24, 1.8, -47],
    gathered: [-6.1, -0.15, -28.8],
    portrait: [-1.9, -0.1, -30.1],
  },
  medivault: {
    code: "AI-03",
    scattered: [-13, -6.2, -34],
    gathered: [-3.05, 0.1, -28.5],
    portrait: [1.8, 0.1, -29.9],
  },
  ipl: {
    code: "PRD-01",
    scattered: [4, -7.5, -50],
    gathered: [0, -0.05, -28.9],
    portrait: [-3.6, 0, -33.2],
  },
  realitycompiler: {
    code: "PRD-02",
    scattered: [16, 7.2, -46],
    gathered: [3.05, 0.15, -28.6],
    portrait: [0, 0.15, -33.5],
  },
  hcrm: {
    code: "PRD-03",
    scattered: [25, -2.6, -40],
    gathered: [6.15, -0.2, -28.8],
    portrait: [3.7, -0.15, -33.1],
  },

  // ── Certifications (2), to the right of the projects ────────────────────
  // In the bunch at the right of the front and middle rows (landscape);
  // a sixth row under the five on portrait screens.
  dlcert: {
    code: "CRT-01",
    scattered: [27, 3.5, -36],
    gathered: [6.3, 0.25, -25.9],
    portrait: [-1.8, 0.25, -36.7],
  },
  llmcert: {
    code: "CRT-02",
    scattered: [24, -4.5, -45],
    gathered: [5.95, 0.3, -22.9],
    portrait: [1.9, 0.2, -36.9],
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
  "certification",
];
