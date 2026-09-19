"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

import { ENVIRONMENT } from "@/lib/design-tokens";
import { createFader } from "./fade";
import { useWarmUp } from "@/scene/warmup";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { scroll } from "@/hooks/useScrollProgress";
import { progressAt } from "@/scene/cameraChoreography";
import { smoothstep01 } from "@/scene/reveal";
import {
  Endurance,
  ENDURANCE_EXTENT_RADIUS,
  ENDURANCE_RING_RADIUS,
} from "./Endurance";
import {
  anchors,
  CRAFT_ENTER,
  PHASE_A_END,
  STATIC_MOMENT,
  SPAWN_FADE,
  TETHER_FADE,
  windowProgress,
} from "./sequence";
import {
  CRAFT_ENDING_SCALE,
  CRAFT_ENTRY,
  ENDING,
  fallInto,
  windowProgress as endingWindow,
} from "@/scene/ending";

/**
 * EnduranceSequence — the craft, the cable, and the scroll that drives both.
 *
 * Two clocks run at once, and keeping them separate is what makes the craft
 * read as a real object rather than a model being dragged along a path:
 *
 *   scroll → where the Endurance is
 *   time   → how far the ring has turned
 *
 * The cable is the join between them. Its far end is parented inside the
 * rotating ring at a Ranger hardpoint, so as the ring turns the attachment
 * sweeps with it and the tether pays in and out on its own. Neither endpoint
 * is a constant: both are read from the scene graph every frame, which is why
 * the cable meets hardware at both ends with no gap.
 *
 * The whole path stays left of frame centre, so neither the craft nor the
 * cable crosses the Experience typography on the right.
 */

/** Waypoints set the *timing*; the spline through them sets the path. */
const WAYPOINTS: { at: number; position: [number, number, number] }[] = [
  { at: progressAt(0), position: [-48, -36, -104] },
  { at: progressAt(307), position: [-42, -30, -86] },
  { at: progressAt(368), position: [-34, -20, -62] },
  { at: progressAt(443), position: [-27, -11, -44] },
  // The cable begins paying out around here.
  { at: progressAt(484), position: [-22, -5, -34] },
  // Closest approach — the ring fills the upper left at ~40° across.
  { at: progressAt(552), position: [-19, 4, -26] },
  // Climbing away hard, and *backwards*. The camera also rises after 54%, so
  // a purely vertical exit would carry the craft past the lens and make it
  // grow on its way out. Gaining depth as well as height means it recedes as
  // it leaves, which is what a departure is supposed to look like.
  { at: progressAt(620), position: [-18, 26, -26] },
  { at: progressAt(700), position: [-18, 60, -34] },
  { at: progressAt(800), position: [-17, 108, -46] },
  { at: progressAt(960), position: [-16, 190, -60] },
];

/**
 * Cable geometry. The span runs 20–40 units at the connection, so the radius
 * is set by what stays legible at that distance rather than by what would be
 * literal — at 0.18 it reads as roughly a finger's width of cable on screen.
 */
const TUBULAR = 52;
const RADIAL = 10;
const CABLE_RADIUS = 0.18;

