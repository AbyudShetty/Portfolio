/**
 * enduranceLayer — pebbles stay a layer behind the Endurance.
 *
 * The scattered project pebbles and the atmospheric drifters were composed
 * before the craft had a flight path, and eleven of them turned out to sit
 * directly in it: through the ring's orbit, or between it and the lens, from
 * roughly 20% to 56% of the journey. Moving them for good would have meant
 * pushing three project stones 26–32 units deeper to clear the whole
 * corridor, which shrinks them and changes the Experience composition.
 *
 * So nothing is moved permanently. While the craft is present, any pebble
 * that overlaps it on screen is slid back *along its own line of sight* to
 * just past the craft's far side, and scaled up by exactly the ratio it
 * travelled. A point moved along the ray from the eye projects to the same
 * pixel, and scaling by distance keeps its apparent size, so on screen the
 * stone does not change at all. In the scene it is now behind the ring,
 * which means the Endurance occludes it and it can never pass through the
 * orbit.
 *
 * The push is weighted by how close the two are on screen, eased over a
 * narrow band past the edge of the craft's disc, and multiplied by the
 * craft's own arrival — so it grows in and falls away with no pop. Anything
 * inside the craft's volume is necessarily within that disc, so it always
 * gets the full push.
 */

import * as THREE from "three";

import { smoothstep01 } from "@/scene/reveal";
import { anchors } from "./sequence";

/** Angular band, in radians, over which the push eases off past the disc. */
const BAND = 0.14;

/** Gap left between a pushed stone and the craft's far side, in world units. */
const CLEARANCE = 1.5;

const _ray = new THREE.Vector3();
const _toCraft = new THREE.Vector3();

/**
 * Moves `position` behind the Endurance if it would otherwise sit in front
 * of it or inside it, and returns the scale multiplier that keeps the stone's
 * apparent size unchanged. Returns 1, and leaves `position` alone, whenever
 * the craft is absent or the two do not overlap.
 */
export function layerBehindEndurance(
  position: THREE.Vector3,
  radius: number,
  eye: THREE.Vector3,
): number {
  const ring = anchors.ring;
  if (ring.presence <= 0) return 1;

  _ray.subVectors(position, eye);
  const toStone = _ray.length();
  if (toStone < 1e-3) return 1;
  _ray.divideScalar(toStone);

  _toCraft.subVectors(ring.center, eye);
  const toCraft = _toCraft.length();
  if (toCraft < 1e-3) return 1;

  // Already past the craft's far side: it is behind it, nothing to do.
  const behind = toCraft + ring.radius + radius + CLEARANCE;
  if (toStone >= behind) return 1;

  const separation = Math.acos(
    THREE.MathUtils.clamp(_ray.dot(_toCraft) / toCraft, -1, 1),
  );
  const reach =
    Math.asin(Math.min(1, ring.radius / toCraft)) +
    Math.asin(Math.min(1, radius / toStone));
  const weight =
    ring.presence * (1 - smoothstep01((separation - reach) / BAND));
  if (weight <= 0) return 1;

  const distance = toStone + (behind - toStone) * weight;
  position.copy(eye).addScaledVector(_ray, distance);
  return distance / toStone;
}
