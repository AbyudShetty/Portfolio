/**
 * cameraChoreography — the scroll timeline.
 *
 * Scroll position, not wheel delta, is the source of truth. The page is an
 * ordinary tall document; its scroll progress samples a fixed set of camera
 * keyframes, so every point in the narrative has a deterministic camera. Jump
 * to an anchor, restore a scroll position, or resize the window and the
 * camera lands exactly where it belongs.
 *
 * Section heights are declared here in viewport units and everything else —
 * document height, section boundaries, keyframe timing — is derived from
 * them, so the page and the choreography cannot drift apart.
 */

export const SECTION_VH = {
  landing: 100,
  experience: 260,
  projects: 420,
} as const;

export type SectionId = keyof typeof SECTION_VH;

export const SECTION_ORDER: SectionId[] = ["landing", "experience", "projects"];

export const TOTAL_VH = SECTION_ORDER.reduce(
  (sum, id) => sum + SECTION_VH[id],
  0,
);

/** Scrollable distance in vh — the document minus one viewport. */
export const SCROLL_VH = TOTAL_VH - 100;

/** Where a section begins, in vh from the top of the document. */
export function sectionStartVh(id: SectionId): number {
  let offset = 0;
  for (const section of SECTION_ORDER) {
    if (section === id) break;
    offset += SECTION_VH[section];
  }
  return offset;
}

/** Converts a document position in vh to global narrative progress (0–1). */
export function progressAt(vh: number): number {
  return Math.min(1, Math.max(0, vh / SCROLL_VH));
}

export interface CameraKeyframe {
  /** Global narrative progress, 0–1. */
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * The journey.
 *
 * The opening frame is aimed at empty sky. Nothing is placed above the
 * camera's horizon, so at rest the hero contains stars and the title and
 * literally nothing else — the composition is protected by where the lens
 * points, not only by what is hidden. As scroll begins, the camera tilts down
 * and travels forward: space does not fade in around the reader, the reader
 * turns toward it.
 *
 * From there it is one continuous move — hold on the astronaut, lift and
 * pitch down over the gathering specimens, settle overhead, then descend into
 * the field. No cuts anywhere.
 */
export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // 01 — Landing. Aimed up into open sky, above everything in the scene.
  { at: progressAt(0), position: [0, 1.2, 34], target: [0, 9.5, 20] },

  // ~2% — the first movement. Still pitched well up, so the arriving world
  // enters from below the frame rather than across the title.
  { at: progressAt(14), position: [0, 1.2, 32.6], target: [0, 8.4, 19] },

  // ~5% — the world is clearly present, low in frame; the title has cleared.
  { at: progressAt(34), position: [0.1, 1.15, 29], target: [0.15, 5.0, 14] },

  { at: progressAt(60), position: [0.2, 1.1, 25], target: [0.25, 3.0, 8] },

  // Coming level as the approach continues.
  { at: progressAt(150), position: [0.4, 1.05, 18], target: [0.4, 1.6, 2] },

  // 02 — Experience. Aim is right of the astronaut, which places the figure
  // left of centre and leaves the right of the frame for the DOM panel.
  { at: progressAt(240), position: [1.7, 0.85, 5.4], target: [0.5, 0.62, -0.6] },

  // Lift and pitch down. The pebbles are converging below and ahead.
  { at: progressAt(370), position: [1.2, 8, -4], target: [0, 1, -17] },

  // 03 — The gathered field, overhead.
  { at: progressAt(490), position: [0.4, 24, -13.5], target: [0, 0, -25.6] },

  // Descent — the stones grow and resolve.
  { at: progressAt(630), position: [0, 15, -16], target: [0, 0, -25.6] },

  // Inspection level, low and among them.
  { at: progressAt(780), position: [-1.6, 7.5, -17.5], target: [0.4, 0.2, -25.6] },
];

/** Smoothstep — removes the velocity discontinuity at every keyframe. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

const sampled = {
  position: [0, 0, 0] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
};

/**
 * Samples the timeline at a progress value. Returns a shared object — this is
 * called every frame, and allocating two arrays per frame for the life of the
 * page is exactly the kind of waste that shows up as jank later.
 */
export function sampleCamera(progress: number) {
  const frames = CAMERA_KEYFRAMES;
  const p = Math.min(1, Math.max(0, progress));

  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1].at) i++;

  const a = frames[i];
  const b = frames[i + 1];
  const span = b.at - a.at;
  const local = span <= 0 ? 0 : smoothstep(Math.min(1, Math.max(0, (p - a.at) / span)));

  for (let axis = 0; axis < 3; axis++) {
    sampled.position[axis] =
      a.position[axis] + (b.position[axis] - a.position[axis]) * local;
    sampled.target[axis] =
      a.target[axis] + (b.target[axis] - a.target[axis]) * local;
  }

  return sampled;
}

/**
 * Pointer interaction with the pebbles only makes sense once the field is
 * actually on screen. Before that the objects are scenery being travelled
 * toward, and hover would be noise.
 */
/**
 * When the field is allowed to be *glass*.
 *
 * A transmissive material does not cost what it looks like it costs. Three.js
 * answers a single visible transmissive object by re-rendering the entire
 * scene into a second target — so while the Endurance is on screen, twelve
 * distant pebbles at the bottom of frame were forcing a 300,000-triangle
 * craft and a 39,000-triangle figure to be drawn twice every frame. Measured,
 * that was 6.7ms of a 15ms frame: forty-five per cent of the Experience spent
 * refracting empty space behind stones nobody is looking at yet.
 *
 * So the stones stay solid until the craft beat is over, and resolve into
 * glass as the camera settles into the field. Which is also the better story:
 * distance withholds the material, arrival grants it.
 */
export const FIELD_OPTICS = { start: progressAt(370), end: progressAt(450) };

export const INSPECTION_PROGRESS = progressAt(450);

/** The static frame used for reduced motion and for the no-scroll fallback. */
export const STATIC_FRAME_PROGRESS = progressAt(520);
