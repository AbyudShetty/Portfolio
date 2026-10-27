import * as THREE from "three";

import { SCROLL_VH, sampleCamera } from "@/scene/cameraChoreography";
import { fovForAspect, portraitMix } from "@/scene/viewport";
import { PROJECT_OBJECTS } from "./ProjectData";
import { getCoordinate } from "./projectCoordinates";
import { stoneScale } from "./projectStanding";
import type { Orientation, StonePlacement } from "./fieldEditor";

/**
 * fieldCheck — whether an arrangement of the field actually holds up.
 *
 * Four things decide that, and all four are easy to break by eye:
 *
 *   1. two pebbles must not touch,
 *   2. two names must not collide,
 *   3. nothing may reach the edge of the frame,
 *   4. the best work must still read as the biggest thing on screen.
 *
 * None of them can be judged from one camera. The settled field is seen in
 * several shots and a layout that composes in one can fall apart in another,
 * so every check runs across all of them and reports which shot failed.
 *
 * This is the one place those rules live: the layout mode's panel reads it
 * live while a stone is dragged (ui/FieldEditorPanel), and its check button
 * runs the whole thing. It samples the real choreography rather than a copy,
 * so it cannot drift from what the camera actually does.
 */

/** The shots the settled field is seen in, in vh. */
const SHOTS = [
  { vh: 730, label: "arrival" },
  { vh: 770, label: "settling" },
  { vh: 840, label: "descent" },
  { vh: 910, label: "overhead" },
  { vh: 960, label: "inspection" },
  { vh: 1010, label: "inspection (held)" },
];

/** A pebble is about this wide across its long axis at scale 1. */
export const PEBBLE_RADIUS = 1.12;
/** The top rail sits across the first of the frame. */
const RAIL = 56;
/** Half a name's width, near enough, for keeping labels off the edge. */
const LABEL_HALF = 46;

export interface Thresholds {
  /** Clear air between two pebbles, in world units. */
  gap: number;
  /** Between two names, in px. */
  label: number;
  /** Between anything and the edge of the frame, in px. */
  frame: number;
}

/** What the solved field holds to today; the panel warns below these. */
export const THRESHOLDS: Thresholds = { gap: 0.2, label: 72, frame: 26 };

export interface Finding {
  kind: "gap" | "label" | "frame" | "order";
  /** Measured value, in the unit of its kind. */
  value: number;
  ids: string[];
  shot?: string;
  message: string;
}

export interface CheckResult {
  worstGap: number;
  worstLabel: number;
  worstFrame: number;
  /** Pairs reading out of order: a lesser project looking bigger. */
  inversions: number;
  findings: Finding[];
  /** Apparent size on screen at the inspection shot, best first. */
  apparent: { id: string; percent: number }[];
  ok: boolean;
}

export type Placements = Record<string, Pick<StonePlacement, "x" | "z" | "scale">>;

/** The arrangement as the files currently have it. */
export function currentPlacements(orientation: Orientation): Placements {
  const out: Placements = {};
  for (const record of PROJECT_OBJECTS) {
    const c = getCoordinate(record.id);
    const p = orientation === "portrait" ? c.portrait : c.gathered;
    out[record.id] = { x: p[0], z: p[2], scale: stoneScale(record.id) };
  }
  return out;
}

/** Each stone's own height, which the layout mode never changes. */
function groundY(id: string, orientation: Orientation): number {
  const c = getCoordinate(id);
  return (orientation === "portrait" ? c.portrait : c.gathered)[1];
}

