"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { usePerformanceTier } from "@/hooks/usePerformanceTier";

/**
 * DeepSpaceHaze — the faintest layer, and the one doing the most work.
 *
 * Real deep-space photography is never uniformly black: there is structure in
 * the dark, a barely-there luminance that tells the eye the volume continues.
 * Without it the background reads as a flat backdrop and the stars look
 * pasted on.
 *
 * Kept to a handful of enormous, extremely faint patches in near-neutral
 * grey. It is deliberately *not* a nebula: no purple, no cyan, no visible
 * cloud shapes, no gradient wash. If any patch is individually identifiable
 * on screen, it is too strong.
 */
const OPACITY = 0.05;
const RADIUS = 168;

/** A very soft, slightly irregular falloff — no hard edge anywhere. */
function makeHazeTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.5)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.22)");
  gradient.addColorStop(0.75, "rgba(255,255,255,0.06)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Patch placement is fixed rather than random: these are compositional
 * elements, and a background that reshuffles itself between visits is not
 * art-directed.
 */
const PATCHES: {
  direction: [number, number, number];
  scale: number;
  tint: string;
  opacity: number;
}[] = [
  // Warm-neutral, low and behind the field — gives the lower frame weight.
  { direction: [-0.45, -0.2, -0.87], scale: 150, tint: "#6A6259", opacity: 1 },
  // Cool-neutral counterweight, high and to the right.
  { direction: [0.72, 0.42, -0.55], scale: 128, tint: "#59606A", opacity: 0.8 },
  // A broad, almost imperceptible wash behind the hero's sky.
  { direction: [0.05, 0.75, 0.66], scale: 176, tint: "#5F625F", opacity: 0.55 },
  // Small, denser patch far left for asymmetry.
  { direction: [-0.85, 0.12, 0.51], scale: 96, tint: "#6B6660", opacity: 0.7 },
];

export function DeepSpaceHaze() {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const tier = usePerformanceTier();

  const texture = useMemo(() => makeHazeTexture(), []);

  // The group is centred on the camera, so a patch that faces the group's
  // local origin always faces the viewer. That makes billboarding a one-time
  // calculation instead of per-frame work.
  const patches = useMemo(() => {
    const dummy = new THREE.Object3D();
    return PATCHES.map((patch) => {
      const position = new THREE.Vector3(...patch.direction)
        .normalize()
        .multiplyScalar(RADIUS);
      dummy.position.copy(position);
      dummy.lookAt(0, 0, 0);
      return {
        ...patch,
        position: position.toArray() as [number, number, number],
        rotation: [
          dummy.rotation.x,
          dummy.rotation.y,
          dummy.rotation.z,
        ] as [number, number, number],
      };
    });
  }, []);

  useFrame(() => {
    // Sits with the stars at effective infinity.
    if (group.current) group.current.position.copy(camera.position);
  });

  // The first thing to go when frames are tight — it is atmosphere, not content.
  if (tier >= 2) return null;

  return (
    <group ref={group} renderOrder={-2}>
      {patches.map((patch, i) => {
        return (
          <mesh
            key={i}
            position={patch.position}
            rotation={patch.rotation}
            frustumCulled={false}
            raycast={() => null}
          >
            <planeGeometry args={[patch.scale, patch.scale * 0.72]} />
            <meshBasicMaterial
              map={texture}
              color={patch.tint}
              transparent
              opacity={OPACITY * patch.opacity}
              depthWrite={false}
              depthTest={false}
              blending={THREE.NormalBlending}
              fog={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
