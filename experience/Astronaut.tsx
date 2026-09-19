"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useWarmUp } from "@/scene/warmup";

/**
 * Astronaut — the real model, replacing the procedural figure.
 *
 * Findings from inspecting the source GLB (assets/astronaut-source.glb,
 * Blender glTF I/O v4.3.47): a single 35,312-triangle mesh with one PBR
 * material and 2048px base colour, normal and metal/rough textures. Its node
 * carries a +90° X rotation (Blender is Z-up), so in scene space the figure
 * stands 1.907 units tall with its origin at the feet. It faces +Z — the head,
 * visor and boot toes all reach further forward than back — which is the same
 * convention the procedural figure used, so no turn is needed. There is no
 * backpack node, so the tether socket below is derived from the geometry.
 *
 * Served compressed from public/models/astronaut.glb: textures resized to
 * 1024px (the figure never covers more than ~40% of the frame height), WebP,
 * and meshopt — 8.56MB → 434KB.
 */

export const ASTRONAUT_URL = "/models/astronaut.glb";

/**
 * The figure's resting pose inside its group: turned away and tipped. The
 * model faces +Z (its pack, and the tether socket on it, is at -Z).
 */
export const ASTRONAUT_POSE: [number, number, number] = [0.2, -0.5, 0.14];

/** The model's own height, measured in scene space. */
const MODEL_HEIGHT = 1.907;

/**
 * Matched to the figure it replaces — 2.25 units tall with its feet at
 * −0.91 — so ASTRONAUT_SCALE, the hold position and the exit in
 * ExperienceComposition keep meaning exactly what they meant before.
 */
const FIGURE_HEIGHT = 2.25;
const FEET_Y = -0.91;
const MODEL_SCALE = FIGURE_HEIGHT / MODEL_HEIGHT;

/** The middle of the helmet, above the figure's origin (unscaled). */
export const ASTRONAUT_HEAD_Y = FEET_Y + 0.88 * FIGURE_HEIGHT;

/**
 * The tether socket, on the back.
 *
 * Read from the vertices: at 1.06 up the model — 55.6% of its height, the
 * same relative height the procedural pack's connector sat at — the back
 * surface on the spine is at z −0.304. The socket sits just inside that
 * (−0.29), so the cable meets the suit rather than floating off it or
 * emerging through the chest. In the figure's frame that lands at y 0.34,
 * where the old socket was, so the cable's routing is unchanged.
 */
const SOCKET: [number, number, number] = [
  0,
  FEET_Y + 1.06 * MODEL_SCALE,
  -0.29 * MODEL_SCALE,
];

export function Astronaut({
  socketRef,
}: {
  /** Receives the pack's tether socket so the cable can track it. */
  socketRef?: React.Ref<THREE.Object3D>;
}) {
  // useDraco false, useMeshopt true: the served file is meshopt-compressed.
  const { scene } = useGLTF(ASTRONAUT_URL, false, true);
  // The loader cache hands back one shared scene; clone so this component
  // never mutates it.
  const model = useMemo(() => scene.clone(true), [scene]);
  // Ready before the Experience: compiled and uploaded during the landing.
  const figure = useRef<THREE.Group>(null);
  useWarmUp(figure, 600);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        // Lit by the scene's own studio rather than whatever it was exported
        // under; the suit should answer the same environment as the craft.
        if (standard.isMeshStandardMaterial) standard.envMapIntensity = 1.1;
      }
    });
  }, [model]);

  return (
    // Posed once: turned away and tipped, the way a body drifts when nothing
    // is holding it. The same pose the procedural figure held.
    <group ref={figure} rotation={ASTRONAUT_POSE}>
      <primitive object={model} scale={MODEL_SCALE} position={[0, FEET_Y, 0]} />

      {/*
        An empty transform rather than geometry: the cable needs the socket's
        world position every frame, and parenting it here means it inherits
        the figure's pose and scale for free.
      */}
      <object3D ref={socketRef} position={SOCKET} />
    </group>
  );
}

useGLTF.preload(ASTRONAUT_URL, false, true);
