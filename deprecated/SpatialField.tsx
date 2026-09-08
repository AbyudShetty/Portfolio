"use client";

import { Canvas, advance } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import {
  CAMERA_FOV,
  CAMERA_MARKS,
  ENVIRONMENT,
  FIELD,
} from "@/lib/design-tokens";
import {
  attachPointerTracking,
  fieldActions,
  useFieldSelector,
} from "@/hooks/useFieldState";
import { PerformanceProvider } from "@/hooks/usePerformanceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ExperienceAnchor } from "@/experience/ExperienceAnchor";
import { ProjectObject } from "@/projects/ProjectObject";
import { PROJECT_OBJECTS, PROJECTS_BY_IMPORTANCE } from "@/projects/ProjectData";
import { getCoordinate } from "@/projects/projectCoordinates";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { PostChain } from "./PostChain";
import { ReferenceGrid } from "./ReferenceGrid";

/** Entrance stagger, ordered by importance — 60ms apart (DESIGN.md §6.3). */
const STAGGER = 0.06;
const CALIBRATION_MS = 1800;

function entranceDelayFor(id: string): number {
  const index = PROJECTS_BY_IMPORTANCE.findIndex((p) => p.id === id);
  return 0.25 + Math.max(index, 0) * STAGGER;
}

function FieldContents({ reducedMotion }: { reducedMotion: boolean }) {
  const calibrated = useFieldSelector((s) => s.calibrated);

  return (
    <>
      <color attach="background" args={[ENVIRONMENT.graphite900]} />
      {/* Distance is communicated by loss of contrast, not by dimming a glow. */}
      <fog attach="fog" args={[ENVIRONMENT.graphite900, FIELD.fogNear, FIELD.fogFar]} />

      <Lighting />
      <CameraRig reducedMotion={reducedMotion} />
      <ReferenceGrid reducedMotion={reducedMotion} calibrating={!calibrated} />

      <ExperienceAnchor
        reducedMotion={reducedMotion}
        entranceDelay={entranceDelayFor("slimevr")}
      />

      {PROJECT_OBJECTS.map((record) => (
        <ProjectObject
          key={record.id}
          record={record}
          coordinate={getCoordinate(record.id)}
          entranceDelay={entranceDelayFor(record.id)}
          reducedMotion={reducedMotion}
        />
      ))}

      <PostChain />
    </>
  );
}

/**
 * SpatialField — the WebGL root.
 *
 * One canvas for the whole site (§12.1). It is paused when the document is
 * hidden, capped at a sane device pixel ratio, and everything inside it is
 * aria-hidden: the semantic content lives in the DOM layer beside it, so the
 * field is never the only route to the information (§12.2).
 */
export function SpatialField() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => attachPointerTracking(), []);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      fieldActions.setCalibrated(true);
      return;
    }
    const timer = window.setTimeout(
      () => fieldActions.setCalibrated(true),
      CALIBRATION_MS,
    );
    const skip = () => {
      window.clearTimeout(timer);
      fieldActions.setCalibrated(true);
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [reducedMotion]);

  const glSettings = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance" as const,
    }),
    [],
  );

  return (
    // The dimensions are inline rather than left to the stylesheet: R3F
    // measures its container on mount, and in dev the CSS can land after that
    // first measurement, leaving the canvas stuck at its 300×150 default.
    <div
      className="field-canvas"
      style={{ width: "100vw", height: "100dvh" }}
      aria-hidden="true"
    >
      <PerformanceProvider>
        <Canvas
          // Paused as "demand" rather than "never": a tab that loads while
          // hidden must still initialise, otherwise the field is blank when
          // the user finally switches to it. Demand renders only on change,
          // so a hidden tab still costs nothing.
          frameloop={visible ? "always" : "demand"}
          dpr={[1, 1.75]}
          gl={glSettings}
          camera={{
            fov: CAMERA_FOV,
            near: 0.1,
            far: 120,
            position: CAMERA_MARKS.field.position,
          }}
          onCreated={({ gl, scene, camera }) => {
            if (process.env.NODE_ENV !== "production") {
              // Dev-only handle. Lets frames be stepped by hand when the
              // browser has parked requestAnimationFrame (a backgrounded
              // window), which is the only way to inspect the field under
              // automation. Never present in a production build.
              (window as unknown as Record<string, unknown>).__field = {
                gl,
                scene,
                camera,
                advance,
              };
            }
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            // Held at 1.0 rather than lifted: the readability gain comes from
            // reflection, not exposure. Raising exposure would lift the
            // graphite ground too and flatten the contrast it provides.
            gl.toneMappingExposure = 1.0;
            // Transmission renders the scene to an offscreen buffer; halving
            // its resolution is the single biggest saving available here and
            // is invisible at these roughness values.
            (gl as THREE.WebGLRenderer & {
              transmissionResolutionScale?: number;
            }).transmissionResolutionScale = 0.5;
            scene.background = new THREE.Color(ENVIRONMENT.graphite900);
          }}
          onPointerMissed={() => fieldActions.select(null)}
        >
          <FieldContents reducedMotion={reducedMotion} />
        </Canvas>
      </PerformanceProvider>
    </div>
  );
}
