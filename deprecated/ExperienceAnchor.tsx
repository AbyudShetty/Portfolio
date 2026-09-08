"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { ENVIRONMENT, FIELD, SIGNAL } from "@/lib/design-tokens";
import { Spring } from "@/lib/spring";
import {
  fieldActions,
  pointer,
  readout,
  useFieldSelector,
} from "@/hooks/useFieldState";
import { EXPERIENCE_RECORD } from "@/projects/ProjectData";
import { formatCoordinate, getCoordinate } from "@/projects/projectCoordinates";
import { TIER_PROFILE } from "@/projects/projectMaterials";

const _worldPos = new THREE.Vector3();
const _screen = new THREE.Vector3();

const MONOLITH_HEIGHT = 3.4;
const MONOLITH_WIDTH = 0.95;
const MONOLITH_DEPTH = 0.62;
const BASE_RADIUS = 1.15;

/**
 * ExperienceAnchor — the internship, and deliberately not a project.
 *
 * DESIGN.md §9.1 differentiates it on five independent axes so the distinction
 * survives any one of them being missed: form (a tethered monolith with a stem
 * and base plate — the only object touching the ground), position (alone on
 * the anchor plane, outside every domain cluster), scale (largest silhouette),
 * colour (the only object permitted the signal accent), and label (a serif
 * EXPERIENCE block rather than a mono coordinate line).
 *
 * It is a separate component from ProjectObject on purpose, so the two cannot
 * drift toward looking alike as the site grows (§13.3).
 */
