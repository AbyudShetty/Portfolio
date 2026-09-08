"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { usePerformanceTier } from "@/hooks/usePerformanceTier";

/**
 * DistantGalaxies — the layer that establishes scale.
 *
 * A handful of very faint smudges, far out and small on screen. They are what
 * tells the eye it is looking at deep space rather than a black page with dots
 * on it: a star gives you a point, a galaxy gives you a distance.
 *
 * Restraint is the whole discipline here. Each is a few degrees across at
 * most, near-neutral in colour, and at an opacity where you notice the sky has
 * structure without ever noticing the galaxy itself. No purple, no blue
 * gradient, no spiral arms picked out in colour — that is wallpaper, and
 * wallpaper competes with the content.
 */
const RADIUS = 158;

/** An elliptical core with a soft halo and faint banding. */
function makeGalaxyTexture(seed: number, banded: boolean): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  let s = seed;
  const random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  ctx.translate(size / 2, size / 2);
  ctx.rotate(random() * Math.PI);
  ctx.scale(1, 0.42 + random() * 0.3); // Inclined disc, never face-on circles.

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
  core.addColorStop(0, "rgba(255,255,255,0.85)");
  core.addColorStop(0.12, "rgba(255,255,255,0.45)");
  core.addColorStop(0.36, "rgba(255,255,255,0.16)");
  core.addColorStop(0.68, "rgba(255,255,255,0.04)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // A suggestion of structure — never resolved enough to read as spiral arms.
  if (banded) {
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const r = size * (0.14 + i * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.8, random() * Math.PI, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.05 - i * 0.012})`;
      ctx.lineWidth = size * 0.05;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Fixed placements: these are compositional elements, not random dressing. */
const GALAXIES: {
  direction: [number, number, number];
  scale: number;
  tint: string;
  opacity: number;
  seed: number;
  banded: boolean;
}[] = [
  { direction: [-0.62, 0.28, -0.73], scale: 15, tint: "#C8C2B4", opacity: 0.5, seed: 9137, banded: true },
  { direction: [0.78, -0.12, -0.61], scale: 10, tint: "#BFC3C8", opacity: 0.38, seed: 4421, banded: false },
  { direction: [0.24, 0.66, -0.71], scale: 7.5, tint: "#C6BEB2", opacity: 0.3, seed: 7715, banded: true },
  { direction: [-0.88, -0.3, 0.36], scale: 12, tint: "#BCC0C3", opacity: 0.26, seed: 3308, banded: false },
  { direction: [0.36, -0.52, 0.77], scale: 8.5, tint: "#C4BDB3", opacity: 0.22, seed: 6642, banded: true },
];

export function DistantGalaxies() {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const tier = usePerformanceTier();

  const items = useMemo(() => {
    const dummy = new THREE.Object3D();
    return GALAXIES.map((galaxy) => {
      const position = new THREE.Vector3(...galaxy.direction)
        .normalize()
        .multiplyScalar(RADIUS);
      dummy.position.copy(position);
      dummy.lookAt(0, 0, 0);
      return {
        ...galaxy,
        texture: makeGalaxyTexture(galaxy.seed, galaxy.banded),
        position: position.toArray() as [number, number, number],
        rotation: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z] as [
          number,
          number,
          number,
        ],
      };
    });
  }, []);

  useFrame(() => {
    // Follows the camera at 0.985 rather than 1.0: the galaxy layer drifts
    // almost imperceptibly against the star shell as the journey travels,
    // which is what gives the background its sense of separation and depth.
    if (group.current) group.current.position.copy(camera.position).multiplyScalar(0.985);
  });

  if (tier >= 2) return null;

  return (
    <group ref={group} renderOrder={-3}>
      {items.map((galaxy, i) => (
        <mesh
          key={i}
          position={galaxy.position}
          rotation={galaxy.rotation}
          frustumCulled={false}
          raycast={() => null}
        >
          <planeGeometry args={[galaxy.scale, galaxy.scale]} />
          <meshBasicMaterial
            map={galaxy.texture}
            color={galaxy.tint}
            transparent
            opacity={galaxy.opacity}
            depthWrite={false}
            depthTest={false}
            blending={THREE.NormalBlending}
            fog={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
