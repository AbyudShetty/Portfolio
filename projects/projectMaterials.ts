/**
 * projectMaterials — the clarity rule, made mechanical.
 *
 * DESIGN.md §4.2: transmission and roughness encode importance. The more
 * significant the work, the more clearly you can see into it. Hovering a
 * frosted secondary object literally brings it into focus.
 *
 * §6.1: objects have mass proportional to importance. Featured work is heavy
 * and slow; secondary work is light and quick. Motion communicates hierarchy
 * before a single label is read.
 */

import { ENVIRONMENT } from "@/lib/design-tokens";
import type { Tier } from "./ProjectData";

export interface TierMaterial {
  /**
   * Every real project pebble now shares one crisp surface.
   *
   * The earlier build graded transmission and roughness by tier, so a
   * secondary project was literally frosted — which read on screen as some
   * projects being out of focus. The field is an inspection interface: every
   * project in it has to be optically readable, wherever it sits. Hierarchy
   * is carried by position, labels and interaction instead.
   *
   * Kept below 1.0 on purpose: fully clear glass against black is invisible,
   * because it transmits darkness and reflects nothing. These are
   * smoked-glass values — you see into them, and the surface still holds a
   * highlight.
   */
  transmission: number;
  roughness: number;
  /** Roughness while hovered — the "resolve into focus" target. */
  hoverRoughness: number;
  thickness: number;
  ior: number;
  /** How far the accent tint travels inside the glass. Lower = more tint. */
  attenuationDistance: number;
  /** Reflection strength. The main readability lever, and tier-graded. */
  envMapIntensity: number;
  /** A second specular layer — the piano-black finish on dark product work. */
  clearcoat: number;
  clearcoatRoughness: number;
  /** Body tone. Secondary work sits a step darker so the bands separate. */
  bodyColor: string;
}