export function ExperienceAnchor({
  reducedMotion,
  entranceDelay,
}: {
  reducedMotion: boolean;
  entranceDelay: number;
}) {
  const group = useRef<THREE.Group>(null);
  const monolithMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const ringMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const record = EXPERIENCE_RECORD;
  const coordinate = getCoordinate(record.id);
  const profile = TIER_PROFILE.experience;
  const base = coordinate.position;

  const isHovered = useFieldSelector((s) => s.hoveredId === record.id);
  const isFocused = useFieldSelector((s) => s.focusedId === record.id);
  const isSelected = useFieldSelector((s) => s.selectedId === record.id);
  const [proximate, setProximate] = useState(false);
  const active = isHovered || isFocused;

  // The monolith stands on the ground plane rather than floating at a depth,
  // so its geometry is measured from FIELD.groundY upward.
  const stemHeight = 0.9;
  const baseY = FIELD.groundY + 0.04;
  const monolithCenterY = FIELD.groundY + stemHeight + MONOLITH_HEIGHT / 2;

  const springs = useMemo(
    () => ({
      // No translation on hover: a tethered object cannot fly toward you.
      // What resolves instead is clarity and the signal ring (see below).
      scale: new Spring(reducedMotion ? 1 : 0.94, profile.spring),
      roughness: new Spring(profile.material.roughness, {
        stiffness: 200,
        damping: 26,
        mass: 1,
      }),
      ring: new Spring(0.35, { stiffness: 220, damping: 24, mass: 1 }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const arrived = useRef(reducedMotion);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    if (!arrived.current) {
      elapsed.current += delta;
      if (elapsed.current >= entranceDelay) {
        springs.scale.target = 1;
        arrived.current = true;
      }
    }

    _worldPos.set(base[0], monolithCenterY, base[2]);
    _screen.copy(_worldPos).project(camera);
    const screenX = (_screen.x * 0.5 + 0.5) * size.width;
    const screenY = (-_screen.y * 0.5 + 0.5) * size.height;
    const distance = Math.hypot(pointer.x - screenX, pointer.y - screenY);
    const near =
      pointer.present && _screen.z < 1 && distance < profile.proximityRadius;
    if (near !== proximate) setProximate(near);

    springs.roughness.target = active
      ? profile.material.hoverRoughness
      : profile.material.roughness;
    springs.ring.target = active ? 1 : isSelected ? 0.8 : 0.35;

    if (reducedMotion) {
      springs.scale.set(springs.scale.target);
      springs.roughness.set(springs.roughness.target);
      springs.ring.set(springs.ring.target);
    } else {
      springs.scale.step(delta);
      springs.roughness.step(delta);
      springs.ring.step(delta);
    }

    g.scale.setScalar(springs.scale.value);

    if (monolithMaterial.current) {
      monolithMaterial.current.roughness = springs.roughness.value;
      monolithMaterial.current.emissiveIntensity = isSelected ? 0.2 : 0;
    }
    if (ringMaterial.current) {
      ringMaterial.current.opacity = springs.ring.value;
    }

    if (active) {
      readout.objectCode = coordinate.code;
      readout.objectCoordinate = formatCoordinate(base);
    } else if (readout.objectCode === coordinate.code) {
      readout.objectCode = null;
      readout.objectCoordinate = null;
    }
  });

  const handlers = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      fieldActions.hover(record.id);
    },
    onPointerOut: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      fieldActions.hover(null);
    },
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      fieldActions.select(record.id);
    },
  };

  return (
    <group ref={group} position={[base[0], 0, base[2]]}>
      {/* Base plate — the anchor. Nothing else in the field touches ground. */}
      <mesh position={[0, baseY, 0]} {...handlers}>
        <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS * 1.04, 0.08, 64]} />
        {/* Machined metal, not painted plastic: low roughness and high
            metalness so the plate picks up the studio strips and reads as a
            real surface rather than a dark disc. */}
        <meshStandardMaterial
          color={ENVIRONMENT.graphite500}
          roughness={0.3}
          metalness={0.8}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* Signal ring on the base plate — the only signal-coloured object. */}
      <mesh position={[0, baseY + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[BASE_RADIUS * 0.72, BASE_RADIUS * 0.78, 64]} />
        {/* The one signal-coloured element. Emission is held at the same 0.2
            ceiling §5 allows a selected object, so it reads as an indicator
            lamp on an instrument rather than a glowing ring. */}
        <meshStandardMaterial
          ref={ringMaterial}
          color={SIGNAL.base}
          emissive={SIGNAL.base}
          emissiveIntensity={0.2}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stem — the visible tether from ground to monolith. */}
      <mesh position={[0, FIELD.groundY + stemHeight / 2, 0]} {...handlers}>
        <cylinderGeometry args={[0.07, 0.09, stemHeight, 24]} />
        <meshStandardMaterial
          color={ENVIRONMENT.graphite400}
          roughness={0.26}
          metalness={0.85}
          envMapIntensity={1.7}
        />
      </mesh>

      {/* The monolith itself — tallest silhouette in the field. */}
      <mesh position={[0, monolithCenterY, 0]} {...handlers}>
        <boxGeometry
          args={[MONOLITH_WIDTH, MONOLITH_HEIGHT, MONOLITH_DEPTH, 1, 1, 1]}
        />
        <meshPhysicalMaterial
          ref={monolithMaterial}
          color={ENVIRONMENT.graphite600}
          transmission={profile.material.transmission}
          thickness={profile.material.thickness}
          ior={profile.material.ior}
          roughness={profile.material.roughness}
          metalness={0}
          attenuationColor={SIGNAL.base}
          attenuationDistance={profile.material.attenuationDistance}
          clearcoat={profile.material.clearcoat}
          clearcoatRoughness={profile.material.clearcoatRoughness}
          envMapIntensity={profile.material.envMapIntensity}
          emissive={SIGNAL.base}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Internal armature — reads as instrumentation held inside the glass.
          Opaque and in the dimmed signal tone: it survives the transmission
          pass cleanly, and keeping it to signal-dim rather than full signal
          stops the monolith turning into an amber lamp. */}
      <mesh position={[0, monolithCenterY, 0]} raycast={() => null}>
        <boxGeometry args={[0.06, MONOLITH_HEIGHT * 0.82, 0.06]} />
        <meshStandardMaterial
          color={SIGNAL.dim}
          roughness={0.3}
          metalness={0.5}
          envMapIntensity={1.4}
        />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh
          key={i}
          position={[0, monolithCenterY + i * 0.78, 0]}
          raycast={() => null}
        >
          <boxGeometry args={[MONOLITH_WIDTH * 0.62, 0.02, MONOLITH_DEPTH * 0.55]} />
          <meshStandardMaterial
            color={SIGNAL.dim}
            roughness={0.35}
            metalness={0.45}
            envMapIntensity={1.3}
          />
        </mesh>
      ))}

      {/* A different label block entirely — serif, not a mono coordinate line. */}
      <Html
        position={[0, FIELD.groundY + stemHeight + MONOLITH_HEIGHT + 0.55, 0]}
        center={false}
        zIndexRange={[14, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        prepend
      >
        <div
          className="experience-label"
          data-active={active || proximate ? "true" : "false"}
        >
          <span className="experience-label__kicker">EXPERIENCE</span>
          <span className="experience-label__rule" />
          <span className="experience-label__name">{record.name}</span>
          <span className="experience-label__meta">
            INTERNSHIP · {record.year} · {record.status[0]?.label ?? ""}
          </span>
        </div>
      </Html>
    </group>
  );
}
