import * as THREE from "three";

/**
 * fade — opacity for a loaded model, without losing what it was authored as.
 *
 * Models arrive with their own materials, some already transparent (a visor,
 * glass). A fader records each material's authored transparency and opacity
 * the first time it sees the model, then scales opacity by the fade and only
 * switches a material to transparent while it is actually fading — so at
 * full presence everything renders exactly as authored, on its original
 * shader program.
 */
interface FadeEntry {
  material: THREE.Material;
  transparent: boolean;
  opacity: number;
}

export function createFader() {
  let entries: FadeEntry[] | null = null;
  let current = 1;

  return (root: THREE.Object3D, value: number) => {
    if (!entries) {
      const found: FadeEntry[] = [];
      root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        const own = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of own) {
          if (found.some((entry) => entry.material === material)) continue;
          found.push({
            material,
            transparent: material.transparent,
            opacity: material.opacity,
          });
        }
      });
      // Not loaded yet: try again next frame.
      if (found.length === 0) return;
      entries = found;
      current = 1;
    }
    if (Math.abs(value - current) < 0.001) return;
    const fading = value < 0.999;
    for (const entry of entries) {
      const transparent = entry.transparent || fading;
      if (entry.material.transparent !== transparent) {
        entry.material.transparent = transparent;
        entry.material.needsUpdate = true;
      }
      entry.material.opacity = entry.opacity * value;
    }
    current = value;
  };
}
