"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { DOMAIN_ACCENT } from "@/lib/design-tokens";
import { Spring } from "@/lib/spring";
import {
  fieldActions,
  pointer,
  readout,
  useFieldSelector,
} from "@/hooks/useFieldState";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { scroll } from "@/hooks/useScrollProgress";
import {
  convergeFactor,
  easeOutCubic,
  revealFactor,
} from "@/scene/reveal";
import { getPebbleGeometry } from "./projectGeometry";
import { ProjectLabel, type LabelState } from "./ProjectLabel";
import { APPROACH, SELECTED, TIER_PROFILE } from "./projectMaterials";
import { formatCoordinate, type Coordinate } from "./projectCoordinates";
import type { ProjectRecord } from "./ProjectData";

const _worldPos = new THREE.Vector3();
const _screen = new THREE.Vector3();
const _toCamera = new THREE.Vector3();

/**
 * ProjectObject — one polished specimen.
 *
 * Its position each frame is the composition of three things:
 *
 *   1. emergence   — it does not exist during the hero, then arrives from
 *                    deeper space as the world awakens
 *   2. convergence — it drifts from its scattered position into the puddle
 *   3. inspection  — it approaches the camera under the pointer
 *
 * All three are continuous. Nothing teleports, nothing wanders, and nothing
 * moves without a reason tied to where the reader is in the narrative.
 */
