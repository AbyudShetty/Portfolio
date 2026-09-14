/**
 * engraving — the project, cut into its own stone.
 *
 * The first version of the specimen view laid DOM text over the stone. It
 * could be made legible, but it was never *on* the stone: it lived in a
 * different layer with its own clock, so it could appear before the stone
 * had finished arriving, and it never turned, scaled or caught light with
 * it. Engraving removes that category of problem instead of tuning it. The
 * words are geometry on the stone's surface, so they arrive exactly as fast
 * as the stone does, because they are the stone.
 *
 * Three pieces:
 *
 *   face frame  the broad face's normal, plus the stone's long axis across
 *               that face (principal direction of its own vertices), so a
 *               line of text runs along the stone the way a carver would
 *               set it out, and the reader can be shown it upright.
 *   decal       DecalGeometry projected onto that face, so the letters
 *               follow the stone's real curvature rather than floating on a
 *               flat card in front of it.
 *   textures    the same letterforms drawn twice: a colour map with a pale
 *               fill and a shadowed upper wall, and a blurred height map
 *               used as a bump map, so the studio key shades every stroke as
 *               a recess. Built once per project, after the web fonts load.
 *
 * The DOM keeps the same content for screen readers; see SpecimenPanel.
 */

import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

import { DOMAIN_LABEL, SIGNAL } from "@/lib/design-tokens";
import { getCoordinate } from "./projectCoordinates";
import {
  getPebbleCentre,
  getPebbleFaceNormal,
  getPebbleGeometry,
} from "./projectGeometry";
import type { ProjectRecord } from "./ProjectData";

/**
 * The engraved field, in the stone's own units (before the presentation
 * scale). The broad face is roughly 2.2 × 1.9 across; a rectangle inscribed
 * in an ellipse can be at most 1/√2 of each axis, so this keeps every letter
 * on the flatter middle of the face, away from where it rolls off.
 */
export const ENGRAVING = { width: 1.52, height: 1.28, depth: 0.9 } as const;

const CANVAS_W = 1600;
const CANVAS_H = Math.round((CANVAS_W * ENGRAVING.height) / ENGRAVING.width);
const PAD_X = 70;
const PAD_Y = 64;

/* ── Face frame ──────────────────────────────────────────────────────────── */

export interface FaceFrame {
  /** Along the stone's longest extent across the face: the line of text. */
  right: THREE.Vector3;
  /** Across the face, perpendicular to `right`: the text's up. */
  up: THREE.Vector3;
  /** Out of the broad face. */
  normal: THREE.Vector3;
  /** Rotation taking the stone's own frame to (right, up, normal) axes. */
  toFrame: THREE.Matrix4;
}

const frames = new Map<string, FaceFrame>();

export function getFaceFrame(id: string): FaceFrame {
  const cached = frames.get(id);
  if (cached) return cached;

  const geometry = getPebbleGeometry(id);
  const centre = getPebbleCentre(id);
  const normal = getPebbleFaceNormal(id).clone().normalize();

  // Any orthonormal pair in the face plane, then rotate it onto the plane's
  // principal axis. A 2×2 covariance has a closed-form principal angle.
  const a = new THREE.Vector3(1, 0, 0);
  if (Math.abs(a.dot(normal)) > 0.9) a.set(0, 0, 1);
  a.addScaledVector(normal, -a.dot(normal)).normalize();
  const b = new THREE.Vector3().crossVectors(normal, a);

  let saa = 0;
  let sbb = 0;
  let sab = 0;
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i).sub(centre);
    const x = v.dot(a);
    const y = v.dot(b);
    saa += x * x;
    sbb += y * y;
    sab += x * y;
  }
  const angle = 0.5 * Math.atan2(2 * sab, saa - sbb);

  const right = a
    .clone()
    .multiplyScalar(Math.cos(angle))
    .addScaledVector(b, Math.sin(angle))
    .normalize();
  // Right-handed: right × up = normal, so the text is never mirrored.
  const up = new THREE.Vector3().crossVectors(normal, right).normalize();
  // For a pure rotation the inverse is the transpose.
  const toFrame = new THREE.Matrix4().makeBasis(right, up, normal).transpose();

  const frame = { right, up, normal, toFrame };
  frames.set(id, frame);
  return frame;
}

/* ── Decal ───────────────────────────────────────────────────────────────── */

const decals = new Map<string, THREE.BufferGeometry>();

