/**
 * specimen — one stone, held up to the lens.
 *
 * The rule the rest of the site is built on is that scroll is the only thing
 * that moves the camera. Opening a project must not break that, so the camera
 * does not go to the stone: **the stone comes to the camera.** It leaves the
 * field, turns its flat face to the lens and settles at a fixed station in
 * front of it, computed in camera space every frame.
 *
 * Three things fall out of that, all of them good:
 *
 *   - Every project is framed identically, because the station is the same
 *     point in camera space whichever stone is occupying it. The panel can
 *     therefore be plain centred DOM instead of something chasing a moving
 *     3D anchor around the screen.
 *   - Closing is free. Nothing has to remember where the camera was, because
 *     the camera never went anywhere — §6.3's "the camera returns to the same
 *     marked position it left" is satisfied by never leaving it.
 *   - Moving between projects is one stone going home and another arriving,
 *     with the frame held still between them. You never lose the map.
 */

import { PROJECT_OBJECTS, type ProjectRecord } from "./ProjectData";

/**
 * The station, in camera space: metres in front of the lens, and the scale
 * the stone is held at once it arrives.
 *
 * `distance` and `scale` are a pair — moving one without the other changes
 * how much of the frame the stone fills. At 42° vertical field of view a
 * stone of half-height 0.95 units sits at 6.2 metres and covers a little over
 * two thirds of the frame: large enough to be the surface the text is written
 * on, small enough that the field it came from is still visible around it.
 */
export const STATION = {
  distance: 6.2,
  /**
   * Dead centre, both axes. The panel is centred in the viewport, so any
   * offset here shows up as uneven stone around it — measured, a 0.12 lift
   * put 162px of stone above the panel and 96px below, which reads as the
   * text having slipped rather than as a deliberate composition.
   */
  offsetY: 0,
  offsetX: 0,
  scale: 1.72,
} as const;

/*
 * How far into the flight the text starts to surface is expressed in CSS
 * instead of here — SpecimenPanel.css reads `--specimen-presence`, which
 * ProjectObject writes each frame, and staggers the blocks against it. Keeping
 * the thresholds next to the type they reveal is the only way that stagger
 * stays legible to whoever tunes it next.
 */

/** Field order — the sequence the arrow keys and the prev/next controls follow. */
export const SPECIMEN_ORDER: ProjectRecord[] = PROJECT_OBJECTS;

export function specimenIndex(id: string): number {
  return SPECIMEN_ORDER.findIndex((r) => r.id === id);
}

/** Wraps, so stepping never dead-ends at either edge of the field. */
export function stepSpecimen(id: string, delta: number): string {
  const index = specimenIndex(id);
  if (index < 0) return SPECIMEN_ORDER[0].id;
  const next =
    (index + delta + SPECIMEN_ORDER.length) % SPECIMEN_ORDER.length;
  return SPECIMEN_ORDER[next].id;
}

/**
 * Adjacent work — DESIGN.md §10.4.
 *
 * Same domain first, because that is the connection a reader is most likely
 * to want next, then whatever follows in field order to make up the number.
 * Never returns the project you are already looking at.
 */
export function adjacentSpecimens(id: string, count = 2): ProjectRecord[] {
  const current = SPECIMEN_ORDER.find((r) => r.id === id);
  if (!current) return [];
  const sameDomain = SPECIMEN_ORDER.filter(
    (r) => r.id !== id && r.domain === current.domain,
  );
  const rest = SPECIMEN_ORDER.filter(
    (r) => r.id !== id && r.domain !== current.domain,
  );
  return [...sameDomain, ...rest].slice(0, count);
}
