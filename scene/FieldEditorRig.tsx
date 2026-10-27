"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { fieldActions, getFieldState } from "@/hooks/useFieldState";
import { scroll } from "@/hooks/useScrollProgress";
import { PROJECT_OBJECTS } from "@/projects/ProjectData";
import { PEBBLE_RADIUS } from "@/projects/fieldCheck";
import {
  fieldEditor,
  publishEditor,
  snapshot,
  undo,
  type DragMode,
} from "@/projects/fieldEditor";
import { SCROLL_VH } from "./cameraChoreography";

/**
 * FieldEditorRig — the hands of the layout mode.
 *
 * Development only, and mounted only while the mode is open. It parks the
 * camera on one of the field's own shots, catches the pointer on an
 * invisible ground plane, and turns drags into placements. Nothing here
 * re-renders: the drag writes straight into `fieldEditor.layout`, which the
 * stones read in their own loop (projects/ProjectObject).
 *
 * Drafting is done with the mouse and finished with the keyboard — drag a
 * stone roughly where it belongs, then nudge it a hundredth at a time.
 *
 *   drag            move across the ground
 *   shift + drag    swing round the middle of the cluster, keeping its radius
 *   alt + drag      turn the stone on its own axis
 *   wheel           size
 *   arrows          nudge, with shift for a coarse step
 *   [ and ]         size, , and . turn
 *   ctrl + arrows   swing the whole cluster round its middle
 *   z               undo, escape deselects
 */

/** Where the cluster turns about, and what orbiting is measured from. */
const CENTRE = new THREE.Vector3(0, 0, -25.6);
const NUDGE = 0.08;
const COARSE = 0.4;
const SIZE_STEP = 0.02;
const TURN_STEP = Math.PI / 60;