export function getEngravingGeometry(id: string): THREE.BufferGeometry {
  const cached = decals.get(id);
  if (cached) return cached;

  const { right, up, normal } = getFaceFrame(id);
  const centre = getPebbleCentre(id);

  // A throwaway mesh at the identity, so the decal comes out in the stone's
  // own space and can be parented straight under the stone's group.
  const mesh = new THREE.Mesh(getPebbleGeometry(id));
  mesh.updateMatrixWorld(true);

  // Project from the actual surface point, not the centre. The clip box is
  // only 0.9 deep, which is what keeps the engraving off the back face.
  const raycaster = new THREE.Raycaster(
    centre.clone().addScaledVector(normal, 4),
    normal.clone().negate(),
  );
  const hit = raycaster.intersectObject(mesh, false)[0];
  const surface = hit
    ? hit.point
    : centre.clone().addScaledVector(normal, 0.6);

  const orientation = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(right, up, normal),
  );
  const decal = new DecalGeometry(
    mesh,
    surface,
    orientation,
    new THREE.Vector3(ENGRAVING.width, ENGRAVING.height, ENGRAVING.depth),
  );
  decals.set(id, decal);
  return decal;
}

/* ── Textures ────────────────────────────────────────────────────────────── */

export interface EngravingTextures {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
}

type Run =
  | {
      kind: "text";
      text: string;
      font: string;
      tracking: number;
      x: number;
      y: number;
      tone: string;
    }
  | { kind: "rule"; x: number; y: number; w: number; h: number; tone: string };

/** The loaded next/font family for a CSS variable, with a real fallback. */
function family(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function layout(
  ctx: CanvasRenderingContext2D,
  record: ProjectRecord,
  fonts: { serif: string; sans: string; mono: string; text: string },
  scale: number,
): { runs: Run[]; height: number } {
  const runs: Run[] = [];
  const maxWidth = CANVAS_W - PAD_X * 2;
  let y = 0;

  const setFont = (font: string, tracking: number) => {
    ctx.font = font;
    ctx.letterSpacing = `${tracking}px`;
  };

  // Eyebrow: domain and coordinate, the instrument's own labelling.
  const eyebrowSize = Math.round(36 * scale);
  const eyebrowFont = `${eyebrowSize}px ${fonts.mono}`;
  const eyebrowTracking = 6 * scale;
  y += eyebrowSize;
  runs.push({
    kind: "text",
    text: `${DOMAIN_LABEL[record.domain]}   ${getCoordinate(record.id).code}`,
    font: eyebrowFont,
    tracking: eyebrowTracking,
    x: PAD_X,
    y,
    tone: SIGNAL.base,
  });

  // Title.
  const titleSize = Math.round(132 * scale);
  const titleFont = `${titleSize}px ${fonts.serif}`;
  setFont(titleFont, 0);
  y += Math.round(26 * scale);
  for (const line of wrap(ctx, record.name, maxWidth)) {
    y += Math.round(titleSize * 1.02);
    runs.push({
      kind: "text",
      text: line,
      font: titleFont,
      tracking: 0,
      x: PAD_X,
      y,
      tone: "#E3E6E9",
    });
  }

  // Points, each set off by a short scored rule.
  // Newsreader, a text serif, set a step larger than the grotesque it
  // replaced and at medium weight: a serif reads smaller at the same size,
  // and hairline strokes break up on a bump-mapped surface.
  const bodySize = Math.round(56 * scale);
  const bodyFont = `500 ${bodySize}px ${fonts.text}`;
  const lineHeight = Math.round(bodySize * 1.36);
  // Rule is 40 wide; the rest is the gap before the text.
  const indent = Math.round(56 * scale);
  setFont(bodyFont, 0);
  y += Math.round(54 * scale);
  record.points.forEach((point, index) => {
    if (index > 0) y += Math.round(30 * scale);
    const lines = wrap(ctx, point, maxWidth - indent);
    runs.push({
      kind: "rule",
      x: PAD_X,
      // Centred on the first line's lowercase letters. The rule used to sit
      // at 0.52 of the line box — about cap height — which read as a
      // superscript; the middle of the x-height is ~0.25em above baseline.
      y:
        y +
        lineHeight -
        Math.round(bodySize * 0.25) -
        Math.round(Math.max(3, Math.round(4 * scale)) / 2),
      w: Math.round(40 * scale),
      h: Math.max(3, Math.round(4 * scale)),
      tone: SIGNAL.base,
    });
    for (const line of lines) {
      y += lineHeight;
      runs.push({
        kind: "text",
        text: line,
        font: bodyFont,
        tracking: 0,
        x: PAD_X + indent,
        y,
        tone: "#BFC5CA",
      });
    }
  });

  // Stack.
  const stackSize = Math.round(34 * scale);
  const stackFont = `${stackSize}px ${fonts.mono}`;
  const stackTracking = 3 * scale;
  setFont(stackFont, stackTracking);
  y += Math.round(50 * scale);
  for (const line of wrap(
    ctx,
    record.stack.slice(0, 6).join("  ·  ").toUpperCase(),
    maxWidth,
  )) {
    y += Math.round(stackSize * 1.4);
    runs.push({
      kind: "text",
      text: line,
      font: stackFont,
      tracking: stackTracking,
      x: PAD_X,
      y,
      tone: SIGNAL.base,
    });
  }

  return { runs, height: y + Math.round(stackSize * 0.4) };
}

function paint(
  canvas: HTMLCanvasElement,
  runs: Run[],
  offsetY: number,
  mode: "colour" | "height",
) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mode === "height") {
    // Surface is white (high); cuts are black (low). The blur gives the cut
    // sloped walls, which is what the bump map turns into shading.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = "blur(2.5px)";
  }
  ctx.textBaseline = "alphabetic";

  for (const run of runs) {
    const y = run.y + offsetY;
    if (run.kind === "rule") {
      if (mode === "height") {
        ctx.fillStyle = "#000000";
      } else {
        ctx.fillStyle = run.tone;
      }
      ctx.fillRect(run.x, y, run.w, run.h);
      continue;
    }
    ctx.font = run.font;
    ctx.letterSpacing = `${run.tracking}px`;
    if (mode === "height") {
      ctx.fillStyle = "#000000";
      ctx.fillText(run.text, run.x, y);
    } else {
      // The wall of each cut nearest the key light (high, left) falls into
      // shadow; a pale fill below it reads as the floor of the letter.
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillText(run.text, run.x - 1.5, y - 2.5);
      ctx.fillStyle = run.tone;
      ctx.fillText(run.text, run.x, y);
    }
  }
  ctx.filter = "none";
}

