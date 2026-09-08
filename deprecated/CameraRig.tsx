"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { CAMERA_MARKS, FIELD } from "@/lib/design-tokens";
import { Spring3, damp } from "@/lib/spring";
import {
  fieldActions,
  getFieldState,
  pointer,
  readout,
  useFieldSelector,
} from "@/hooks/useFieldState";
import { useFrameReporter } from "@/hooks/usePerformanceTier";
import { COORDINATES, formatCoordinate } from "@/projects/projectCoordinates";
import { getProject } from "@/projects/ProjectData";
import { SELECTED, TIER_PROFILE } from "@/projects/projectMaterials";

const _target = new THREE.Vector3();
const _dir = new THREE.Vector3();

/**
 * CameraRig — a tripod, not a drone (DESIGN.md §14 rule 14).
 *
 * The camera translates deliberately between marked positions and then holds
 * perfectly still. There is no orbiting, no auto-rotation and no idle drift;
 * a camera that never settles is the clearest tell of an amateur WebGL scene.
 *
 * It responds to exactly three inputs: the current view mark, the focused or
 * selected object (keyboard focus frames an object exactly as a click does,
 * §12.4), and a clamped lateral drag so the field can be surveyed but not
 * flown out of (§10.2).
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const reportFrame = useFrameReporter();

  const view = useFieldSelector((s) => s.view);
  const focusedId = useFieldSelector((s) => s.focusedId);
  const selectedId = useFieldSelector((s) => s.selectedId);

  const springs = useMemo(() => {
    const mark = CAMERA_MARKS.field;
    return {
      position: new Spring3(mark.position, {
        stiffness: 90,
        damping: 24,
        mass: 1.5,
      }),
      target: new Spring3(mark.target, {
        stiffness: 90,
        damping: 24,
        mass: 1.5,
      }),
    };
  }, []);

  const pan = useRef({ value: 0, target: 0, dragging: false, lastX: 0 });
  const dolly = useRef({ value: 0, target: 0 });

  // Lateral survey drag. Clamped to ±12 units: you can move along the field,
  // you cannot leave it.
  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pan.current.dragging = true;
      pan.current.lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!pan.current.dragging) return;
      const dx = e.clientX - pan.current.lastX;
      pan.current.lastX = e.clientX;
      pan.current.target = THREE.MathUtils.clamp(
        pan.current.target - dx * 0.022,
        -FIELD.panLimit,
        FIELD.panLimit,
      );
    };
    const onUp = () => {
      pan.current.dragging = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  // Depth travel. Scroll dollies the camera along the view axis so the far
  // band is genuinely reachable rather than merely visible — the range runs
  // past the deepest object and back to the starting mark.
  useEffect(() => {
    const setDolly = (next: number) => {
      dolly.current.target = THREE.MathUtils.clamp(
        next,
        FIELD.dollyMin,
        FIELD.dollyMax,
      );
    };

    const onWheel = (e: WheelEvent) => {
      // Trackpads report far smaller deltas than wheels; normalising by line
      // mode keeps both feeling like the same instrument.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      setDolly(dolly.current.target - e.deltaY * unit * 0.014);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      let handled = true;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        setDolly(dolly.current.target - FIELD.dollyStep);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        setDolly(dolly.current.target + FIELD.dollyStep);
      } else if (e.key === "Home") {
        setDolly(0);
        pan.current.target = 0;
      } else {
        handled = false;
      }
      if (!handled) return;
      e.preventDefault();
      // Depth keys always move you. If an object is currently framing the
      // camera, release it rather than silently ignoring the input.
      const { focusedId: f, selectedId: s } = getFieldState();
      if (f || s) {
        fieldActions.focus(null);
        fieldActions.select(null);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Returning to a mark returns to the start of the field — this is what makes
  // the FIELD and EXPERIENCE dock buttons a reliable way back.
  useEffect(() => {
    dolly.current.target = 0;
    pan.current.target = 0;
  }, [view]);

  useFrame((_, delta) => {
    reportFrame(delta);

    const framedId = selectedId ?? focusedId;
    const framed = framedId ? COORDINATES[framedId] : undefined;
    const record = framedId ? getProject(framedId) : undefined;

    if (framed && record) {
      // Frame the object: hold at the tier's framing distance along the
      // current view axis, then push in slightly if it is selected.
      const mark = view === "experience" ? CAMERA_MARKS.experience : CAMERA_MARKS.field;
      _dir
        .set(
          mark.position[0] - mark.target[0],
          mark.position[1] - mark.target[1],
          mark.position[2] - mark.target[2],
        )
        .normalize();

      const distance =
        TIER_PROFILE[record.tier].framingDistance -
        (selectedId ? SELECTED.cameraPush : 0);

      springs.position.setTarget([
        framed.position[0] + _dir.x * distance,
        framed.position[1] + _dir.y * distance + 0.9,
        framed.position[2] + _dir.z * distance,
      ]);
      springs.target.setTarget([
        framed.position[0],
        framed.position[1],
        framed.position[2],
      ]);
    } else {
      const mark = view === "experience" ? CAMERA_MARKS.experience : CAMERA_MARKS.field;
      const lateral = view === "experience" ? 0 : pan.current.value;
      // Position and target move together, so travelling into the field never
      // changes the view direction — and the horizon stays where it belongs.
      const depth = view === "experience" ? 0 : dolly.current.value;
      springs.position.setTarget([
        mark.position[0] + lateral,
        mark.position[1],
        mark.position[2] + depth,
      ]);
      springs.target.setTarget([
        mark.target[0] + lateral,
        mark.target[1],
        mark.target[2] + depth,
      ]);
    }

    if (reducedMotion) {
      // Reduced motion cuts between marks instead of travelling (§6.3).
      pan.current.value = pan.current.target;
      dolly.current.value = dolly.current.target;
      springs.position.set([
        springs.position.x.target,
        springs.position.y.target,
        springs.position.z.target,
      ]);
      springs.target.set([
        springs.target.x.target,
        springs.target.y.target,
        springs.target.z.target,
      ]);
    } else {
      pan.current.value = damp(pan.current.value, pan.current.target, 4, delta);
      // Restrained damping: depth travel should feel like a heavy stage
      // moving, never like a flick-scroll.
      dolly.current.value = damp(
        dolly.current.value,
        dolly.current.target,
        3.2,
        delta,
      );
      springs.position.step(delta);
      springs.target.step(delta);
    }

    // Pointer parallax — ±8px equivalent, heavily eased, and never applied to
    // the typographic layer (§7.4).
    const parallaxX = reducedMotion ? 0 : pointer.nx * 0.18;
    const parallaxY = reducedMotion ? 0 : pointer.ny * 0.1;

    camera.position.set(
      springs.position.x.value + parallaxX,
      springs.position.y.value + parallaxY,
      springs.position.z.value,
    );
    _target.set(
      springs.target.x.value,
      springs.target.y.value,
      springs.target.z.value,
    );
    camera.lookAt(_target);

    // The rail prints the camera's own position unless an object is engaged.
    if (!readout.objectCode) {
      readout.code = view === "experience" ? "ANCHOR" : "FIELD";
      readout.coordinate = formatCoordinate([
        camera.position.x,
        camera.position.y,
        camera.position.z,
      ]);
    }
  });

  return null;
}