const _pos = new THREE.Vector3();
const _ahead = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _normal = new THREE.Vector3();
const _binormal = new THREE.Vector3();
const _prevNormal = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _vertex = new THREE.Vector3();
const _outward = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function SequenceBody({ reducedMotion }: { reducedMotion: boolean }) {
  const carrier = useRef<THREE.Group>(null);
  const rangerAnchor = useRef<THREE.Object3D>(null);
  const tether = useRef<THREE.Mesh>(null);

  /** The flight path as one continuous curve — no kinks at keyframes. */
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        WAYPOINTS.map((w) => new THREE.Vector3(...w.position)),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );

  /** The cable's spline. Its interior points are damped, never set directly. */
  const cable = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        Array.from({ length: 5 }, () => new THREE.Vector3()),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );

  /**
   * A tube built once and rewritten in place. Rebuilding TubeGeometry each
   * frame would allocate several typed arrays sixty times a second; the index
   * buffer never changes, so only positions and normals are recomputed.
   */
  const tubeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertexCount = (TUBULAR + 1) * (RADIAL + 1);
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
    );
    geo.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
    );
    const indices: number[] = [];
    for (let i = 0; i < TUBULAR; i++) {
      for (let j = 0; j < RADIAL; j++) {
        const a = i * (RADIAL + 1) + j;
        const b = (i + 1) * (RADIAL + 1) + j;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    geo.setIndex(indices);
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000);
    return geo;
  }, []);

  const cableMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // Dark graphite, metallic enough to catch the key light and the warm
        // bounce the way a real tether would. Never emissive.
        color: ENVIRONMENT.graphite500,
        roughness: 0.44,
        metalness: 0.7,
        envMapIntensity: 1.25,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  const craftSettled = useRef(false);
  const damped = useRef([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  const settled = useRef(false);
  const fadeCraft = useMemo(() => createFader(), []);
  // Shaders compiled and the model uploaded while the landing is on screen,
  // so the first frame the craft appears in costs nothing extra.
  const root = useRef<THREE.Group>(null);
  useWarmUp(root, 350);

  useFrame((_, delta) => {
    const group = carrier.current;
    const tube = tether.current;
    if (!group || !tube) return;

    const progress = reducedMotion ? STATIC_MOMENT : scroll.progress;

    // ── The Endurance.
    const enter = smoothstep01(windowProgress(progress, CRAFT_ENTER));
    const fade = 1 - smoothstep01(windowProgress(progress, TETHER_FADE));

    // The ending brings the craft back for one last pass, into the black hole.
    const craftFall = reducedMotion ? 0 : endingWindow(progress, ENDING.craftFall);
    const inEnding = craftFall > 0 && craftFall < 1;

    if (!inEnding && (enter <= 0.001 || progress > PHASE_A_END)) {
      if (group.visible) group.visible = false;
      if (tube.visible) tube.visible = false;
      anchors.ring.presence = 0;
      return;
    }
    if (!group.visible) group.visible = true;

    // Fades in with the figure and the cable (SPAWN_FADE); whole again for
    // its return in the ending.
    const spawn =
      reducedMotion || inEnding
        ? 1
        : smoothstep01(windowProgress(progress, SPAWN_FADE));
    fadeCraft(group, spawn);

    // Waypoints give timing, the spline gives the path: the craft can be slow
    // here and quick there without the trajectory itself ever kinking.
    let i = 0;
    while (i < WAYPOINTS.length - 2 && progress > WAYPOINTS[i + 1].at) i++;
    const span = WAYPOINTS[i + 1].at - WAYPOINTS[i].at;
    const local = span <= 0 ? 0 : (progress - WAYPOINTS[i].at) / span;
    const u = THREE.MathUtils.clamp(
      (i + smoothstep01(local)) / (WAYPOINTS.length - 1),
      0,
      1,
    );

    path.getPoint(u, _pos);
    // Damped, for the same reason the astronaut is: scroll arrives in steps,
    // and an object placed straight from it stutters against a damped camera.
    if (!craftSettled.current) {
      group.position.copy(_pos);
      craftSettled.current = true;
    } else {
      group.position.lerp(_pos, 1 - Math.exp(-6 * Math.min(delta, 1 / 30)));
    }
    group.scale.setScalar(0.55 + enter * 0.45);

    // Drift the craft's heading along its own path, so it is always flying
    // where it is going. Slerped, so heading changes stay gentle.
    path.getPoint(Math.min(1, u + 0.012), _ahead);
    _tangent.subVectors(_ahead, _pos);
    if (_tangent.lengthSq() > 1e-8) {
      _tangent.normalize();
      _quat.setFromUnitVectors(_up, _tangent);
      group.quaternion.slerp(_quat, reducedMotion ? 1 : 0.05);
    }

    // The craft's live footprint, for pebbles to stay behind (enduranceLayer).
    // Presence follows the arrival ramp, so the push grows in with the craft.
    anchors.ring.center.copy(group.position);
    anchors.ring.radius = ENDURANCE_EXTENT_RADIUS * group.scale.x;
    anchors.ring.presence = enter;

    // In the ending the path above is overridden: the craft falls in, shrinking,
    // and the cable's thickness and routing scale with it so it stays a cable.
    let ringScale = 1;
    if (inEnding) {
      const size = fallInto(group.position, CRAFT_ENTRY, craftFall, 1.3);
      ringScale = CRAFT_ENDING_SCALE * size;
      group.scale.setScalar(ringScale);
      anchors.ring.presence = 0;
      // The fall moves far each frame: no damping on the craft or the cable,
      // or both trail behind it; and a clean re-arrival if scrolled back up.
      craftSettled.current = false;
      settled.current = false;
      if (size <= 0.002) {
        if (group.visible) group.visible = false;
        if (tube.visible) tube.visible = false;
        return;
      }
    }
    const tetherFade = inEnding ? 1 : fade;
    const cableRadius = CABLE_RADIUS * ringScale;

    // ── The cable.
    if (!anchors.astronautReady || !rangerAnchor.current || tetherFade <= 0.01) {
      if (tube.visible) tube.visible = false;
      settled.current = false;
      return;
    }
    if (!tube.visible) tube.visible = true;
    // The cable dims away with the figure instead of being switched off.
    cableMaterial.opacity = tetherFade * spawn;

    // The Ranger hardpoint, live — this is the value that carries the ring's
    // rotation into the cable.
    rangerAnchor.current.getWorldPosition(anchors.craft);
    anchors.craftReady = true;

    _dir.subVectors(anchors.astronaut, anchors.craft);
    const length = _dir.length();

    // Slack is generous while the craft is close and tightens as it climbs,
    // so the cable straightens because it is being drawn out rather than
    // because a rule straightened it.
    const slack = THREE.MathUtils.clamp(1 - length / 46, 0.05, 1) * 0.24;
    _perp.crossVectors(_dir, _up);
    if (_perp.lengthSq() < 1e-8) _perp.set(1, 0, 0);
    _perp.normalize();

    // The ring never stops turning, so the cable's far end is always sweeping
    // around it. Left to a straight run, the cable would cut through the
    // structure whenever the Ranger came round to the far side. Pushing the
    // first control point radially *outward* from the ring's centre makes the
    // cable leave the hardpoint heading away from the hull, then curve back
    // toward the figure — it routes around the craft rather than through it.
    _outward.subVectors(anchors.craft, group.position);
    if (_outward.lengthSq() < 1e-8) _outward.copy(_dir).negate();
    _outward.normalize();

    const offsets: [number, number, number][] = [
      [0.28, 0.5, -0.4],
      [0.55, -0.18, -0.48],
      [0.79, -0.4, -0.2],
    ];
    for (let k = 0; k < 3; k++) {
      const [along, lateral, vertical] = offsets[k];
      _mid
        .copy(anchors.craft)
        .addScaledVector(_dir, along)
        .addScaledVector(_perp, length * slack * lateral)
        .addScaledVector(_up, length * slack * vertical);
      // Strongest on the control point nearest the craft, gone by the far end.
      if (k === 0) {
        _mid.addScaledVector(_outward, ENDURANCE_RING_RADIUS * 0.72 * ringScale);
      } else if (k === 1) {
        _mid.addScaledVector(_outward, ENDURANCE_RING_RADIUS * 0.22 * ringScale);
      }

      if (!settled.current || reducedMotion) {
        damped.current[k].copy(_mid);
      } else {
        // Frame-rate independent follow. The ring leads, the cable answers a
        // beat later — enough lag to read as flexible, far too little to wave.
        damped.current[k].lerp(_mid, 1 - Math.exp(-4.5 * delta));
      }
    }
    settled.current = true;

    cable.points[0].copy(anchors.craft);
    cable.points[1].copy(damped.current[0]);
    cable.points[2].copy(damped.current[1]);
    cable.points[3].copy(damped.current[2]);
    cable.points[4].copy(anchors.astronaut);

    // ── Sweep the tube along the paid-out portion of the spline.
    const position = tubeGeometry.attributes.position as THREE.BufferAttribute;
    const normal = tubeGeometry.attributes.normal as THREE.BufferAttribute;

    // The full span, every frame: the cable joins hardware at both ends from
    // the first frame it exists to the last.
    for (let s = 0; s <= TUBULAR; s++) {
      const t = s / TUBULAR;
      cable.getPoint(t, _pos);
      cable.getTangent(Math.min(t, 0.999), _tangent).normalize();

      // Parallel transport rather than a Frenet frame: a Frenet normal flips
      // where the curve straightens, which would twist the cable exactly as
      // the craft departs and the curve loses its bend.
      if (s === 0) {
        _normal.set(0, 1, 0);
        if (Math.abs(_normal.dot(_tangent)) > 0.9) _normal.set(1, 0, 0);
        _normal.crossVectors(_tangent, _normal).normalize();
      } else {
        _normal.copy(_prevNormal);
        _normal.addScaledVector(_tangent, -_normal.dot(_tangent)).normalize();
      }
      _prevNormal.copy(_normal);
      _binormal.crossVectors(_tangent, _normal).normalize();

      for (let r = 0; r <= RADIAL; r++) {
        const angle = (r / RADIAL) * Math.PI * 2;
        _vertex
          .copy(_normal)
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(_binormal, Math.sin(angle));
        const index = s * (RADIAL + 1) + r;
        normal.setXYZ(index, _vertex.x, _vertex.y, _vertex.z);
        position.setXYZ(
          index,
          _pos.x + _vertex.x * cableRadius,
          _pos.y + _vertex.y * cableRadius,
          _pos.z + _vertex.z * cableRadius,
        );
      }
    }
    position.needsUpdate = true;
    normal.needsUpdate = true;
  });

  return (
    <group ref={root}>
      <group ref={carrier} visible={false}>
        <Endurance anchorRef={rangerAnchor} paused={reducedMotion} />
      </group>
      <mesh
        ref={tether}
        geometry={tubeGeometry}
        material={cableMaterial}
        frustumCulled={false}
        raycast={() => null}
        visible={false}
      />
    </group>
  );
}

export function EnduranceSequence({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const tier = usePerformanceTier();
  // A 254k-triangle model is the heaviest thing in the scene; the weakest
  // tier does without it rather than dragging the whole page down.
  if (tier >= 3) return null;

  return (
    // Suspense keeps the rest of the scene interactive while the 2.9MB craft
    // streams in — the hero has no craft in it anyway, so the load is hidden
    // behind the first screen.
    <Suspense fallback={null}>
      <SequenceBody reducedMotion={reducedMotion} />
    </Suspense>
  );
}
