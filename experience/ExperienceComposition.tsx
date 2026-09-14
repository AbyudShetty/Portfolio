"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";

import { scroll } from "@/hooks/useScrollProgress";
import { easeOutCubic, smoothstep01 } from "@/scene/reveal";
import { Astronaut } from "./Astronaut";
import {
  anchors,
  ASTRONAUT_DRIFT,
  ASTRONAUT_ENTER,
  ASTRONAUT_EXIT,
  ASTRONAUT_HOLD,
  STATIC_MOMENT,
  windowProgress,
} from "./sequence";
import {
  ASTRONAUT_ENDING_SCALE,
  ASTRONAUT_ENTRY,
  ENDING,
  fallInto,
  windowProgress as endingWindow,
} from "@/scene/ending";

/**
 * ExperienceComposition — the astronaut's place in the sequence.
 *
 * The figure arrives on the same beat as the Endurance, floats near the middle
 * of frame while the section is read, drifts right, and then leaves through
 * the bottom left. It does not come back: the projects are their own subject.
 *
 * Its position is *damped* toward the scroll-derived target rather than set
 * from it directly. Scroll arrives in discrete jumps and the camera is already
 * damped, so an object placed straight from raw scroll steps against a
 * smoothly moving camera — which is exactly what reads as jumping. Damping
 * both puts them on the same footing.
 */

/** ~2.2m suited, against a 28-unit Endurance ring — a person beside a ship. */
export const ASTRONAUT_SCALE = 1.15;

/**
 * Where the figure sits for most of the section: near the middle of frame,
 * still clear of the CaveLabs panel on the right.
 */
const HOLD_POSITION = new THREE.Vector3(0.4, 0.15, 0);

/**
 * A slow drift toward the lens across the hold. The figure is not travelling
 * anywhere; it simply grows a little, which reads as floating closer rather
 * than as an object being animated.
 */
const HOLD_APPROACH = 1.6;

/**
 * How far right it floats before leaving, in world units.
 *
 * Cut from 1.9 when the Experience panel widened to 42rem and the model
 * changed to the GLB, whose arms are held out from the body. Measured across
 * the section, the figure's right edge crossed the panel's left edge from
 * ~38% to ~60% of the section, by up to 248px at the midpoint, where one
 * world unit of drift is ~258px on screen. Clearing that with a 40px margin
 * needs ~1.1 units less; 0.6 leaves room for the approach enlarging it.
 */
const DRIFT_RIGHT = 0.6;

/**
 * Exit target, in world space. Solved against the camera at the moment the
 * exit completes: the figure leaves through the bottom-left of the frame.
 */
const EXIT_POSITION = new THREE.Vector3(-2.0, 0.4, -8.5);

/** Frame-rate independent follow, low enough to smooth scroll steps. */
const FOLLOW = 7;

const _target = new THREE.Vector3();

export function ExperienceComposition({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const socket = useRef<THREE.Object3D>(null);
  const settled = useRef(false);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const progress = reducedMotion ? STATIC_MOMENT : scroll.progress;
    const enter = easeOutCubic(
      smoothstep01(windowProgress(progress, ASTRONAUT_ENTER)),
    );
    const exit = reducedMotion
      ? 0
      : smoothstep01(windowProgress(progress, ASTRONAUT_EXIT));

    // The ending: back on the tether, a beat behind the Endurance, and into
    // the black hole after it.
    const craftFall = reducedMotion ? 0 : endingWindow(progress, ENDING.craftFall);
    if (craftFall > 0 && craftFall < 1) {
      if (!g.visible) g.visible = true;
      const size = fallInto(
        g.position,
        ASTRONAUT_ENTRY,
        Math.max(0, craftFall - 0.04),
        1.3,
      );
      g.scale.setScalar(ASTRONAUT_SCALE * ASTRONAUT_ENDING_SCALE * size);
      settled.current = false;
      if (socket.current) {
        socket.current.getWorldPosition(anchors.astronaut);
        anchors.astronautReady = size > 0.02;
      }
      if (size <= 0.002) g.visible = false;
      return;
    }

    // Absent from the hero, and gone once it has left the frame.
    if (enter <= 0.001 || exit >= 0.999) {
      if (g.visible) g.visible = false;
      settled.current = false;
      // Only invalidated before arrival. Through the exit the anchor stays
      // live, so the cable can fade out with the figure rather than being
      // cut the instant it hides.
      if (enter <= 0.001) anchors.astronautReady = false;
      return;
    }
    if (!g.visible) g.visible = true;

    // Entrance drifts up and forward into place; the hold eases toward the
    // lens; the drift carries it right just before it leaves.
    const emerge = 1 - enter;
    const hold = smoothstep01(windowProgress(progress, ASTRONAUT_HOLD));
    const drift = smoothstep01(windowProgress(progress, ASTRONAUT_DRIFT));

    _target.set(
      HOLD_POSITION.x - emerge * 2.6 + drift * DRIFT_RIGHT,
      HOLD_POSITION.y - emerge * 3.4,
      HOLD_POSITION.z - emerge * 16 + hold * HOLD_APPROACH,
    );
    _target.lerp(EXIT_POSITION, exit);

    if (!settled.current || reducedMotion) {
      g.position.copy(_target);
      settled.current = true;
    } else {
      g.position.lerp(_target, 1 - Math.exp(-FOLLOW * Math.min(delta, 1 / 30)));
    }

    g.scale.setScalar(ASTRONAUT_SCALE * (0.7 + enter * 0.3));

    // Publish the pack socket's live world position for the tether. Queried
    // from the scene graph each frame, so the cable stays attached through
    // the arrival, the drift and the exit alike. Until the model has loaded
    // the socket does not exist yet, and the cable simply waits for it.
    if (socket.current) {
      socket.current.getWorldPosition(anchors.astronaut);
      anchors.astronautReady = enter > 0.05;
    } else {
      anchors.astronautReady = false;
    }
  });

  return (
    <group ref={group} visible={false}>
      {/* Its own boundary: while the model streams in, only the figure waits
          — without this, the suspension would reach the canvas root and blank
          the whole scene. */}
      <Suspense fallback={null}>
        <Astronaut socketRef={socket} />
      </Suspense>
    </group>
  );
}
