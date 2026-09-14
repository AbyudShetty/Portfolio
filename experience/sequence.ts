/**
 * sequence — one timeline for the whole rocket/astronaut/tether beat.
 *
 * The three objects were previously timed independently, which is why the
 * astronaut was on screen before the craft had arrived: each was reading its
 * own reveal window. They are one shot, so their timing lives in one file and
 * the ordering is legible at a glance:
 *
 *   Endurance enters  →  travels alone  →  astronaut enters
 *   →  ring closes     →  cable pays out →  Endurance departs
 *   →  astronaut alone, still tethered to something off-frame
 *
 * Windows overlap deliberately. A sequence where each stage waits for the
 * last to finish reads as a slideshow; the craft is still travelling when the
 * astronaut appears, and still visible when the cable connects.
 */

import * as THREE from "three";
import { progressAt } from "@/scene/cameraChoreography";

/** The Endurance and the astronaut arrive together, as one composition. */
export const CRAFT_ENTER = { start: progressAt(307), end: progressAt(376) };

/**
 * The astronaut enters on the same beat as the craft. They are two halves of
 * one image — a figure already tethered to a ship — so staggering them would
 * only delay the picture the section is actually about.
 */
export const ASTRONAUT_ENTER = { start: progressAt(307), end: progressAt(384) };

/**
 * The three of them — craft, figure and cable — fade in together over the
 * first part of their arrival rather than appearing on a single frame.
 */
export const SPAWN_FADE = { start: progressAt(307), end: progressAt(340) };

/** The long float in the middle of frame, between arrival and departure. */
export const ASTRONAUT_HOLD = { start: progressAt(384), end: progressAt(484) };

/**
 * A slow drift to the right across 21–29% of the journey — the last thing the
 * figure does before it leaves, and the beat that sets up the exit.
 */
export const ASTRONAUT_DRIFT = { start: progressAt(423), end: progressAt(477) };

/**
 * The figure leaves through the bottom-left of the frame while
 * the camera climbs away toward the project field. Held as a world position
 * rather than a screen offset so it drifts out like an object, not like a
 * sprite pinned to the viewport.
 */
export const ASTRONAUT_EXIT = { start: progressAt(484), end: progressAt(652) };

/**
 * The cable is a fixed physical link, not an event.
 *
 * It is anchored at both ends from the moment both ends exist and stays that
 * way — no pay-out, no reaching across, no growing length. Earlier versions
 * animated it into place from one end or the other, and both read as the
 * connection being *made* on screen, which is a different story from an
 * astronaut who is already tethered to a ship.
 */
export const TETHER_ATTACH_AT = progressAt(322);

/**
 * The cable fades rather than vanishing, and outlasts the figure slightly, so
 * it reads as trailing away with it instead of being switched off.
 */
export const TETHER_FADE = { start: progressAt(580), end: progressAt(672) };

/** Where the approach/departure beat ends and the craft is gone for good. */
export const PHASE_A_END = progressAt(710);


/** Past this the beat is behind the camera and stops being simulated. */
export const SEQUENCE_END = progressAt(960);

/** Reduced motion holds this moment: connected, craft departing. */
export const STATIC_MOMENT = progressAt(565);

/**
 * Live attachment points, in world space.
 *
 * Published by the objects that own them and read by the tether, so the cable
 * is always anchored to where the hardware actually *is* this frame rather
 * than to a constant that was true when it was written. This is what closes
 * the gap between the cable and the astronaut's pack.
 */
export const anchors = {
  astronaut: new THREE.Vector3(),
  astronautReady: false,
  craft: new THREE.Vector3(),
  craftReady: false,
  /**
   * The Endurance as a volume: where it is, how far its structure reaches,
   * and how present it is (0 while hidden, rising with its arrival). Read by
   * enduranceLayer.ts to keep pebbles behind the craft instead of in its orbit.
   */
  ring: { center: new THREE.Vector3(), radius: 0, presence: 0 },
};

export function windowProgress(
  progress: number,
  window: { start: number; end: number },
): number {
  return (progress - window.start) / (window.end - window.start);
}
