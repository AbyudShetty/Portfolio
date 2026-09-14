"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const ENDURANCE_URL = "/models/endurance.glb";

/**
 * Endurance — the real model, not an approximation.
 *
 * Findings from inspecting the source GLB (Blender glTF I/O v4.5.49, 492
 * nodes, 310 meshes, 52 materials, 254,248 triangles). The served file is
 * built from it by `scripts/build-endurance.sh`, which bakes the transforms
 * and merges primitives by material — 310 draw calls become 25, with the
 * geometry, the model-space coordinates below and the look unchanged:
 *
 *   The ring lies in the model's YZ plane, so its rotation axis is **X**.
 *   The whole craft measures 87.4 × 87.4 across the ring and 45.1 along the
 *   axis, which at roughly one unit per metre matches the real Endurance.
 *
 *   Twelve modules sit at radius ~35.3 on the ring, spaced 30° apart:
 *   Command, Lab, Habitation ×2, Engine ×4 and **Pod ×4**. Twelve Connector
 *   segments join them, and a single DockingHub fills the centre.
 *
 *   Every group node has an identity transform — the geometry is baked in
 *   place — so a module's position has to be read from its bounded geometry
 *   rather than from `node.position`, which is the origin for all of them.
 *
 * No node in the file is named "Ranger". The four `Pod` groups are the only
 * craft-shaped modules — they are the ones carrying cockpit glass (`Glass1`)
 * and running lights, and they are mounted to the ring beside the central
 * structure. One of them is therefore what the tether attaches to, and this
 * component publishes that attachment as a live transform.
 */

/**
 * The ring is 87.4 units across against a ~2.5-unit astronaut. Held at true
 * scale it would be 35× the figure and could never share a frame with it, so
 * it is compressed to 0.32 — a 28-unit ring, still an unmistakable 11× the
 * astronaut, and readable in a single shot.
 */
export const ENDURANCE_SCALE = 0.32;

/**
 * Baked geometry centre of `Pod.001`, measured by decoding the file rather
 * than guessed — the group node's own transform is the identity, so this had
 * to come from the bounded geometry. It survives the merge above untouched:
 * flattening bakes transforms into geometry without moving it, and the served
 * model's bounding box still matches the source's to five decimal places. The anchor is pulled 7.2 units
 * back toward the hub so the cable leaves the module's inboard structural
 * face rather than its middle.
 */
const POD_CENTRE = new THREE.Vector3(-0.09, 30.8, 17.8);
const RING_CENTRE = new THREE.Vector3(0, 0, 0);
const ANCHOR_INSET = 7.2;

/** Ring radius in world units, for anything routing around the structure. */
export const ENDURANCE_RING_RADIUS = 35.3 * ENDURANCE_SCALE;

/**
 * How far the structure reaches from the hub, in world units: the model's
 * measured half-extent across the ring (±43.68), which includes the modules
 * standing proud of the ring line. The axial half-length is only 22.6, so a
 * sphere of this radius contains the whole craft at any spin angle.
 */
export const ENDURANCE_EXTENT_RADIUS = 43.7 * ENDURANCE_SCALE;

/**
 * Radial rotation, in radians per second. Independent of scroll: scroll says
 * where the craft is, time says where the ring has turned to. At ~1.9°/s a
 * full revolution takes just over three minutes — read for a few seconds and
 * you see it turning, glance at it and it simply sits there.
 *
 * Slowed from 3.2°/s in this pass because the tether hangs off a point on the
 * ring: the faster the ring turns, the faster that anchor sweeps, and the
 * more the cable has to reel in and out to keep up.
 */
const RING_SPEED = 0.034;

/** A cinematic three-quarter view: the ring axis tilted toward the camera. */
const BASE_ORIENTATION = new THREE.Euler(0.3, -0.96, 0.16, "YXZ");

export function Endurance({
  anchorRef,
  paused = false,
}: {
  /** Receives an object parented to the ring, at the Ranger's hardpoint. */
  anchorRef?: React.Ref<THREE.Object3D>;
  paused?: boolean;
}) {
  const spin = useRef<THREE.Group>(null);
  // useDraco false, useMeshopt true: the served file is meshopt-compressed
  // and quantised (21.0MB → 2.87MB) with its hierarchy deliberately intact.
  const { scene } = useGLTF(ENDURANCE_URL, false, true);

  // The cache hands back one shared scene; cloning keeps this component from
  // mutating it and lets materials stay shared by reference.
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      // The craft is lit by the scene's existing rig — nothing here emits.
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      // The model ships with its own PBR materials; they only need to be
      // told how strongly to answer this scene's environment.
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        if (standard.isMeshStandardMaterial) standard.envMapIntensity = 1.1;
      }
    });
  }, [model]);

  /** The Ranger hardpoint, in the ring's own frame. */
  const anchorPosition = useMemo(() => {
    const inward = RING_CENTRE.clone().sub(POD_CENTRE).normalize();
    return POD_CENTRE.clone()
      .addScaledVector(inward, ANCHOR_INSET)
      .multiplyScalar(ENDURANCE_SCALE);
  }, []);

  useFrame((_, delta) => {
    if (paused || !spin.current) return;
    // Rotation is a function of elapsed time, never of scroll position, so
    // the craft keeps turning while it is being carried through the scene.
    spin.current.rotation.x += RING_SPEED * Math.min(delta, 1 / 30);
  });

  return (
    <group rotation={BASE_ORIENTATION}>
      <group ref={spin}>
        <primitive object={model} scale={ENDURANCE_SCALE} />
        {/* Parented inside the spinning ring, so the tether's endpoint
            follows the Ranger around as the craft rotates. */}
        <object3D ref={anchorRef} position={anchorPosition} />
      </group>
    </group>
  );
}

useGLTF.preload(ENDURANCE_URL, false, true);
