"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { TIER_PROFILE } from "./projectMaterials";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { scroll } from "@/hooks/useScrollProgress";
import {
  atmosphereFactor,
  easeOutCubic,
  revealFactor,
  smoothstep01,
} from "@/scene/reveal";
import { getPebbleGeometry } from "./projectGeometry";

/**
 * AtmosphericPebbles — Class B. Everything the portfolio is not.
 *
 * These exist to give the space population and depth: stones drifting past at
 * a distance, so the Experience does not read as one figure alone in a void.
 *
 * They are the *same stone* as a project pebble — same geometry generator,
 * same material values, same lighting response. The only difference is that
 * they are far away, which is the whole point: a second pebble design would
 * fracture the visual language. They are never interactive and never
 * labelled, so they cannot be mistaken for portfolio work.
 *
 * They are also temporary. As the real specimens gather into the field, these
 * fade and drift away, so the final composition contains the portfolio and
 * nothing else. The exit is a fade plus a drift outward, never a toggle.
 *
 * One instanced draw call for all of them.
 */
const COUNT = { 0: 26, 1: 18, 2: 10, 3: 0 } as const;

/** Held under one so distance reads, without touching the surface itself. */
const DISTANT_OPACITY = 0.62;

interface Drifter {
  position: THREE.Vector3;
  /** Where it drifts to as it leaves. */
  exit: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
  stagger: number;
}

function buildDrifters(count: number): Drifter[] {
  // Deterministic: the environment is composed, not re-rolled per visit.
  let seed = 88214417;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const drifters: Drifter[] = [];
  for (let i = 0; i < count; i++) {
    // A wide shell around the journey's path, biased away from the centre so
    // the astronaut and the title zone stay clear.
    const angle = (i / count) * Math.PI * 2 + random() * 0.6;
    const radius = 16 + random() * 26;
    const height = (random() - 0.5) * 22;
    const depth = -6 - random() * 58;

    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      height,
      depth + Math.sin(angle) * 8,
    );

    drifters.push({
      position,
      // Leaves outward and back — as though carried past by the journey.
      exit: position.clone().multiplyScalar(1.45).setZ(position.z - 26),
      scale: 0.35 + random() * 0.7,
      rotation: new THREE.Euler(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI,
      ),
      stagger: random(),
    });
  }
  return drifters;
}

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

export function AtmosphericPebbles({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tier = usePerformanceTier();
  const count = COUNT[tier];

  const drifters = useMemo(() => buildDrifters(count), [count]);
  // Literally one of the project pebble geometries — same generator, same
  // family, so there is no second pebble design anywhere in the scene.
  const geometry = useMemo(() => getPebbleGeometry("atmospheric-drift"), []);

  /**
   * The same material as a real project pebble, value for value: same body
   * colour, transmission, roughness, index of refraction, clearcoat and
   * reflection response. These have to read as the identical species — not a
   * second pebble design, not a darker variant, not an asteroid.
   *
   * The only difference is distance. They sit far out, and their opacity is
   * held slightly under one so they sit back in the air the way a distant
   * object does. Nothing about the surface itself changes, so the lighting
   * response is identical and they remain unmistakably the same stone, seen
   * from further away.
   */
  const material = useMemo(() => {
    const m = TIER_PROFILE["featured-1"].material;
    return new THREE.MeshPhysicalMaterial({
      color: m.bodyColor,
      transmission: m.transmission,
      thickness: m.thickness,
      ior: m.ior,
      roughness: m.roughness,
      metalness: 0,
      clearcoat: m.clearcoat,
      clearcoatRoughness: m.clearcoatRoughness,
      envMapIntensity: m.envMapIntensity,
      transparent: true,
      opacity: DISTANT_OPACITY,
      depthWrite: false,
    });
  }, []);

  useFrame(() => {
    const instanced = mesh.current;
    if (!instanced || !count) return;

    const progress = scroll.progress;

    // Gone entirely once the field has formed.
    const fade = reducedMotion ? 0 : atmosphereFactor(progress, 0.5);
    if (fade <= 0.002) {
      if (instanced.visible) instanced.visible = false;
      return;
    }
    if (!instanced.visible) instanced.visible = true;

    material.opacity = DISTANT_OPACITY * fade;

    for (let i = 0; i < drifters.length; i++) {
      const d = drifters[i];
      const reveal = easeOutCubic(revealFactor(progress, d.stagger));
      const leaving = 1 - smoothstep01(atmosphereFactor(progress, d.stagger));

      _position.lerpVectors(d.position, d.exit, leaving);
      // Arrives from further out, exactly as the real specimens do.
      _position.z -= (1 - reveal) * 34;
      _quaternion.setFromEuler(d.rotation);
      _scale.setScalar(d.scale * reveal);

      _matrix.compose(_position, _quaternion, _scale);
      instanced.setMatrixAt(i, _matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  });

  if (!count) return null;

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, count]}
      frustumCulled={false}
      raycast={() => null}
      visible={false}
      renderOrder={1}
    />
  );
}
