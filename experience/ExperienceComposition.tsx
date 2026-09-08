"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

import { scroll } from "@/hooks/useScrollProgress";
import { easeOutCubic, revealFactor } from "@/scene/reveal";
import { getCoordinate } from "@/projects/projectCoordinates";
import { Astronaut } from "./Astronaut";

/**
 * ExperienceComposition — the astronaut's place in the scene.
 *
 * Positioned left of the camera's aim so the figure sits in the left third of
 * the Experience frame and the right side stays clear for the CAVE content in
 * the DOM. It is the one figure among a field of objects, which is what marks
 * the internship as a different kind of thing without borrowing any of the
 * pebbles' visual language.
 *
 * It arrives first in the reveal sequence — the world awakens around the
 * subject, not the other way round.
 */
export function ExperienceComposition({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const coordinate = getCoordinate("slimevr");
  const [x, y, z] = coordinate.gathered;

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    // Absent from the hero: the title is a protected composition.
    const reveal = reducedMotion ? 1 : revealFactor(scroll.progress, 0);
    if (reveal <= 0.001) {
      if (g.visible) g.visible = false;
      return;
    }
    if (!g.visible) g.visible = true;

    // Drifts in from further out rather than fading up in place.
    const eased = easeOutCubic(reveal);
    const emerge = 1 - eased;
    g.position.set(x - emerge * 1.5, y + emerge * 1.2, z - emerge * 22);
    g.scale.setScalar(0.55 + eased * 0.45);
  });

  return (
    <group ref={group} visible={false}>
      <Astronaut />
    </group>
  );
}
