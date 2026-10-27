/**
 * fieldEditor — the layout mode, and the live state it edits.
 *
 * Development only. Opened with `?edit` on the field (ui/FieldEditorPanel),
 * it pins the stones in their settled arrangement, parks the camera on one of
 * the shots the field is seen in, and lets the arrangement be moved by hand.
 * Saving writes the numbers back into projects/projectCoordinates.ts and
 * projects/projectStanding.ts, comments and all.
 *
 * Its state lives in a plain mutable object for the same reason the scroll
 * and pointer state do: a drag changes a position every frame, and routing
 * that through React would re-render the tree at the frame rate. The scene
 * reads `layout` inside its own loop; only discrete changes — which stone is
 * selected, which shot is parked, whether the mode is open at all — are
 * published to the panel through `subscribe`.
 */

import { SCROLL_VH } from "@/scene/cameraChoreography";

export interface StonePlacement {
  /** Ground position. The stone's own y is left alone. */
  x: number;
  z: number;
  /** Size, as projectStanding.ts means it. */
  scale: number;
  /** Turn about the stone's own axis, radians. Cancelled at the lens. */
  spin: number;
}

/** Which arrangement is being edited — the one this screen shape shows. */
export type Orientation = "landscape" | "portrait";

export type DragMode = "move" | "orbit" | "size" | "spin";

export interface FieldEditorState {
  active: boolean;
  orientation: Orientation;
  /** Where the camera is parked, in vh — one of the field's own shots. */
  shotVh: number;
  selectedId: string | null;
  /** Live placements, keyed by project id. Seeded from the files on open. */
  layout: Record<string, StonePlacement>;
  /** What a plain drag does; modifiers override it (scene/FieldEditorRig). */
  mode: DragMode;
  dirty: boolean;
  /** Set while a pointer drag is in flight, so hover effects stay out of it. */
  dragging: boolean;
}

export const fieldEditor: FieldEditorState = {
  active: false,
  orientation: "landscape",
  shotVh: 960,
  selectedId: null,
  layout: {},
  mode: "move",
  dirty: false,
  dragging: false,
};

/** The shots the settled field is actually seen in, for the shot switcher. */
export const EDITOR_SHOTS = [
  { vh: 730, label: "Arrival" },
  { vh: 840, label: "Descent" },
  { vh: 910, label: "Overhead" },
  { vh: 960, label: "Inspection" },
] as const;

/**
 * Parks on one of the field's shots.
 *
 * The page is moved as well as the camera, not instead of it: the overlays —
 * the name on the landing, the section headings — are driven by where the
 * document is scrolled, so parking the camera alone leaves the hero text
 * sitting over the field.
 */
export function parkAt(vh: number): void {
  fieldEditor.shotVh = vh;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: max * (vh / SCROLL_VH), behavior: "instant" });
  publishEditor();
}

const listeners = new Set<() => void>();

/** Discrete changes only — never call this from inside a drag. */
export function publishEditor(): void {
  for (const l of listeners) l();
}

export function subscribeEditor(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Undo history. Snapshots are small, so the whole layout is kept each time. */
const history: Record<string, StonePlacement>[] = [];

export function snapshot(): void {
  history.push(structuredClone(fieldEditor.layout));
  if (history.length > 120) history.shift();
}

export function undo(): boolean {
  const previous = history.pop();
  if (!previous) return false;
  fieldEditor.layout = previous;
  fieldEditor.dirty = true;
  publishEditor();
  return true;
}

export function canUndo(): boolean {
  return history.length > 0;
}