const textures = new Map<string, Promise<EngravingTextures>>();

export function getEngravingTextures(
  record: ProjectRecord,
  anisotropy: number,
): Promise<EngravingTextures> {
  const cached = textures.get(record.id);
  if (cached) return cached;

  const built = (async () => {
    const fonts = {
      serif: family("--font-instrument-serif", "Georgia, serif"),
      sans: family("--font-geist-sans", "system-ui, sans-serif"),
      mono: family("--font-geist-mono", "ui-monospace, monospace"),
      text: family("--font-newsreader", "Georgia, serif"),
    };
    // Canvas text uses whatever face is loaded *now*; without this the first
    // engraving could be cut in a fallback font and never redrawn.
    await Promise.all([
      document.fonts.load(`132px ${fonts.serif}`),
      document.fonts.load(`500 56px ${fonts.text}`),
      document.fonts.load(`36px ${fonts.mono}`),
    ]).catch(() => undefined);

    const colour = document.createElement("canvas");
    colour.width = CANVAS_W;
    colour.height = CANVAS_H;
    const height = document.createElement("canvas");
    height.width = CANVAS_W;
    height.height = CANVAS_H;

    // Shrink the whole block until it fits, so a long project never runs off
    // the carved field.
    const measure = colour.getContext("2d")!;
    let scale = 1;
    let block = layout(measure, record, fonts, scale);
    for (let i = 0; i < 8 && block.height > CANVAS_H - PAD_Y * 2; i++) {
      scale *= 0.93;
      block = layout(measure, record, fonts, scale);
    }
    const offsetY = Math.max(PAD_Y, Math.round((CANVAS_H - block.height) / 2));

    paint(colour, block.runs, offsetY, "colour");
    paint(height, block.runs, offsetY, "height");

    const map = new THREE.CanvasTexture(colour);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = anisotropy;
    const bump = new THREE.CanvasTexture(height);
    bump.anisotropy = anisotropy;
    return { map, bump };
  })();

  textures.set(record.id, built);
  return built;
}

export function createEngravingMaterial(
  t: EngravingTextures,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: t.map,
    bumpMap: t.bump,
    bumpScale: 1.6,
    roughness: 0.62,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    // Sits on the stone's own surface; the offset keeps it from z-fighting.
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
}
