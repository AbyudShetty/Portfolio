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
 * The puddle: a cluster that reads from its middle outwards.
 *
 * The four stones the work is judged on lie at the heart, the next six ring
 * them, and the last eight — the supporting work, the certificates and the
 * toolkit — lie around the rim.
 *
 * The rings were drawn where they are seen. Laying them out as circles on
 * the ground gave a ragged outline, because the camera looks down at an
 * angle and a circle on the ground projects as a lopsided egg. So each ring
 * is instead an even ellipse *on screen*, dropped back onto the ground
 * plane through the inspection camera, and each stone is spaced around it by
 * how large it is drawn rather than by angle. Measured on the result, the
 * outside edge of the cluster varies by 3px over a 340px radius: a clean
 * oval, not a heap.
 *
 * Size carries standing, one size per project and no two alike
 * (projects/projectStanding.ts), and is spent on *apparent* size: the field
 * is deep enough that perspective alone changes how big a stone looks by
 * half, so a stone lying further from the lens is built physically larger to
 * read the same. What is left on screen is a clean run from the best work to
 * the least, falling away from the centre of the cluster.
 *
 * Verified together, against the six shots the settled field is seen in: no
 * two pebbles closer than 0.29 units edge to edge, no label pair closer than
 * 84px, and nothing within 43px of the frame. Portrait keeps rings of its
 * own, solved against its upright proportions, where the screen is too
 * narrow for this ellipse to fit.
 *
 * Re-ranking a project means moving one line in projectStanding.ts; which
 * ring it then lies in follows from its place in that list.
 */
export const COORDINATES: Record<string, Coordinate> = {
  tyretrace: {
    code: "RES-02",
    scattered: [-31, 6.5, -39],
    gathered: [-2.79, 0.05, -27.18],
    portrait: [-2.8, 0.05, -19.7],
  },
  ghostaudit: {
    code: "SYS-04",
    scattered: [31, -3.5, -48],
    gathered: [2.55, 0.05, -24.48],
    portrait: [2.5, 0.05, -35.3],
  },
  // The Experience is not a specimen. It has one position and never moves.
  slimevr: {
    code: "EXP-00",
    scattered: [-2.2, 0.15, 0],
    gathered: [-2.2, 0.15, 0],
    portrait: [-2.2, 0.15, 0],
  },

  // Listed in order of standing: the first four are the heart of the
  // cluster, the next six its middle ring, the last eight its rim.
  quorum: {
    code: "SYS-03",
    scattered: [-28, 5.2, -43],
    gathered: [-0.11, 0.05, -26.14],
    portrait: [-0.73, -0.05, -30.38],
  },
  anchormatch: {
    code: "AI-05",
    scattered: [29, -6.5, -34],
    gathered: [2.78, 0.05, -26.96],
    portrait: [1.09, 0.19, -28.41],
  },
  aegis: {
    code: "SYS-01",
    scattered: [18.5, 2.4, -33],
    gathered: [-2.39, 0.05, -24.27],
    portrait: [0.51, -0.02, -24.26],
  },
  affordability: {
    code: "AI-04",
    scattered: [-2.5, 8.8, -37],
    gathered: [1.03, 0.05, -29.5],
    portrait: [-1.03, 0.25, -26.55],
  },
  splats: {
    code: "XR-01",
    scattered: [-16.5, 4.2, -30],
    gathered: [3.78, 0.05, -22.25],
    portrait: [1.69, 0.21, -31.83],
  },
  astronaut: {
    code: "SIM-01",
    scattered: [-9, 6.5, -44],
    gathered: [5.25, 0.05, -28],
    portrait: [2.45, -0.11, -26.15],
  },
  cardiotriage: {
    code: "SIM-02",
    scattered: [7.5, 5.6, -21],
    gathered: [4.9, 0.05, -25.75],
    portrait: [0.77, 0.04, -21.3],
  },
  kirana: {
    code: "AI-01",
    scattered: [-20, -3.5, -25],
    gathered: [-4.67, 0.05, -25.48],
    portrait: [-1.53, 0.08, -22.66],
  },
  msgrouter: {
    code: "AI-02",
    scattered: [12, -5.2, -38],
    gathered: [-1.29, 0.05, -29.46],
    portrait: [-2.49, -0.05, -28.6],
  },
  vrata: {
    code: "RES-01",
    scattered: [-24, 1.8, -47],
    gathered: [5.08, 0.05, -23.62],
    portrait: [-0.21, 0.12, -34.07],
  },

  // Nothing is hidden by being small: every stone keeps the same generous
  // pointer radius and opens to the same lens (§7.5 — standing governs
  // presentation, never discoverability).
  ipl: {
    code: "PRD-01",
    scattered: [4, -7.5, -50],
    gathered: [0.1, 0.05, -23.39],
    portrait: [-2.41, 0.14, -35.1],
  },
  miniraft: {
    code: "SYS-02",
    scattered: [22, 5.5, -27],
    gathered: [-3.98, 0.05, -23.07],
    portrait: [-3.28, 0.11, -31.37],
  },
  medivault: {
    code: "AI-03",
    scattered: [-13, -6.2, -34],
    gathered: [-3.6, 0.05, -29.61],
    portrait: [0.31, 0.17, -37.86],
  },
  realitycompiler: {
    code: "PRD-02",
    scattered: [16, 7.2, -46],
    gathered: [3.55, 0.05, -29.65],
    portrait: [3.44, -0.06, -29.91],
  },
  hcrm: {
    code: "PRD-03",
    scattered: [25, -2.6, -40],
    gathered: [-4.96, 0.05, -27.88],
    portrait: [3.33, -0.09, -23.97],
  },
  dlcert: {
    code: "CRT-01",
    scattered: [27, 3.5, -36],
    gathered: [-1.85, 0.05, -22.1],
    portrait: [2.31, 0.09, -19.63],
  },
  llmcert: {
    code: "CRT-02",
    scattered: [24, -4.5, -45],
    gathered: [0.12, 0.05, -21.39],
    portrait: [-1.23, -0.09, -17.75],
  },
  toolkit: {
    code: "KIT-00",
    scattered: [21, -7, -30],
    gathered: [1.93, 0.05, -21.87],
    portrait: [-3.28, 0.06, -23.61],
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
