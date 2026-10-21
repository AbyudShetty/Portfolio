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
   * the same eighteen stones in staggered rows that run down the screen
   * instead of across it, nearest at the foot. Blended in by how portrait the
   * screen is (scene/viewport.ts).
   */
  portrait: [number, number, number];
}

/** Centre of the settled puddle; the overhead keyframe looks here. */
export const FIELD_CENTER: [number, number, number] = [0, 0, -25.6];

/**
 * The puddle is a fixed set of eighteen places, and a project occupies the
 * place its standing earns.
 *
 * The places themselves were solved as geometry and have not moved since:
 * staggered rows, centred on FIELD_CENTER, every stone at least 2.99 units
 * from its neighbours and no label pair closer than 72px in any of the six
 * shots the settled field is seen in. Unevenly set, so it never reads as a
 * grid.
 *
 * What changed is who stands where. Depth is the field's real hierarchy:
 * under the inspection camera the front row is about 40% larger on screen
 * than the back row, five times the difference any honest change of scale
 * could carry (projects/projectMaterials.ts). So the four the work is judged
 * on take the front row, the solid middle takes the next band, and the
 * supporting work, the certificates and the toolkit take the back — with the
 * far band keeping the most generous pointer radius of all, because rank
 * governs presentation and never discoverability (§7.5).
 *
 * Re-ranking a project is therefore a matter of swapping two entries below,
 * not re-solving the field.
 */
export const COORDINATES: Record<string, Coordinate> = {
  // The Experience is not a specimen. It has one position and never moves.
  slimevr: {
    code: "EXP-00",
    scattered: [-2.2, 0.15, 0],
    gathered: [-2.2, 0.15, 0],
    portrait: [-2.2, 0.15, 0],
  },

  // ── The front row: the four the work is judged on ───────────────────────
  // Nearest the inspection camera, so perspective holds them largest in
  // frame — about 40% larger on screen than the back row before scale is
  // counted at all. Systems and AI/ML alternate across the row rather than
  // pairing up.
  quorum: {
    code: "SYS-03",
    scattered: [-28, 5.2, -43],
    gathered: [-5.75, 0.16, -21.39],
    portrait: [-3.6, 0.35, -19.8],
  },
  anchormatch: {
    code: "AI-05",
    scattered: [29, -6.5, -34],
    gathered: [-2.42, -0.08, -21.57],
    portrait: [0.1, 0.5, -20.1],
  },
  aegis: {
    code: "SYS-01",
    scattered: [18.5, 2.4, -33],
    gathered: [0.92, 0.11, -21.85],
    portrait: [3.6, 0.3, -19.7],
  },
  affordability: {
    code: "AI-04",
    scattered: [-2.5, 8.8, -37],
    gathered: [3.99, -0.11, -21.46],
    portrait: [-1.8, 0.15, -23.2],
  },

  // ── The middle band ─────────────────────────────────────────────────────
  splats: {
    code: "XR-01",
    scattered: [-16.5, 4.2, -30],
    gathered: [-4.12, -0.04, -24.29],
    portrait: [1.9, 0.2, -23.4],
  },
  astronaut: {
    code: "SIM-01",
    scattered: [-9, 6.5, -44],
    gathered: [-0.75, -0.13, -24.28],
    portrait: [-3.7, 0.5, -26.5],
  },
  cardiotriage: {
    code: "SIM-02",
    scattered: [7.5, 5.6, -21],
    gathered: [-7.4, 0.07, -24.5],
    portrait: [3.6, 0.2, -26.4],
  },
  kirana: {
    code: "AI-01",
    scattered: [-20, -3.5, -25],
    gathered: [2.88, -0.27, -24.26],
    portrait: [0, 0.3, -26.8],
  },
  msgrouter: {
    code: "AI-02",
    scattered: [12, -5.2, -38],
    gathered: [-2.52, 0.01, -26.99],
    portrait: [1.8, 0.1, -29.9],
  },
  vrata: {
    code: "RES-01",
    scattered: [-24, 1.8, -47],
    gathered: [-5.59, 0.03, -26.93],
    portrait: [-1.9, -0.1, -30.1],
  },

  // ── The back band: supporting work, the certificates and the toolkit ────
  // Nothing here is hidden — every stone keeps the same generous pointer
  // radius and opens to the same lens (§7.5: hierarchy governs
  // presentation, never discoverability).
  ipl: {
    code: "PRD-01",
    scattered: [4, -7.5, -50],
    gathered: [5.6, -0.18, -24.25],
    portrait: [0, 0.15, -33.5],
  },
  miniraft: {
    code: "SYS-02",
    scattered: [22, 5.5, -27],
    gathered: [0.83, -0.14, -27.06],
    portrait: [-3.6, 0, -33.2],
  },
  medivault: {
    code: "AI-03",
    scattered: [-13, -6.2, -34],
    gathered: [3.68, -0.15, -26.99],
    portrait: [3.7, -0.15, -33.1],
  },
  realitycompiler: {
    code: "PRD-02",
    scattered: [16, 7.2, -46],
    gathered: [-4.09, 0.2, -29.65],
    portrait: [3.5, 0.3, -36.6],
  },
  hcrm: {
    code: "PRD-03",
    scattered: [25, -2.6, -40],
    gathered: [-0.78, 0.24, -29.79],
    portrait: [-3.5, 0.25, -36.7],
  },
  dlcert: {
    code: "CRT-01",
    scattered: [27, 3.5, -36],
    gathered: [7.2, -0.1, -27],
    portrait: [0, 0.2, -37],
  },
  llmcert: {
    code: "CRT-02",
    scattered: [24, -4.5, -45],
    gathered: [2.33, -0.05, -29.65],
    portrait: [-1.85, 0.12, -40.3],
  },
  toolkit: {
    code: "KIT-00",
    scattered: [21, -7, -30],
    gathered: [5.77, -0.19, -29.64],
    portrait: [1.85, -0.08, -40.2],
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
  "toolkit",
];
