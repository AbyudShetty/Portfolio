"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import * as THREE from "three";

/**
 * warmup — pay an object's first-frame cost before anyone is looking.
 *
 * Three.js does its heaviest work for an object the first time it draws it:
 * compiling the shader programs its materials need, uploading its textures,
 * uploading its geometry. For the Endurance (a 254k-triangle model with 2K
 * textures) that is a visible hitch on the exact frame it first appears —
 * and every object here spends the landing hidden, so that first frame is
 * always mid-scroll, in front of the reader.
 *
 * So each heavy object is drawn once, early, while the landing is on screen:
 * made visible for one synchronous moment (with its hidden ancestors), its
 * textures uploaded, and the whole scene rendered into a 1×1 offscreen
 * target — with the scene's real lights and the same no-tone-mapping path the
 * post-processing chain renders through, so the programs compiled are the
 * ones the real frames will ask for. Culling is lifted for that one draw so
 * geometry uploads even when the object sits behind the camera. Then every
 * visibility and culling flag goes back exactly as it was, before the next
 * frame: nothing is ever seen.
 */
export function warmUp(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  root: THREE.Object3D,
): void {
  const restore: (() => void)[] = [];

  for (let node: THREE.Object3D | null = root.parent; node; node = node.parent) {
    if (!node.visible) {
      const hidden = node;
      hidden.visible = true;
      restore.push(() => (hidden.visible = false));
    }
  }

  root.traverse((object) => {
    if (!object.visible) {
      object.visible = true;
      restore.push(() => (object.visible = false));
    }
    const drawable = object as THREE.Mesh;
    if (!drawable.isMesh && !(object as THREE.Points).isPoints) return;
    if (object.frustumCulled) {
      object.frustumCulled = false;
      restore.push(() => (object.frustumCulled = true));
    }
    const materials = Array.isArray(drawable.material)
      ? drawable.material
      : [drawable.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value && (value as THREE.Texture).isTexture) {
          gl.initTexture(value as THREE.Texture);
        }
      }
    }
  });

  // Objects that fade in or out (experience/fade.ts) are drawn transparent
  // while they fade, and three.js compiles opaque and transparent materials
  // as different programs — so the transparent variant is compiled here too,
  // with a second draw. Afterwards both sit in the program cache, and the
  // switch mid-fade is a lookup rather than a compile.
  const opaque: THREE.Material[] = [];
  root.traverse((object) => {
    const drawable = object as THREE.Mesh;
    if (!drawable.isMesh) return;
    const materials = Array.isArray(drawable.material)
      ? drawable.material
      : [drawable.material];
    for (const material of materials) {
      if (material && !material.transparent && !opaque.includes(material)) {
        opaque.push(material);
      }
    }
  });

  const target = new THREE.WebGLRenderTarget(1, 1);
  const previous = gl.getRenderTarget();
  try {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    if (opaque.length) {
      for (const material of opaque) {
        material.transparent = true;
        material.needsUpdate = true;
      }
      gl.render(scene, camera);
      for (const material of opaque) {
        material.transparent = false;
        material.needsUpdate = true;
      }
    }
  } finally {
    gl.setRenderTarget(previous);
    target.dispose();
    for (const undo of restore) undo();
  }
}

/**
 * Warms `ref`'s object a little after mount. Delays are staggered between
 * callers so the work spreads over the landing instead of landing on one
 * frame.
 */
export function useWarmUp(
  ref: RefObject<THREE.Object3D | null>,
  delayMs = 400,
): void {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const root = ref.current;
      if (root) warmUp(gl, scene, camera, root);
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [gl, scene, camera, ref, delayMs]);
}
