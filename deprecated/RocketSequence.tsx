"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ENVIRONMENT } from "@/lib/design-tokens";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { scroll } from "@/hooks/useScrollProgress";
import { progressAt } from "@/scene/cameraChoreography";
import { smoothstep01 } from "@/scene/reveal";
import { Rocket, ROCKET_ANCHOR } from "./Rocket";
import {
  anchors,
  CRAFT_ENTER,
  SEQUENCE_END,
  STATIC_MOMENT,
  TETHER_PAYOUT,
  windowProgress,
} from "./sequence";

/**
 * RocketSequence — the craft, the cable, and the scroll that drives both.
 *
 * Three things make this read as one continuous shot rather than a set of
 * animated props:
 *
 *   The trajectory is a spline, not a chain of segments. Waypoints define
 *   *timing*; a Catmull-Rom curve defines the path itself, so the craft never
 *   changes direction at a keyframe.
 *
 *   The cable is a real tube swept along a live spline between two hardpoints
 *   that are queried from the scene each frame, so it terminates in hardware
 *   at both ends with no gap, however either object moves.
 *
 *   The cable's control points are damped rather than snapped. The craft moves
 *   first and the cable follows a fraction behind, which is what makes it read
 *   as a physical thing with mass instead of geometry stretched between two
 *   coordinates.
 *
 * The whole path stays left of the frame's centre so neither the craft nor the
 * cable ever crosses the Experience typography on the right.
 */

/** Waypoints set the *timing*; the spline through them sets the path. */
const WAYPOINTS: { at: number; position: [number, number, number] }[] = [
  { at: progressAt(0), position: [-21, -12, -36] },
  { at: progressAt(12), position: [-17.5, -9.2, -29] },
  { at: progressAt(64), position: [-13, -5.6, -20] },
  { at: progressAt(120), position: [-9.8, -2.8, -13] },
  { at: progressAt(176), position: [-7.4, 0.2, -7] },
  // Nearest approach — above and left of the figure.
  { at: progressAt(232), position: [-6.3, 3.4, -2.6] },
  { at: progressAt(280), position: [-5.8, 7.2, 0.4] },
  // Departing.
  { at: progressAt(330), position: [-5.4, 14, 2.8] },
  { at: progressAt(400), position: [-5.0, 26, 4.6] },
  { at: progressAt(680), position: [-4.6, 58, 6.4] },
];

/** Cable geometry. Thick enough to read as hardware at working distance. */
const TUBULAR = 44;
const RADIAL = 10;
const CABLE_RADIUS = 0.075;

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
const _quat = new THREE.Quaternion();
const _craftAnchor = new THREE.Vector3();