export interface TierSpring {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface TierProfile {
  /**
   * Projects sit within a few percent of each other on purpose. Size is no
   * longer a hierarchy signal — the field has to read as one family of
   * specimens, so rank is carried by depth, clarity, placement, labels and
   * interaction instead. Only the Experience anchor, which is not a pebble,
   * stands apart in scale.
   */
  scale: number;
  material: TierMaterial;
  spring: TierSpring;
  /** Screen-space radius in px at which the object begins to notice the pointer. */
  proximityRadius: number;
  /** Distance the camera holds when this object is focused. */
  framingDistance: number;
  /**
   * Base label opacity with no pointer nearby. Zero across every tier: a field
   * carrying twelve labels at once is a diagram, not a collection. Identity
   * resolves for the one specimen being inspected and no others.
   */
  labelRestOpacity: number;
}

export const TIER_PROFILE: Record<Tier, TierProfile> = {
  experience: {
    scale: 1.35,
    material: {
      transmission: 0.7,
      roughness: 0.08,
      hoverRoughness: 0.04,
      thickness: 1.0,
      ior: 1.5,
      attenuationDistance: 3.2,
      envMapIntensity: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      bodyColor: ENVIRONMENT.graphite600,
    },
    spring: { stiffness: 120, damping: 26, mass: 1.6 },
    proximityRadius: 360,
    framingDistance: 7.5,
    labelRestOpacity: 0,
  },
  "featured-1": {
    scale: 1.0,
    material: {
      transmission: 0.66,
      roughness: 0.12,
      hoverRoughness: 0.05,
      thickness: 0.8,
      ior: 1.5,
      attenuationDistance: 2.8,
      envMapIntensity: 1.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      bodyColor: ENVIRONMENT.graphite600,
    },
    spring: { stiffness: 150, damping: 24, mass: 1.3 },
    proximityRadius: 320,
    framingDistance: 6.5,
    labelRestOpacity: 0,
  },
  "featured-2": {
    scale: 0.96,
    material: {
      transmission: 0.66,
      roughness: 0.12,
      hoverRoughness: 0.05,
      thickness: 0.8,
      ior: 1.5,
      attenuationDistance: 2.8,
      envMapIntensity: 1.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      bodyColor: ENVIRONMENT.graphite600,
    },
    spring: { stiffness: 180, damping: 22, mass: 1.1 },
    proximityRadius: 320,
    framingDistance: 5.5,
    labelRestOpacity: 0,
  },
  secondary: {
    scale: 0.9,
    material: {
      transmission: 0.66,
      roughness: 0.12,
      hoverRoughness: 0.05,
      thickness: 0.8,
      ior: 1.5,
      attenuationDistance: 2.8,
      envMapIntensity: 1.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      bodyColor: ENVIRONMENT.graphite600,
    },
    spring: { stiffness: 220, damping: 20, mass: 0.9 },
    // A generous radius: the far band is the hardest to acquire, and
    // hierarchy governs presentation, never discoverability (§7.5).
    proximityRadius: 420,
    framingDistance: 4.5,
    labelRestOpacity: 0,
  },
};

/** Hover approach — the object comes toward the observer (§6.3). */
export const APPROACH = {
  /** Units travelled toward camera on hover. */
  distance: 1.2,
  /** Scale multiplier on hover. */
  scale: 1.06,
  /** Maximum drift toward the pointer while merely in proximity. */
  proximityDrift: 0.3,
} as const;

/**
 * Selection state — one object, one time, ≤0.20 emissive (§5 rule 1).
 *
 * Transmission is a *boost* over the tier value rather than an absolute:
 * pushing a smoked pebble to fully clear would make it disappear against the
 * graphite ground, which is the opposite of selecting it.
 */
export const SELECTED = {
  /* Well under §5's 0.20 ceiling. This is a lift on the stone's own body
     tone, not a glow, and at 0.2 it washed the graphite toward mid-grey. */
  emissiveIntensity: 0.06,
  cameraPush: 2.0,
} as const;

/**
 * The tint inside the glass — one neutral, shared by every stone.
 *
 * This used to be the project's domain accent, which meant the twelve stones
 * were twelve different colours: moss, brass, oxide, bone. At field scale it
 * was a hairline of colour, but held up to the lens each stone became that
 * colour, and the family stopped reading as one material. Domain still gets
 * said — by the label rule and the panel eyebrow, in two dimensions, where a
 * reader can attach it to a word. The stone itself stays stone.
 */
export const ATTENUATION_COLOR = ENVIRONMENT.graphite500;

/**
 * A presented stone closes up.
 *
 * DESIGN.md §6.3 has transmission going *up* on expansion, toward clear
 * glass. That was written for a detail view that covered the field; this one
 * writes on the stone itself, and text over a transparent body sitting in
 * front of a moving starfield is text you can read half the time. So the
 * stone goes opaque while it is being read and returns to glass on the way
 * back — the one place in the field where clarity is spent rather than shown.
 */
export const SELECTED_TRANSMISSION = 0;

/**
 * The surface a presented stone turns into.
 *
 * Going opaque is only half of what makes the text readable. A pebble in the
 * field is a piano-black finish — clearcoat 0.9, envMapIntensity 1.85 — and
 * that finish throws a broad specular sweep diagonally across its face. Held
 * at the lens it lands exactly where the title and the first line sit, and no
 * amount of scrim under the type fixes a highlight that bright without also
 * turning into a visible panel.
 *
 * So the stone goes matte while it is being read: the polish comes off, the
 * environment stops being mirrored, and what is left is a slate the words can
 * be cut into. It reverses on the way back, so the field keeps its gloss.
 */
export const PRESENTED_SURFACE = {
  /*
     A step darker than the field's graphite600.

     Dropping envMapIntensity alone barely moved it: once a surface is matte
     its tone comes from the *key light*, not from what it mirrors, and this
     studio's key is bright by design. A dark body under a bright key still
     lands at mid-grey, which is the worst possible ground for pale text. This
     is the same neutral the whole family is cut from — the stone in shadow,
     not a different stone.
  */
  bodyColor: ENVIRONMENT.graphite800,
  roughness: 0.44,
  clearcoat: 0.12,
  /*
     Held low. A matte surface takes its tone almost entirely from the
     environment, and this studio is a bright one — at 0.62 the stone came up
     a full step lighter than the graphite family it belongs to, and light
     text on mid-grey is the worst of both. Darker keeps it the same stone and
     gives the type something to sit against.
  */
  envMapIntensity: 0.34,
} as const;

export const UI_SPRING: TierSpring = {
  stiffness: 300,
  damping: 30,
  mass: 1.0,
};
