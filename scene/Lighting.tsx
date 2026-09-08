"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { LIGHTING } from "@/lib/design-tokens";

/**
 * Lighting — one studio, physically consistent (DESIGN.md §5).
 *
 * A cool key with a low warm bounce from below is what separates "premium
 * industrial" from "dark website". Objects do not emit light; only the
 * selected object gets a faint internal emissive, handled in the object
 * itself at ≤0.20 intensity.
 *
 * The environment is built from lightformers rather than a downloaded HDRI:
 * refraction needs something to refract, but §12.1 budgets no room for a 1MB
 * texture, and baking it with frames={1} means it costs one render, once.
 */
export function Lighting() {
  return (
    <>
      <directionalLight
        color={LIGHTING.keyColor}
        intensity={LIGHTING.keyIntensity}
        position={LIGHTING.keyPosition}
      />

      <hemisphereLight
        color={LIGHTING.fillSky}
        groundColor={LIGHTING.fillGround}
        intensity={LIGHTING.fillIntensity}
      />

      {/* The warm bounce. Do not remove this to save a light — it is the
          entire reason the graphite reads as a material and not as #111. */}
      <pointLight
        color={LIGHTING.bounceColor}
        intensity={LIGHTING.bounceIntensity}
        position={LIGHTING.bouncePosition}
        distance={LIGHTING.bounceDistance}
        decay={LIGHTING.bounceDecay}
      />

      <directionalLight
        color={LIGHTING.rimColor}
        intensity={LIGHTING.rimIntensity}
        position={LIGHTING.rimPosition}
      />

      {/*
        The studio. This is where the objects actually become legible: a dark
        transmissive solid on a graphite ground has almost no diffuse response,
        so its form is read entirely from reflected sources. The rig is the
        standard one for photographing dark glass — a large key softbox, a
        broad overhead, and two narrow vertical strips that run down the left
        and right flanks to draw the silhouette edge.

        Baked once (frames={1}), so the resolution bump costs a single render.
      */}
      <Environment resolution={512} frames={1} background={false}>
        {/* Key softbox, upper left — matches the direct key's direction. */}
        <Lightformer
          form="rect"
          intensity={5}
          color={LIGHTING.keyColor}
          position={[-6, 5, 4]}
          rotation={[0, Math.PI / 5, 0]}
          scale={[14, 10, 1]}
        />

        {/* Broad overhead. Gives the lenses and the monolith a top highlight
            that reads as a horizon across their upper surface. */}
        <Lightformer
          form="rect"
          intensity={3.2}
          color={LIGHTING.softboxColor}
          position={[0, 10, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[18, 14, 1]}
        />

        {/* Left flank strip — the long specular line down the edge. */}
        <Lightformer
          form="rect"
          intensity={7}
          color={LIGHTING.stripColor}
          position={[-9, 2.5, 5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 9, 1]}
        />

        {/* Right flank strip, slightly weaker so the lighting stays directional
            rather than symmetrical. */}
        <Lightformer
          form="rect"
          intensity={5}
          color={LIGHTING.stripColor}
          position={[9, 2.5, 5]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[5, 8, 1]}
        />

        {/* Rim behind, for contour separation from the background. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color={LIGHTING.rimColor}
          position={[4, 6, -12]}
          rotation={[0, Math.PI, 0]}
          scale={[14, 7, 1]}
        />

        {/* Warm floor bounce, kept low — the temperature contrast, not a light. */}
        <Lightformer
          form="rect"
          intensity={0.9}
          color={LIGHTING.bounceColor}
          position={[6, -4, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[16, 10, 1]}
        />
      </Environment>
    </>
  );
}
