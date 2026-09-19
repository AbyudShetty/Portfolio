"use client";

import { Canvas, advance } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { ENVIRONMENT, SPACE } from "@/lib/design-tokens";
import {
  attachPointerTracking,
  fieldActions,
  getFieldState,
} from "@/hooks/useFieldState";
import { PerformanceProvider } from "@/hooks/usePerformanceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scroll } from "@/hooks/useScrollProgress";
import { ExperienceComposition } from "@/experience/ExperienceComposition";
import { EnduranceSequence } from "@/experience/EnduranceSequence";
import { BlackHole } from "@/experience/BlackHole";
import { Tesseract } from "@/experience/Tesseract";
import { ENDING } from "./ending";
import { AtmosphericPebbles } from "@/projects/AtmosphericPebbles";
import { ProjectObject } from "@/projects/ProjectObject";
import { PROJECT_OBJECTS, PROJECTS_BY_IMPORTANCE } from "@/projects/ProjectData";
import {
  getCoordinate,
  scatterDistance,
} from "@/projects/projectCoordinates";
import {
  CAMERA_KEYFRAMES,
  INSPECTION_PROGRESS,
  STATIC_FRAME_PROGRESS,
} from "./cameraChoreography";
import { Constellations } from "./Constellations";
import { Lighting } from "./Lighting";
import { PostChain } from "./PostChain";
import { ScrollCameraRig } from "./ScrollCameraRig";
import { Starfield } from "./Starfield";

/**
 * Arrival order. Specimens emerge by importance, so the world assembles with
 * its most significant pieces first rather than all at once.
 */
function revealStaggerFor(id: string): number {
  const index = PROJECTS_BY_IMPORTANCE.findIndex((p) => p.id === id);
  const total = Math.max(1, PROJECTS_BY_IMPORTANCE.length - 1);
  return Math.max(0, index) / total;
}

/**
 * Gathering order, keyed to how far a specimen has to travel: the outermost
 * set off first, so the cluster forms from the outside in and never looks
 * like it is collapsing toward a point.
 */
function convergeStaggerFor(id: string, maxDistance: number): number {
  const distance = scatterDistance(getCoordinate(id));
  return 1 - Math.min(1, distance / maxDistance);
}

function SceneContents({ reducedMotion }: { reducedMotion: boolean }) {
  const maxScatter = useMemo(
    () =>
      Math.max(
        ...PROJECT_OBJECTS.map((record) =>
          scatterDistance(getCoordinate(record.id)),
        ),
      ),
    [],
  );

  // Whether the pebbles accept the pointer is a property of where the journey
  // has reached, so it is polled rather than held in React state — the scroll
  // position is already outside the render cycle.
  const [interactive, setInteractive] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setInteractive(true);
      return;
    }
    // Driven by the scroll event, not polled through requestAnimationFrame.
    // useScrollProgress avoids rAF for exactly this reason: it stalls whenever
    // the browser parks frames, and a poll that stalls here leaves the field
    // permanently unclickable rather than merely late. Scroll events already
    // fire at most once per frame, and `scroll.progress` is written by the
    // hook's own listener, which is registered first.
    const read = () => {
      const next =
        scroll.progress >= INSPECTION_PROGRESS &&
        scroll.progress < ENDING.interactiveUntil;
      setInteractive((current) => (current === next ? current : next));
      // Inspection is over once the ending starts: a stone left open would
      // otherwise be carried into the black hole with its panel still up.
      if (scroll.progress >= ENDING.interactiveUntil && getFieldState().selectedId) {
        fieldActions.select(null);
      }
      // A stone stops answering the pointer outside this window, so the
      // pointer leaving it never registers: a hover held when the window
      // closes would ride on into the ending (the cursor's ring, the
      // readout). Cleared here instead.
      if (!next && getFieldState().hoveredId) {
        fieldActions.hover(null);
      }
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [reducedMotion]);

  return (
    <>
      <color attach="background" args={[SPACE.background]} />
      {/* Very long-range fog. Space has none, but a slow falloff to the
          background is what lets the outer specimens sit back without
          disappearing — distance as atmosphere, not concealment. */}
      <fog attach="fog" args={[SPACE.background, SPACE.fogNear, SPACE.fogFar]} />

      {/* Background: deep black, stars, and a few faint chart markings.
          No galaxies, no nebulae, nothing cloudy. */}
      <Starfield />
      <Constellations />
      <Lighting />
      <ScrollCameraRig reducedMotion={reducedMotion} />

      <ExperienceComposition reducedMotion={reducedMotion} />

      {/* The Endurance, and the cable that stays attached after it has gone. */}
      <EnduranceSequence reducedMotion={reducedMotion} />

      {/* The ending: traced in a shader, nothing to load. */}
      <BlackHole reducedMotion={reducedMotion} />

      {/* Inside it: the lattice, and the moments that lead back to the start. */}
      <Tesseract reducedMotion={reducedMotion} />

      {/* Class B: distant, soft, unlabelled, non-interactive — and gone by the
          time the field settles, so the portfolio stands alone. */}
      <AtmosphericPebbles reducedMotion={reducedMotion} />

      {PROJECT_OBJECTS.map((record) => (
        <ProjectObject
          key={record.id}
          record={record}
          coordinate={getCoordinate(record.id)}
          revealStagger={revealStaggerFor(record.id)}
          convergeStagger={convergeStaggerFor(record.id, maxScatter)}
          reducedMotion={reducedMotion}
          interactive={interactive}
        />
      ))}

      <PostChain />
    </>
  );
}

