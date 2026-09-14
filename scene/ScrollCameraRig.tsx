"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { damp } from "@/lib/spring";
import { pointer, readout } from "@/hooks/useFieldState";
import { useFrameReporter } from "@/hooks/usePerformanceTier";
import { cameraSnap, scroll } from "@/hooks/useScrollProgress";
import {
  STATIC_FRAME_PROGRESS,
  sampleCamera,
} from "./cameraChoreography";

const _target = new THREE.Vector3();

/**
 * ScrollCameraRig — the camera is driven by where the page is, nothing else.
 *
 * There is no free navigation: no drag, no wheel dolly, no orbit, no flight.
 * Scroll position samples the choreography, and the result is damped so that
 * a fast scroll reads as a heavy camera catching up rather than as a jump cut.
 * That damping is the only thing standing between "travelling through space"
 * and "a background animation scrubbing".
 *
 * The pointer contributes a few hundredths of a unit of parallax and nothing
 * more — enough for the frame to feel alive, far too little to navigate with.
 */
export function ScrollCameraRig({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const reportFrame = useFrameReporter();
  const current = useRef({
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    initialised: false,
  });

  useFrame((_, delta) => {
    reportFrame(delta);

    // Reduced motion holds one composed frame rather than travelling (§6.3).
    const progress = reducedMotion ? STATIC_FRAME_PROGRESS : scroll.progress;
    const sampled = sampleCamera(progress);
    const state = current.current;
    if (cameraSnap.pending) {
      cameraSnap.pending = false;
      state.initialised = false;
    }

    if (!state.initialised || reducedMotion) {
      state.position.set(...sampled.position);
      state.target.set(...sampled.target);
      state.initialised = true;
    } else {
      // Lambda kept low: the camera should feel like mass on rails.
      state.position.set(
        damp(state.position.x, sampled.position[0], 3.4, delta),
        damp(state.position.y, sampled.position[1], 3.4, delta),
        damp(state.position.z, sampled.position[2], 3.4, delta),
      );
      state.target.set(
        damp(state.target.x, sampled.target[0], 3.8, delta),
        damp(state.target.y, sampled.target[1], 3.8, delta),
        damp(state.target.z, sampled.target[2], 3.8, delta),
      );
    }

    const parallaxX = reducedMotion ? 0 : pointer.nx * 0.16;
    const parallaxY = reducedMotion ? 0 : pointer.ny * 0.09;

    camera.position.set(
      state.position.x + parallaxX,
      state.position.y + parallaxY,
      state.position.z,
    );
    _target.copy(state.target);
    camera.lookAt(_target);

    // The rail prints the section unless the pointer is engaging an object.
    if (!readout.objectCode) {
      readout.code = scroll.active.toUpperCase();
      readout.coordinate = `${(progress * 100).toFixed(1)}%`;
    }
  });

  return null;
}