export function ProjectObject({
  record,
  coordinate,
  /** 0–1 place in the arrival sequence. */
  revealStagger,
  /** 0–1 place in the gathering sequence; outermost specimens lead. */
  convergeStagger,
  reducedMotion,
  interactive,
}: {
  record: ProjectRecord;
  coordinate: Coordinate;
  revealStagger: number;
  convergeStagger: number;
  reducedMotion: boolean;
  interactive: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const tier = usePerformanceTier();

  const profile = TIER_PROFILE[record.tier];
  const geometry = useMemo(() => getPebbleGeometry(record.id), [record.id]);
  const accent = DOMAIN_ACCENT[record.domain];

  const isHovered = useFieldSelector((s) => s.hoveredId === record.id);
  const isFocused = useFieldSelector((s) => s.focusedId === record.id);
  const isSelected = useFieldSelector((s) => s.selectedId === record.id);
  const [proximate, setProximate] = useState(false);
  const [labelled, setLabelled] = useState(reducedMotion);

  const active = isHovered || isFocused;
  const labelState: LabelState = active
    ? "hover"
    : proximate
      ? "proximity"
      : "ambient";

  // Only the surface responds with a spring; position is scroll-authored, so
  // springing it as well would fight the choreography.
  const springs = useMemo(
    () => ({
      approach: new Spring(0, profile.spring),
      roughness: new Spring(profile.material.roughness, {
        stiffness: 200,
        damping: 26,
        mass: 1,
      }),
      transmission: new Spring(profile.material.transmission, {
        stiffness: 200,
        damping: 26,
        mass: 1,
      }),
      emissive: new Spring(0, { stiffness: 200, damping: 26, mass: 1 }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const progress = scroll.progress;

    // ── 1. Emergence. Absent from the hero entirely: the title is a
    // protected zone, and an invisible object is the only guarantee.
    const reveal = reducedMotion ? 1 : revealFactor(progress, revealStagger);
    if (reveal <= 0.001) {
      if (g.visible) g.visible = false;
      return;
    }
    if (!g.visible) g.visible = true;

    // ── 2. Convergence. Scattered environment → settled puddle.
    const converge = reducedMotion
      ? 1
      : convergeFactor(progress, convergeStagger);

    // Names arrive with the field, once the stones are most of the way home.
    const shouldLabel = converge > 0.55;
    if (shouldLabel !== labelled) setLabelled(shouldLabel);
    const s = coordinate.scattered;
    const gth = coordinate.gathered;
    const baseX = s[0] + (gth[0] - s[0]) * converge;
    const baseY = s[1] + (gth[1] - s[1]) * converge;
    const baseZ = s[2] + (gth[2] - s[2]) * converge;

    // Arrival: the specimen travels in from further out along its own
    // sight-line rather than fading up in place.
    const emerge = 1 - reveal;
    const posX = baseX * (1 + emerge * 0.55);
    const posY = baseY * (1 + emerge * 0.55) + emerge * 2.5;
    const posZ = baseZ - emerge * 30;

    // ── 3. Inspection.
    _worldPos.set(baseX, baseY, baseZ);
    _screen.copy(_worldPos).project(camera);
    const screenX = (_screen.x * 0.5 + 0.5) * size.width;
    const screenY = (-_screen.y * 0.5 + 0.5) * size.height;
    const distance = Math.hypot(pointer.x - screenX, pointer.y - screenY);
    const near =
      interactive &&
      pointer.present &&
      _screen.z < 1 &&
      distance < profile.proximityRadius;

    if (near !== proximate) setProximate(near);

    springs.approach.target = active ? 1 : 0;
    springs.roughness.target = active
      ? profile.material.hoverRoughness
      : profile.material.roughness;
    springs.transmission.target = isSelected
      ? Math.min(
          SELECTED.transmissionCeiling,
          profile.material.transmission + SELECTED.transmissionBoost,
        )
      : profile.material.transmission;
    springs.emissive.target = isSelected ? SELECTED.emissiveIntensity : 0;

    if (reducedMotion) {
      springs.approach.set(springs.approach.target);
      springs.roughness.set(springs.roughness.target);
      springs.transmission.set(springs.transmission.target);
      springs.emissive.set(springs.emissive.target);
    } else {
      springs.approach.step(delta);
      springs.roughness.step(delta);
      springs.transmission.step(delta);
      springs.emissive.step(delta);
    }

    // The specimen comes toward the observer when inspected — it is being
    // brought closer to the eye, not scaled up in place.
    const lift = springs.approach.value * APPROACH.distance;
    _toCamera.set(baseX, baseY, baseZ).sub(camera.position).normalize();
    g.position.set(
      posX - _toCamera.x * lift,
      posY - _toCamera.y * lift,
      posZ - _toCamera.z * lift,
    );

    const arrivalScale = easeOutCubic(reveal);
    g.scale.setScalar(
      profile.scale *
        arrivalScale *
        (1 + springs.approach.value * (APPROACH.scale - 1)),
    );

    const mat = materialRef.current;
    if (mat) {
      mat.roughness = springs.roughness.value;
      mat.transmission = springs.transmission.value;
      mat.emissiveIntensity = springs.emissive.value;
    }

    if (active) {
      readout.objectCode = coordinate.code;
      readout.objectCoordinate = formatCoordinate([baseX, baseY, baseZ]);
    } else if (readout.objectCode === coordinate.code) {
      readout.objectCode = null;
      readout.objectCoordinate = null;
    }
  });

  // At T2 the field gives up refraction entirely and falls back to a plain
  // surface — cheaper, and at that scale barely legible as a difference.
  const useTransmission = !(tier >= 2 && record.tier === "secondary");

  return (
    <group ref={group} visible={false}>
      <mesh
        geometry={geometry}
        raycast={interactive ? undefined : () => null}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          fieldActions.hover(record.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          fieldActions.hover(null);
        }}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          fieldActions.select(record.id);
        }}
      >
        <meshPhysicalMaterial
          ref={materialRef}
          color={profile.material.bodyColor}
          transmission={useTransmission ? profile.material.transmission : 0}
          thickness={profile.material.thickness}
          ior={profile.material.ior}
          roughness={profile.material.roughness}
          metalness={0}
          attenuationColor={accent}
          attenuationDistance={profile.material.attenuationDistance}
          clearcoat={profile.material.clearcoat}
          clearcoatRoughness={profile.material.clearcoatRoughness}
          envMapIntensity={profile.material.envMapIntensity}
          emissive={accent}
          emissiveIntensity={0}
          transparent={false}
        />
      </mesh>

      {/* Identity is readable at rest — the field must communicate what it
          holds without the reader hovering twelve objects to find out. The
          label only mounts once the field is actually forming, so it never
          appears over the hero or during the approach. */}
      {labelled ? (
        <ProjectLabel
          code={coordinate.code}
          name={record.shortName ?? record.name}
          domain={record.domain}
          state={labelState}
          offsetY={profile.scale * 0.95 + 0.34}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </group>
  );
}