export function RocketSequence({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const craft = useRef<THREE.Group>(null);
  const tether = useRef<THREE.Mesh>(null);
  const tier = usePerformanceTier();

  /** The flight path as one continuous curve. */
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

  /** The cable's spline. Its interior points are damped, not set directly. */
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
   * A tube built once and rewritten in place each frame. Rebuilding
   * TubeGeometry per frame would allocate several typed arrays sixty times a
   * second; the index buffer never changes, so only positions and normals are
   * recomputed.
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
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 500);
    return geo;
  }, []);

  const cableMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // Dark graphite with a metallic response: it catches the key light and
        // the warm bounce the way a real cable would. Not emissive, not neon.
        color: ENVIRONMENT.graphite500,
        roughness: 0.42,
        metalness: 0.72,
        envMapIntensity: 1.3,
      }),
    [],
  );

  /** Damped interior control points — the cable's lag. */
  const damped = useRef([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  const settled = useRef(false);

  useFrame((_, delta) => {
    const group = craft.current;
    const tube = tether.current;
    if (!group || !tube) return;

    const progress = reducedMotion ? STATIC_MOMENT : scroll.progress;

    // ── The craft.
    const enter = smoothstep01(windowProgress(progress, CRAFT_ENTER));
    if (enter <= 0.001 || progress > SEQUENCE_END) {
      if (group.visible) group.visible = false;
      if (tube.visible) tube.visible = false;
      return;
    }
    if (!group.visible) group.visible = true;

    // Waypoints give timing; the spline gives the path. Mapping progress
    // through the waypoint times to a curve parameter means the craft can be
    // slow here and quick there without the path itself ever kinking.
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
    group.position.copy(_pos);
    group.scale.setScalar(enter);

    // Face along travel, so the module always flies nose-first.
    path.getPoint(Math.min(1, u + 0.01), _ahead);
    _tangent.subVectors(_ahead, _pos);
    if (_tangent.lengthSq() > 1e-8) {
      _tangent.normalize();
      _quat.setFromUnitVectors(_up, _tangent);
      group.quaternion.slerp(_quat, reducedMotion ? 1 : 0.18);
    }

    // ── The cable.
    const payout = smoothstep01(windowProgress(progress, TETHER_PAYOUT));
    if (payout <= 0.001 || !anchors.astronautReady) {
      if (tube.visible) tube.visible = false;
      settled.current = false;
      return;
    }
    if (!tube.visible) tube.visible = true;

    // Hardpoint on the module, in world space — moves with the craft.
    _craftAnchor
      .set(ROCKET_ANCHOR[0], ROCKET_ANCHOR[1], ROCKET_ANCHOR[2])
      .multiplyScalar(enter)
      .applyQuaternion(group.quaternion)
      .add(group.position);
    anchors.craft.copy(_craftAnchor);
    anchors.craftReady = true;

    _dir.subVectors(anchors.astronaut, _craftAnchor);
    const length = _dir.length();

    // Slack: generous while the craft is close, tightening as it climbs, so
    // the cable straightens because it is being pulled rather than because a
    // rule told it to.
    const slack = THREE.MathUtils.clamp(1 - length / 30, 0.06, 1) * 0.26;
    _perp.crossVectors(_dir, _up);
    if (_perp.lengthSq() < 1e-8) _perp.set(1, 0, 0);
    _perp.normalize();

    // Three interior control points give a lazy S — how a slack cable hangs
    // when neither end is under gravity.
    const offsets: [number, number, number][] = [
      [0.28, 0.55, -0.42],
      [0.55, -0.2, -0.5],
      [0.78, -0.42, -0.22],
    ];
    for (let k = 0; k < 3; k++) {
      const [along, lateral, vertical] = offsets[k];
      _mid
        .copy(_craftAnchor)
        .addScaledVector(_dir, along)
        .addScaledVector(_perp, length * slack * lateral)
        .addScaledVector(_up, length * slack * vertical);

      if (!settled.current || reducedMotion) {
        damped.current[k].copy(_mid);
      } else {
        // Frame-rate independent follow. The craft leads; the cable answers.
        const lambda = 5.5;
        damped.current[k].lerp(_mid, 1 - Math.exp(-lambda * delta));
      }
    }
    settled.current = true;

    cable.points[0].copy(_craftAnchor);
    cable.points[1].copy(damped.current[0]);
    cable.points[2].copy(damped.current[1]);
    cable.points[3].copy(damped.current[2]);
    cable.points[4].copy(anchors.astronaut);

    // ── Sweep the tube along the paid-out portion of the spline.
    const position = tubeGeometry.attributes.position as THREE.BufferAttribute;
    const normal = tubeGeometry.attributes.normal as THREE.BufferAttribute;

    for (let s = 0; s <= TUBULAR; s++) {
      const t = (s / TUBULAR) * payout;
      cable.getPoint(t, _pos);
      cable.getTangent(Math.min(t, 0.999), _tangent).normalize();

      // Parallel transport: carry the previous ring's normal forward rather
      // than recomputing a Frenet frame, which would flip where the curve
      // straightens and put a visible twist in the cable.
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
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        _vertex
          .copy(_normal)
          .multiplyScalar(cos)
          .addScaledVector(_binormal, sin);

        const index = s * (RADIAL + 1) + r;
        normal.setXYZ(index, _vertex.x, _vertex.y, _vertex.z);
        position.setXYZ(
          index,
          _pos.x + _vertex.x * CABLE_RADIUS,
          _pos.y + _vertex.y * CABLE_RADIUS,
          _pos.z + _vertex.z * CABLE_RADIUS,
        );
      }
    }
    position.needsUpdate = true;
    normal.needsUpdate = true;
  });

  if (tier >= 3) return null;

  return (
    <group>
      <group ref={craft} visible={false} scale={0}>
        <Rocket />
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
