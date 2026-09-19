/**
 * Design tokens — single source of truth shared by CSS and WebGL.
 * Mirrors design/DESIGN.md §2 (colour) and §5 (lighting).
 * CSS consumes these via globals.css; WebGL imports them directly.
 */

export const ENVIRONMENT = {
  void: "#08090A",
  graphite900: "#0E1011",
  graphite800: "#141719",
  graphite700: "#1B1F22",
  graphite600: "#24292D",
  graphite500: "#2F353A",
  graphite400: "#3D444B",
} as const;

export const TEXT = {
  primary: "#ECEEF0",
  secondary: "#A2A9B0",
  tertiary: "#6E767E",
  disabled: "#4A5158",
} as const;

export const SIGNAL = {
  base: "#E8843C",
  dim: "#A85E2B",
} as const;

/** Category accents — materials, not hues (DESIGN.md §2.6). */
export const DOMAIN_ACCENT = {
  ai: "#B4694A", // Oxide
  graphics: "#CBC3B4", // Bone
  simulation: "#9A8F7E", // Sandstone — BioGears-backed physiological simulation
  xr: "#8FA0AC", // Aluminium
  systems: "#6E8264", // Moss
  research: "#A88C4E", // Brass
  product: "#7A8290", // Slate
  certification: "#E3A33B", // Marigold — certifications only
  experience: SIGNAL.base, // Signal — experience only
} as const;

export const DOMAIN_LABEL = {
  research: "RESEARCH",
  ai: "AI / ML",
  graphics: "GRAPHICS",
  simulation: "SIMULATION",
  xr: "XR / SPATIAL",
  systems: "SYSTEMS",
  product: "PRODUCT",
  certification: "CERTIFICATION",
  experience: "EXPERIENCE",
} as const;

/**
 * Lighting rig — DESIGN.md §5. One studio, physically consistent.
 *
 * Tuned for dark product photography: a dark transmissive object is defined
 * almost entirely by what it reflects, so the readability of these objects
 * lives in the studio environment (see scene/Lighting.tsx) rather than in the
 * direct lights. The direct lights shape; the softboxes and strips reveal.
 *
 * Ambient fill is deliberately *low* — lifting it flattens the graphite and
 * kills the contrast that makes the objects read as solids.
 */
export const LIGHTING = {
  keyColor: "#C8D4DC",
  keyIntensity: 1.6,
  keyPosition: [-8, 7, 6] as [number, number, number],
  fillSky: "#1A1E22",
  fillGround: "#0A0B0C",
  fillIntensity: 0.26,
  bounceColor: SIGNAL.base,
  bounceIntensity: 12,
  bouncePosition: [9, -3.2, 3] as [number, number, number],
  bounceDistance: 42,
  bounceDecay: 1.7,
  /** Contour separation from the background. Neutral, never tinted. */
  rimColor: "#DDE4E8",
  rimIntensity: 0.7,
  rimPosition: [2, 8, -20] as [number, number, number],
  /** Studio surfaces — the reflections that carve the silhouettes. */
  softboxColor: "#F2F5F7",
  stripColor: "#FFFFFF",
} as const;

/**
 * The space environment.
 *
 * Deep black rather than the graphite used for surfaces: the ground of the
 * scene has to be darker than any object in it, or the specimens have nothing
 * to sit against. Fog runs very long — space has none, but a slow falloff is
 * what lets the outer specimens recede without vanishing.
 */
export const SPACE = {
  background: "#050607",
  fogNear: 40,
  fogFar: 190,
} as const;