export function checkField(
  placements: Placements,
  orientation: Orientation,
  viewport: { width: number; height: number },
  /** Standing order, best first — for the "big means better" check. */
  standing: readonly string[],
): CheckResult {
  const ids = Object.keys(placements);
  const { width: W, height: H } = viewport;
  const aspect = W / Math.max(1, H);
  const portrait = orientation === "portrait" ? 1 : portraitMix(aspect);
  const camera = new THREE.PerspectiveCamera(fovForAspect(aspect), aspect, 0.1, 500);
  const findings: Finding[] = [];

  // ── 1. Pebbles, edge to edge ────────────────────────────────────────────
  let worstGap = Infinity;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = placements[ids[i]];
      const b = placements[ids[j]];
      const gap =
        Math.hypot(b.x - a.x, b.z - a.z) -
        PEBBLE_RADIUS * (a.scale + b.scale);
      if (gap < worstGap) worstGap = gap;
      if (gap < THRESHOLDS.gap) {
        findings.push({
          kind: "gap",
          value: gap,
          ids: [ids[i], ids[j]],
          message:
            gap < 0
              ? `${ids[i]} and ${ids[j]} overlap by ${(-gap).toFixed(2)}u`
              : `${ids[i]} and ${ids[j]} are ${gap.toFixed(2)}u apart`,
        });
      }
    }
  }

  // ── 2–3. Names and the frame, in every shot ─────────────────────────────
  let worstLabel = Infinity;
  let worstFrame = Infinity;
  const vec = new THREE.Vector3();
  for (const shot of SHOTS) {
    const sampled = sampleCamera(shot.vh / SCROLL_VH, portrait);
    camera.position.set(...sampled.position);
    camera.lookAt(new THREE.Vector3(...sampled.target));
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    const half = Math.tan((camera.fov * Math.PI) / 360);

    const points = ids.map((id) => {
      const p = placements[id];
      const y = groundY(id, orientation);
      const body = vec.set(p.x, y, p.z).clone();
      const ndc = body.clone().project(camera);
      const distance = camera.position.distanceTo(body);
      const pxPerUnit = H / 2 / (distance * half);
      const label = new THREE.Vector3(p.x, y + p.scale * 0.95 + 0.34, p.z).project(
        camera,
      );
      return {
        id,
        bx: (ndc.x * 0.5 + 0.5) * W,
        by: (-ndc.y * 0.5 + 0.5) * H,
        radius: PEBBLE_RADIUS * p.scale * pxPerUnit,
        lx: (label.x * 0.5 + 0.5) * W,
        ly: (-label.y * 0.5 + 0.5) * H,
      };
    });

    for (const p of points) {
      const margin = Math.min(
        p.bx - p.radius,
        W - p.bx - p.radius,
        p.by - p.radius - RAIL,
        H - p.by - p.radius,
        p.lx - LABEL_HALF,
        W - p.lx - LABEL_HALF,
        p.ly - RAIL,
      );
      if (margin < worstFrame) worstFrame = margin;
      if (margin < THRESHOLDS.frame) {
        findings.push({
          kind: "frame",
          value: margin,
          ids: [p.id],
          shot: shot.label,
          message: `${p.id} is ${Math.round(margin)}px from the frame at ${shot.label}`,
        });
      }
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Math.hypot(points[i].lx - points[j].lx, points[i].ly - points[j].ly);
        if (d < worstLabel) worstLabel = d;
        if (d < THRESHOLDS.label) {
          findings.push({
            kind: "label",
            value: d,
            ids: [points[i].id, points[j].id],
            shot: shot.label,
            message: `${points[i].id} and ${points[j].id} names are ${Math.round(d)}px apart at ${shot.label}`,
          });
        }
      }
    }
  }

  // ── 4. Does size still say which work is better? ────────────────────────
  const inspection = sampleCamera(960 / SCROLL_VH, portrait);
  const eye = new THREE.Vector3(...inspection.position);
  const apparent = ids
    .map((id) => {
      const p = placements[id];
      const d = eye.distanceTo(new THREE.Vector3(p.x, groundY(id, orientation), p.z));
      return { id, size: p.scale / d };
    })
    .sort((a, b) => b.size - a.size);
  const place = Object.fromEntries(standing.map((id, i) => [id, i]));
  let inversions = 0;
  for (let i = 0; i < apparent.length; i++) {
    for (let j = i + 1; j < apparent.length; j++) {
      const better = place[apparent[i].id] ?? 999;
      const worse = place[apparent[j].id] ?? 999;
      if (better > worse) {
        inversions++;
        // Only the blatant ones are worth saying out loud.
        if (better - worse >= 3 && findings.filter((f) => f.kind === "order").length < 6) {
          findings.push({
            kind: "order",
            value: better - worse,
            ids: [apparent[i].id, apparent[j].id],
            message: `${apparent[i].id} reads bigger than ${apparent[j].id}, which outranks it`,
          });
        }
      }
    }
  }

  const top = apparent[0]?.size ?? 1;
  return {
    worstGap,
    worstLabel,
    worstFrame,
    inversions,
    findings,
    apparent: apparent.map((a) => ({ id: a.id, percent: (a.size / top) * 100 })),
    ok:
      worstGap >= THRESHOLDS.gap &&
      worstLabel >= THRESHOLDS.label &&
      worstFrame >= THRESHOLDS.frame,
  };
}

/**
 * Sizes that make the field read in order of standing, for the placements as
 * they are: each stone's wanted screen size multiplied by how far it ended up
 * from the lens. The layout mode's "size by standing" button.
 */
export function sizesForStanding(
  placements: Placements,
  orientation: Orientation,
  standing: readonly string[],
  /** Screen size of the least of them, against the best. */
  falloff = 0.54,
): Record<string, number> {
  const inspection = sampleCamera(960 / SCROLL_VH, orientation === "portrait" ? 1 : 0);
  const eye = new THREE.Vector3(...inspection.position);
  const ids = Object.keys(placements);
  const mean =
    ids.reduce((sum, id) => {
      const i = standing.indexOf(id);
      const want = 1 - (1 - falloff) * (i < 0 ? 1 : i / (standing.length - 1));
      const p = placements[id];
      return (
        sum +
        want * eye.distanceTo(new THREE.Vector3(p.x, groundY(id, orientation), p.z))
      );
    }, 0) / ids.length;
  const scaled: Record<string, number> = {};
  for (const id of ids) {
    const i = standing.indexOf(id);
    const want = 1 - (1 - falloff) * (i < 0 ? 1 : i / (standing.length - 1));
    const p = placements[id];
    const d = eye.distanceTo(new THREE.Vector3(p.x, groundY(id, orientation), p.z));
    scaled[id] = Math.round(((want * d) / mean) * 100) / 100;
  }
  return scaled;
}
