/**
 * ending — the field, and everything before it, goes into a black hole.
 *
 *   hold      the field stays readable and clickable for a moment
 *   exit      labels go, then the stones peel away to the left, leftmost first
 *   reveal    the camera turns left and pulls back onto the black hole
 *   fall      the stones spiral in along the disc, shrinking to nothing at the
 *             horizon; the Endurance and the astronaut follow, still tethered
 *   fade      the black hole itself fades, leaving the stars
 *   credits   the landing again (a DOM section, see NarrativeSections)
 *
 * All windows are in document vh, measured from ENDING_START_VH — the scroll
 * position where the project field's final frame is reached — so the field
 * ending plays exactly as it did before any of this existed.
 */

import * as THREE from "three";

import { progressAt } from "./cameraChoreography";
import { smoothstep01 } from "./reveal";

export const ENDING_START_VH = 960;

const at = (vh: number) => progressAt(ENDING_START_VH + vh);
const span = (vh: number) => progressAt(vh);

export const ENDING = {
  /** Pointer inspection ends here; an open stone is put back. */
  interactiveUntil: at(30),
  labelsOut: { start: at(30), end: at(60) },
  /**
   * Each stone's own path, leftmost first. A stone starts leaving at its
   * turn and the black hole catches it while it is still moving, so no stone
   * ever parks and waits for the rest. Spans are in progress units.
   */
  pebbles: {
    start: at(40),
    /** Rightmost stone starts this much after the leftmost. */
    stagger: span(60),
    /** Time scale of the accelerating pull to the left. */
    leave: span(110),
    /** How long after it starts leaving the fall takes hold. */
    catch: span(70),
    /** From the fall taking hold to gone. Last stone is gone by 1290vh. */
    fall: span(160),
  },
  /** The black hole fades up as the camera turns toward it. */
  holeIn: { start: at(80), end: at(170) },
  /** The Endurance, with the astronaut tethered behind it, falls last. */
  craftFall: { start: at(210), end: at(330) },
  /**
   * Everything has gone and the camera has dived into the shadow (1345vh);
   * the black hole leaves as it arrives.
   */
  holeFade: { start: at(360), end: at(410) },
} as const;

export function windowProgress(
  progress: number,
  window: { start: number; end: number },
): number {
  return (progress - window.start) / (window.end - window.start);
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ── The black hole ─────────────────────────────────────────────────────── */

/**
 * Placement, solved against the reveal camera (−40, 15, −12) aimed at
 * (−84, 0.5, −66) at a 1440×810 frame: the disc (~26 across) and the fall
 * orbit sit well inside the frame. From the field's final frame the whole
 * hole is off-screen to the left, so turning onto it is a genuine reveal.
 *
 * `normal` is tilted so the held ending camera sees the disc 10° above its own
 * plane: nearly edge-on, which is what makes the lensing read — the far side
 * of the disc arches over the shadow and a thin image of its underside curves
 * beneath it. (Tried live at 22°, 15° and 9°; below ~15° it becomes
 * Gargantua, above it a lit saucer.) The roll the earlier 22° normal gave the
 * disc is kept.
 */
const CENTRE = new THREE.Vector3(-84, 4, -66);
const HOLD_CAMERA = new THREE.Vector3(-43, 14.6, -16);
const DISC_ELEVATION = THREE.MathUtils.degToRad(10);

function tiltedNormal(): THREE.Vector3 {
  const toCamera = HOLD_CAMERA.clone().sub(CENTRE).normalize();
  const rolled = new THREE.Vector3(-0.0051, 0.9543, 0.299).normalize();
  const across = rolled
    .clone()
    .addScaledVector(toCamera, -rolled.dot(toCamera))
    .normalize();
  return toCamera
    .multiplyScalar(Math.sin(DISC_ELEVATION))
    .addScaledVector(across, Math.cos(DISC_ELEVATION));
}

export const HOLE = {
  centre: CENTRE,
  normal: tiltedNormal(),
  /**
   * World units per horizon radius (experience/BlackHole.tsx works in those).
   * The disc reaches 12 horizon radii: ~38 world units.
   */
  scale: 3.2,
  horizon: 3.2,
};

/** An orthonormal frame in the disc plane: u × v = normal. */
export const HOLE_U = (() => {
  const u = new THREE.Vector3(1, 0, 0);
  u.addScaledVector(HOLE.normal, -u.dot(HOLE.normal)).normalize();
  return u;
})();
export const HOLE_V = new THREE.Vector3().crossVectors(HOLE.normal, HOLE_U);

/** Orbit radius where a falling object joins the disc, in world units. */
const FALL_ENTRY_RADIUS = 26;

/**
 * Where each object's final circuit ends: the photon sphere, inside the
 * shadow's edge, so the last of it is seen going into the dark.
 */
const FALL_END_RADIUS = HOLE.horizon * 1.5;

/* ── Entry points for the craft and the figure ──────────────────────────── */

/** Just off the right edge of the reveal frame, level with the hole. */
export const CRAFT_ENTRY = new THREE.Vector3(-39.04, 10, -94.64);
export const ASTRONAUT_ENTRY = new THREE.Vector3(-34.38, 8, -96.43);

/**
 * Sizes in the ending. The Endurance ring is ~28 units at scale 1 against a
 * ~26-unit disc radius; at 0.3 it reads as a ship being taken, not as a
 * second disc.
 */
export const CRAFT_ENDING_SCALE = 0.3;
export const ASTRONAUT_ENDING_SCALE = 0.3;

/* ── The fall ───────────────────────────────────────────────────────────── */

const _rel = new THREE.Vector3();
const _orbit = new THREE.Vector3();

/**
 * Places `out` along a fall into the black hole and returns the object's
 * remaining size (1 → 0).
 *
 * The object first leaves wherever it was and joins the disc at the orbit
 * angle nearest to it, so nothing crosses the frame to get there. It then
 * spirals inward in the disc's plane — radius shrinking, angular speed rising
 * as it closes on the horizon, the way an orbit tightens — and over the last
 * part of the fall it shrinks to nothing just outside the horizon.
 *
 * Continuous in `t`, so a reader scrolling back up watches the same path play
 * in reverse; nothing is spawned or removed.
 */
export function fallInto(
  out: THREE.Vector3,
  from: THREE.Vector3,
  t: number,
  turns = 1.5,
  /**
   * Where the orbit angle is taken from, if `from` is itself moving — so the
   * point on the disc being fallen toward doesn't swing about with it.
   */
  angleFrom: THREE.Vector3 = from,
): number {
  const f = clamp01(t);
  _rel.copy(angleFrom).sub(HOLE.centre);
  const theta0 = Math.atan2(_rel.dot(HOLE_V), _rel.dot(HOLE_U));

  const s = clamp01((f - 0.05) / 0.95);
  const radius =
    FALL_END_RADIUS +
    (FALL_ENTRY_RADIUS - FALL_END_RADIUS) * Math.pow(1 - s, 1.6);
  const theta = theta0 + turns * Math.PI * 2 * Math.pow(s, 1.35);

  _orbit
    .copy(HOLE.centre)
    .addScaledVector(HOLE_U, Math.cos(theta) * radius)
    .addScaledVector(HOLE_V, Math.sin(theta) * radius);

  const join = smoothstep01(f / 0.3);
  out.lerpVectors(from, _orbit, join);

  return 1 - smoothstep01((s - 0.55) / 0.45);
}
