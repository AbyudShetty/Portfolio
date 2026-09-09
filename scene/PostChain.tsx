"use client";

import {
  Bloom,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

import { useMountTier } from "@/hooks/usePerformanceTier";

/**
 * PostChain — restrained, and the first thing to go when frames get tight.
 *
 * DESIGN.md §5: bloom threshold ≥0.9 and intensity ≤0.25, so it only ever
 * catches the top edge of glass and the signal accent. If bloom is visible on
 * flat surfaces it is too strong. Vignette ≤0.25 — it frames the instrument;
 * anything heavier is a filter.
 *
 * Grain is deliberately *not* here. §5 rule 7 wants it over the whole image to
 * unify the WebGL and DOM layers, and §14 rule 9 allows exactly one looping
 * animation on the site — which is the live-status pulse, not animated noise.
 * It is therefore a static CSS overlay above both layers instead.
 *
 * Depth of field is deferred: transmissive materials and DOF interact badly,
 * and the field reads with more clarity without it. Noted as a deviation.
 */
export function PostChain() {
  // Frozen at mount. Bloom is what gives the bright stars their glow, so
  // unmounting the chain part-way through a scroll puts the sky visibly out —
  // which reads as stars going missing, not as a frame being saved.
  const tier = useMountTier();

  // A machine already struggling at mount never gets the chain at all.
  if (tier >= 1) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Pulled down from 0.25 now that the studio produces real specular
          highlights — the same bloom over brighter speculars would read as
          halos, which is the opposite of the intended look. */}
      <Bloom
        intensity={0.16}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.2}
        radius={0.35}
        mipmapBlur
      />
      <Vignette
        offset={0.32}
        darkness={0.25}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
