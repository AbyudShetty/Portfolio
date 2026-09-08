"use client";

import { Grid, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { DOMAIN_LABEL, ENVIRONMENT, FIELD } from "@/lib/design-tokens";
import { damp } from "@/lib/spring";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { DOMAIN_MARKERS } from "@/projects/projectCoordinates";

/**
 * ReferenceGrid — the measured plane.
 *
 * This is the backbone of the concept, not decoration: it gives every object a
 * position that means something, and it is what the glass refracts
 * (DESIGN.md §4.3, §13.1). It stays nearly subliminal — thin graphite lines at
 * low opacity, no glow, no colour.
 *
 * Its only permitted motion is the calibration draw-in at load (§10.0),
 * expressed by ramping the grid's fade distance so the plane resolves outward
 * rather than fading in as a flat sheet.
 */
export function ReferenceGrid({
  reducedMotion,
  calibrating,
}: {
  reducedMotion: boolean;
  calibrating: boolean;
}) {
  const gridRef = useRef<THREE.Mesh>(null);
  const tier = usePerformanceTier();
  const maxFade = tier >= 2 ? 42 : 58;
  const fade = useRef(reducedMotion ? maxFade : 2);

  useFrame((_, delta) => {
    const mesh = gridRef.current;
    if (!mesh) return;
    const material = mesh.material as THREE.ShaderMaterial;
    const uniform = material?.uniforms?.fadeDistance;
    if (!uniform) return;

    const target = calibrating && !reducedMotion ? 2 : maxFade;
    fade.current = reducedMotion
      ? target
      : damp(fade.current, target, 1.6, delta);
    uniform.value = fade.current;
  });

  return (
    <group position={[0, FIELD.groundY, 0]}>
      <Grid
        ref={gridRef}
        args={[140, 140]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={ENVIRONMENT.graphite500}
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor={ENVIRONMENT.graphite400}
        fadeDistance={maxFade}
        fadeStrength={1.5}
        followCamera={false}
        infiniteGrid
        side={THREE.DoubleSide}
      />

      {/* Ground-plane domain markers, anchored to their clusters (§10.2). */}
      {DOMAIN_MARKERS.map((marker) => (
        <Html
          key={marker.domain}
          position={[marker.x, 0.02, marker.z]}
          center
          zIndexRange={[6, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
          prepend
        >
          <span className="domain-marker">{DOMAIN_LABEL[marker.domain]}</span>
        </Html>
      ))}
    </group>
  );
}