/**
 * SpaceScene — one persistent canvas behind the whole document.
 *
 * It is fixed to the viewport and never scrolls; the page scrolls past it and
 * the camera responds. Everything inside is aria-hidden, because the sections
 * in the DOM carry the actual content — the scene is the view through the
 * window, not the record.
 */
export function SpaceScene() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => attachPointerTracking(), []);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Touch devices render a little under full density: the black hole and
  // the glass are per-pixel work, and a phone's 3× screen triples it.
  const coarsePointer = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  const glSettings = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance" as const,
    }),
    [],
  );

  return (
    <div
      className="space-canvas"
      style={{ width: "100vw", height: "100dvh" }}
      aria-hidden="true"
    >
      <PerformanceProvider>
        <Canvas
          // Paused as "demand" rather than "never": a tab that loads while
          // hidden must still initialise, or the scene is blank when the user
          // switches to it. Demand renders only on change, so it still costs
          // nothing in the background.
          frameloop={visible ? "always" : "demand"}
          dpr={coarsePointer ? [1, 1.5] : [1, 1.75]}
          gl={glSettings}
          camera={{
            fov: 42,
            near: 0.1,
            far: 400,
            position: CAMERA_KEYFRAMES[0].position,
          }}
          // Clicking where no stone is puts the open one back. Handled here
          // rather than with a full-bleed overlay: an overlay that catches
          // the click is also an overlay that blocks the eleven other stones,
          // which is precisely the jump this view exists to allow.
          onPointerMissed={() => fieldActions.select(null)}
          onCreated={({ gl, scene, camera }) => {
            if (process.env.NODE_ENV !== "production") {
              // Dev-only handle for stepping frames by hand when the browser
              // has parked requestAnimationFrame. Never in production.
              (window as unknown as Record<string, unknown>).__field = {
                gl,
                scene,
                camera,
                advance,
                scroll,
                fieldActions,
                staticProgress: STATIC_FRAME_PROGRESS,
              };
            }
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            // Full resolution. At 0.5 everything seen *through* a pebble was
            // rendered at half res, which is what made the glass interiors —
            // and therefore the pebbles themselves — look soft. The project
            // field has to stay optically readable, so this is the one place
            // the frame budget is spent rather than saved.
            (gl as THREE.WebGLRenderer & {
              transmissionResolutionScale?: number;
            }).transmissionResolutionScale = 1;
            scene.background = new THREE.Color(SPACE.background);
          }}
        >
          <SceneContents reducedMotion={reducedMotion} />
        </Canvas>
      </PerformanceProvider>
    </div>
  );
}

/** Kept exported so the fallback and the scene agree on the page's ground. */
export const SCENE_BACKGROUND = ENVIRONMENT.graphite900;
