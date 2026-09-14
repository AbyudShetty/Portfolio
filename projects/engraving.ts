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
import { repoUrl, type ProjectRecord } from "./ProjectData";

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

/**
 * Where the engraved repository link sits on the decal, in its UVs (v up), so
 * a click on the stone can tell whether it landed on the link.
 */
export interface EngravingLink {
  kind: "repo" | "demo";
  url: string;
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

export interface EngravingTextures {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  links: EngravingLink[];
}

interface LinkRect {
  kind: EngravingLink["kind"];
  url: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
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
  | { kind: "rule"; x: number; y: number; w: number; h: number; tone: string }
  | {
      kind: "icon";
      icon: EngravingLink["kind"];
      /** Top-left of the icon's square. */
      x: number;
      y: number;
      size: number;
      tone: string;
    };

/*
  The marks, as 16-unit paths (GitHub Octicons, MIT): the GitHub mark for the
  repository, and a globe for a live site. Built on first use — Path2D does
  not exist outside the browser.
*/
const ICON_PATHS: Record<EngravingLink["kind"], string> = {
  repo: "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
  demo: "M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 0 0-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 0 0 4.666-5.5Zm2.733-1.5a6.507 6.507 0 0 0-4.666-5.5c.123.181.24.365.353.552.714 1.192 1.436 2.874 1.58 4.948Z",
};

const iconPaths = new Map<EngravingLink["kind"], Path2D>();
function iconPath(kind: EngravingLink["kind"]): Path2D {
  let path = iconPaths.get(kind);
  if (!path) {
    path = new Path2D(ICON_PATHS[kind]);
    iconPaths.set(kind, path);
  }
  return path;
}

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
): { runs: Run[]; height: number; links: LinkRect[] } {
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

  // Title, followed by its marks: the GitHub mark, and a globe when there is
  // a live site. They sit on the last line, centred on the capitals, sized to
  // read as part of the name rather than as buttons beside it.
  const titleSize = Math.round(132 * scale);
  const titleFont = `${titleSize}px ${fonts.serif}`;
  setFont(titleFont, 0);
  const marks: { kind: EngravingLink["kind"]; url: string }[] = [
    { kind: "repo", url: repoUrl(record) },
  ];
  if (record.demo) marks.push({ kind: "demo", url: record.demo });
  const iconSize = Math.round(titleSize * 0.44);
  const iconGap = Math.round(titleSize * 0.3);
  const marksWidth = marks.length * (iconSize + iconGap);
  const links: LinkRect[] = [];
  const titleLines = wrap(ctx, record.name, maxWidth - marksWidth);
  y += Math.round(26 * scale);
  titleLines.forEach((line, index) => {
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
    if (index !== titleLines.length - 1) return;
    let x = PAD_X + Math.ceil(ctx.measureText(line).width) + iconGap;
    const top = Math.round(y - titleSize * 0.34 - iconSize / 2);
    // Generous targets: they sit on a moving, curved stone.
    const pad = Math.round(iconSize * 0.4);
    for (const mark of marks) {
      runs.push({
        kind: "icon",
        icon: mark.kind,
        x,
        y: top,
        size: iconSize,
        tone: "#E3E6E9",
      });
      links.push({
        kind: mark.kind,
        url: mark.url,
        x0: x - pad,
        x1: x + iconSize + pad,
        y0: top - pad,
        y1: top + iconSize + pad,
      });
      x += iconSize + iconGap;
    }
  });

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

  return { runs, height: y + Math.round(stackSize * 0.4), links };
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
    if (run.kind === "icon") {
      const path = iconPath(run.icon);
      const k = run.size / 16;
      ctx.save();
      if (mode === "height") {
        ctx.translate(run.x, y);
        ctx.scale(k, k);
        ctx.fillStyle = "#000000";
        ctx.fill(path);
      } else {
        // The same shadowed upper wall the letters are given.
        ctx.translate(run.x - 1.5, y - 2.5);
        ctx.scale(k, k);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fill(path);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(run.x, y);
        ctx.scale(k, k);
        ctx.fillStyle = run.tone;
        ctx.fill(path);
      }
      ctx.restore();
      continue;
    }
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

    // Canvas y runs down; decal v runs up (the texture is flipped on upload).
    const links: EngravingLink[] = block.links.map((rect) => ({
      kind: rect.kind,
      url: rect.url,
      u0: rect.x0 / CANVAS_W,
      u1: rect.x1 / CANVAS_W,
      v0: 1 - (rect.y1 + offsetY) / CANVAS_H,
      v1: 1 - (rect.y0 + offsetY) / CANVAS_H,
    }));
    return { map, bump, links };
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