export function FieldEditorRig() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const selection = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const orbitRing = useRef<THREE.Line>(null);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const drag = useRef<{
    id: string;
    mode: DragMode;
    grabX: number;
    grabZ: number;
    fromX: number;
    fromZ: number;
    fromScale: number;
    fromSpin: number;
    pointerX: number;
  } | null>(null);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);

  /* The camera is parked on the chosen shot for as long as the mode is open. */
  useFrame(() => {
    scroll.progress = fieldEditor.shotVh / SCROLL_VH;

    const id = fieldEditor.selectedId;
    const group = selection.current;
    if (!group) return;
    const placement = id ? fieldEditor.layout[id] : undefined;
    group.visible = Boolean(placement);
    const ringGroup = orbit.current;
    if (ringGroup) ringGroup.visible = Boolean(placement);
    if (!placement) return;
    group.position.set(placement.x, 0.06, placement.z);
    const r = PEBBLE_RADIUS * placement.scale;
    group.scale.setScalar(r);

    // The path this stone would take swinging round the middle.
    const ring = orbitRing.current;
    if (ring) {
      const radius = Math.hypot(placement.x - CENTRE.x, placement.z - CENTRE.z);
      ring.scale.setScalar(Math.max(0.01, radius));
    }
  });

  /** Where the pointer meets the ground. */
  const ground = (e: ThreeEvent<PointerEvent>) => {
    const rect = gl.domElement.getBoundingClientRect();
    ray.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      ),
      camera,
    );
    return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null;
  };

  /** Which stone is under the pointer, by distance on the ground. */
  const stoneAt = (point: THREE.Vector3): string | null => {
    let best: string | null = null;
    let bestDistance = Infinity;
    for (const record of PROJECT_OBJECTS) {
      const p = fieldEditor.layout[record.id];
      if (!p) continue;
      const d = Math.hypot(point.x - p.x, point.z - p.z);
      if (d < PEBBLE_RADIUS * p.scale * 1.15 && d < bestDistance) {
        bestDistance = d;
        best = record.id;
      }
    }
    return best;
  };

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (getFieldState().selectedId) return;   // one is open at the lens
    const point = ground(e);
    if (!point) return;
    const id = stoneAt(point);
    if (id !== fieldEditor.selectedId) {
      fieldEditor.selectedId = id;
      publishEditor();
    }
    if (!id) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = fieldEditor.layout[id];
    snapshot();
    drag.current = {
      id,
      mode: e.altKey ? "spin" : e.shiftKey ? "orbit" : "move",
      grabX: point.x,
      grabZ: point.z,
      fromX: p.x,
      fromZ: p.z,
      fromScale: p.scale,
      fromSpin: p.spin,
      pointerX: e.clientX,
    };
    fieldEditor.dragging = true;
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const state = drag.current;
    if (!state) return;
    const p = fieldEditor.layout[state.id];
    if (state.mode === "spin") {
      p.spin = state.fromSpin + (e.clientX - state.pointerX) * 0.01;
      fieldEditor.dirty = true;
      return;
    }
    const point = ground(e);
    if (!point) return;
    if (state.mode === "orbit") {
      // Keep the stone's distance from the middle; follow the pointer round.
      const radius = Math.hypot(state.fromX - CENTRE.x, state.fromZ - CENTRE.z);
      const angle = Math.atan2(point.z - CENTRE.z, point.x - CENTRE.x);
      p.x = CENTRE.x + Math.cos(angle) * radius;
      p.z = CENTRE.z + Math.sin(angle) * radius;
    } else {
      p.x = state.fromX + (point.x - state.grabX);
      p.z = state.fromZ + (point.z - state.grabZ);
    }
    fieldEditor.dirty = true;
  };

  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    fieldEditor.dragging = false;
    publishEditor();
  };

  /* Double-click opens a stone at the lens, to read it as a visitor would. */
  useEffect(() => {
    const el = gl.domElement;
    const onDouble = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        ),
        camera,
      );
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const id = stoneAt(hit);
      if (!id) return;
      // Hold it in the panel as well, so its numbers and a way back are there.
      fieldEditor.selectedId = id;
      fieldActions.select(id);
      publishEditor();
    };
    el.addEventListener("dblclick", onDouble);
    return () => el.removeEventListener("dblclick", onDouble);
  });

  /* Wheel sizes the selected stone; the page does not scroll in this mode. */
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      const id = fieldEditor.selectedId;
      if (!id) return;
      e.preventDefault();
      const p = fieldEditor.layout[id];
      p.scale = Math.max(0.3, Math.min(2.2, p.scale - Math.sign(e.deltaY) * SIZE_STEP));
      fieldEditor.dirty = true;
      publishEditor();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [gl]);

  /* The keyboard, for the last hundredth. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const id = fieldEditor.selectedId;
      const step = e.shiftKey ? COARSE : NUDGE;

      if (e.key === "Escape") {
        if (getFieldState().selectedId) {
          fieldActions.select(null);   // put the open stone back first
          return;
        }
        fieldEditor.selectedId = null;
        publishEditor();
        return;
      }
      if (e.key === "z" || e.key === "Z") {
        if (undo()) e.preventDefault();
        return;
      }
      // Ctrl with the arrows swings the whole cluster about its middle.
      if (e.ctrlKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        snapshot();
        const by = (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 0.08 : 0.02);
        for (const record of PROJECT_OBJECTS) {
          const p = fieldEditor.layout[record.id];
          if (!p) continue;
          const dx = p.x - CENTRE.x;
          const dz = p.z - CENTRE.z;
          p.x = CENTRE.x + dx * Math.cos(by) - dz * Math.sin(by);
          p.z = CENTRE.z + dx * Math.sin(by) + dz * Math.cos(by);
        }
        fieldEditor.dirty = true;
        publishEditor();
        return;
      }
      if (!id) return;
      const p = fieldEditor.layout[id];
      let touched = true;
      switch (e.key) {
        case "ArrowLeft": p.x -= step; break;
        case "ArrowRight": p.x += step; break;
        case "ArrowUp": p.z -= step; break;
        case "ArrowDown": p.z += step; break;
        case "[": p.scale = Math.max(0.3, p.scale - SIZE_STEP); break;
        case "]": p.scale = Math.min(2.2, p.scale + SIZE_STEP); break;
        case ",": p.spin -= TURN_STEP; break;
        case ".": p.spin += TURN_STEP; break;
        default: touched = false;
      }
      if (touched) {
        e.preventDefault();
        fieldEditor.dirty = true;
        publishEditor();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** One unit circle, reused for the selection ring and the orbit path. */
  const { selectionLine, orbitLine } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return {
      selectionLine: new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: "#E8843C", transparent: true, opacity: 0.95 }),
      ),
      orbitLine: new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: "#6FA8C7", transparent: true, opacity: 0.3 }),
      ),
    };
  }, []);

  return (
    <group>
      {/* The ground, for catching drags. Big enough to cover the field. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -25.6]}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* What is selected, and the path it swings along. */}
      <group ref={selection} visible={false}>
        <primitive object={selectionLine} />
      </group>
      <group ref={orbit} position={[CENTRE.x, 0.04, CENTRE.z]} visible={false}>
        <primitive object={orbitLine} ref={orbitRing} />
      </group>
    </group>
  );
}
