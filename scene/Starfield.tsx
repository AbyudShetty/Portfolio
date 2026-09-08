"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { usePerformanceTier } from "@/hooks/usePerformanceTier";

/**
 * Starfield — depth, not subject.
 *
 * Sparse, small, mostly dim, with a handful of brighter points for the eye to
 * fix on. This is dark astrophotography, not a galaxy: no nebula gradients, no
 * colour washes, no twinkling (a loop would also break the one-animation
 * rule), and few enough stars that black space still reads as black.
 *
 * Two clouds rather than one: `PointsMaterial` has a single size for all its
 * points, so magnitude variation is expressed as a faint cloud and a sparse
 * bright cloud instead of a custom shader — which is also the cheaper way to
 * draw it.
 *
 * The shell follows the camera, so the journey never flies through it and the
 * stars behave as though at infinity.
 */
const FAINT_COUNT = { 0: 4200, 1: 3000, 2: 1500, 3: 0 } as const;
const MID_RATIO = 0.16;
const BRIGHT_RATIO = 0.028;
const RADIUS = 180;

/**
 * Each layer follows the camera at a slightly different rate. At 1.0 a layer
 * is pinned at infinity and never moves; below that it drifts as the journey
 * travels. The differences are tiny on purpose — this is the parallax you
 * feel rather than see, and it is what stops the sky reading as a flat
 * backdrop pasted behind the scene.
 */
const FOLLOW = { faint: 0.994, clusters: 0.998, mid: 0.991, bright: 0.988 } as const;

/** A soft round point, generated rather than downloaded. */
function makeStarTexture(): THREE.Texture {
  const size = 64;
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
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Distant clusters — very faint stars gathered into a handful of loose
 * regions rather than spread evenly. This is what gives the sky structure and
 * makes the emptiness read as depth instead of as a flat scatter. Kept dim
 * enough that no cluster ever becomes a subject.
 */
function buildClusters(count: number, seedStart: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  let seed = seedStart;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // A few anchor directions; stars gather loosely around them.
  const anchors = Array.from({ length: 6 }, () => {
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    return [r * Math.cos(theta), u, r * Math.sin(theta)] as const;
  });

  const colour = new THREE.Color();
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const anchor = anchors[i % anchors.length];
    // Gaussian-ish spread around the anchor, then re-projected to the shell.
    const spread = 0.34;
    v.set(
      anchor[0] + (random() + random() + random() - 1.5) * spread,
      anchor[1] + (random() + random() + random() - 1.5) * spread,
      anchor[2] + (random() + random() + random() - 1.5) * spread,
    )
      .normalize()
      .multiplyScalar(RADIUS * 1.08);

    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;

    colour.setHSL(random() > 0.5 ? 0.09 : 0.58, 0.04, 0.3 + random() * 0.2);
    colors[i * 3] = colour.r;
    colors[i * 3 + 1] = colour.g;
    colors[i * 3 + 2] = colour.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function buildCloud(count: number, seedStart: number, bright: boolean) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Deterministic — the sky is identical on every visit.
  let seed = seedStart;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const colour = new THREE.Color();
  for (let i = 0; i < count; i++) {
    // Even distribution over the sphere, not clustered at the poles.
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    positions[i * 3] = RADIUS * r * Math.cos(theta);
    positions[i * 3 + 1] = RADIUS * u;
    positions[i * 3 + 2] = RADIUS * r * Math.sin(theta);

    // Starlight runs warm-white to cool-white. Nothing saturated.
    const magnitude = random();
    colour.setHSL(
      random() > 0.5 ? 0.09 : 0.58,
      bright ? 0.09 : 0.045,
      bright ? 0.9 + magnitude * 0.1 : 0.5 + magnitude * 0.36,
    );
    colors[i * 3] = colour.r;
    colors[i * 3 + 1] = colour.g;
    colors[i * 3 + 2] = colour.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function Starfield() {
  const faintRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const clusterRef = useRef<THREE.Points>(null);
  const brightRef = useRef<THREE.Points>(null);
  const camera = useThree((s) => s.camera);
  const tier = usePerformanceTier();
  const faintCount = FAINT_COUNT[tier];
  const midCount = Math.round(faintCount * MID_RATIO);
  const brightCount = Math.round(faintCount * BRIGHT_RATIO);

  const {
    faint,
    mid,
    bright,
    clusters,
    faintMaterial,
    midMaterial,
    brightMaterial,
    clusterMaterial,
  } = useMemo(() => {
    const texture = makeStarTexture();
    const base = {
      map: texture,
      vertexColors: true,
      sizeAttenuation: false,
      transparent: true,
      depthWrite: false,
      // Normal blending, not additive: additive stars bloom into a haze and
      // stop reading as points.
      blending: THREE.NormalBlending,
      fog: false,
    } as const;

      // Four magnitude classes rather than two, so no two stars in a
      // neighbourhood look identical and the field reads as naturally
      // distributed rather than as scattered identical dots.
      return {
        faint: buildCloud(faintCount, 20260908, false),
        mid: buildCloud(midCount, 3390117, false),
        bright: buildCloud(brightCount, 771133, true),
        clusters: buildClusters(Math.round(faintCount * 0.85), 5150231),
        faintMaterial: new THREE.PointsMaterial({ ...base, size: 1.25, opacity: 0.8 }),
        midMaterial: new THREE.PointsMaterial({ ...base, size: 1.9, opacity: 0.92 }),
        brightMaterial: new THREE.PointsMaterial({ ...base, size: 3.2, opacity: 1 }),
        clusterMaterial: new THREE.PointsMaterial({ ...base, size: 0.8, opacity: 0.6 }),
      };
    }, [faintCount, midCount, brightCount]);

  useFrame(() => {
    const p = camera.position;
    if (faintRef.current)
      faintRef.current.position.set(
        p.x * FOLLOW.faint,
        p.y * FOLLOW.faint,
        p.z * FOLLOW.faint,
      );
    if (clusterRef.current)
      clusterRef.current.position.set(
        p.x * FOLLOW.clusters,
        p.y * FOLLOW.clusters,
        p.z * FOLLOW.clusters,
      );
    if (midRef.current)
      midRef.current.position.set(
        p.x * FOLLOW.mid,
        p.y * FOLLOW.mid,
        p.z * FOLLOW.mid,
      );
    if (brightRef.current)
      brightRef.current.position.set(
        p.x * FOLLOW.bright,
        p.y * FOLLOW.bright,
        p.z * FOLLOW.bright,
      );
  });

  if (!faintCount) return null;

  return (
    <group renderOrder={-1}>
      <points
        ref={faintRef}
        geometry={faint}
        material={faintMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
      <points
        ref={clusterRef}
        geometry={clusters}
        material={clusterMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
      <points
        ref={midRef}
        geometry={mid}
        material={midMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
      <points
        ref={brightRef}
        geometry={bright}
        material={brightMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
    </group>
  );
}
