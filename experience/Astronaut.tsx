"use client";

import { RoundedBox } from "@react-three/drei";
import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";

import { SIGNAL } from "@/lib/design-tokens";

/**
 * Astronaut — the primary subject of the Experience.
 *
 * Built from primitives rather than a downloaded model (the asset budget has
 * no room for a rigged character), but composed the way a real suit is: a
 * pressure garment with hard upper torso, bellows joints at every articulation,
 * a control module on the chest, a life-support pack, a neck ring, and a
 * mirrored visor.
 *
 * The target is stylised realism. It has to hold up as the focal point of its
 * section, so it carries genuine detail — but it deliberately stops short of
 * photoreal, because it shares a frame with abstract polished stones and a
 * hyper-real figure would break that world.
 *
 * Static. A drifting figure caught mid-turn, posed once. No animation.
 */

/** Materials, defined once — real suits read through material contrast. */
function useSuitMaterials() {
  return useMemo(() => {
    const fabric = new THREE.MeshPhysicalMaterial({
      color: "#C4C6C4",
      roughness: 0.92,
      metalness: 0.02,
      sheen: 0.35,
      sheenRoughness: 0.9,
      sheenColor: new THREE.Color("#8C8F90"),
      envMapIntensity: 0.75,
    });

    // Hard upper torso and helmet shell — smoother, faintly lacquered.
    const shell = new THREE.MeshPhysicalMaterial({
      color: "#D2D4D3",
      roughness: 0.42,
      metalness: 0.06,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.15,
    });

    const hardware = new THREE.MeshStandardMaterial({
      color: "#6C7174",
      roughness: 0.34,
      metalness: 0.82,
      envMapIntensity: 1.5,
    });

    const dark = new THREE.MeshStandardMaterial({
      color: "#2A2D2F",
      roughness: 0.55,
      metalness: 0.35,
      envMapIntensity: 1.1,
    });

    // The visor does the heavy lifting: a near-mirror carrying the studio
    // reflections, with only a trace of warmth so it belongs to this palette.
    const visor = new THREE.MeshPhysicalMaterial({
      color: "#0C0D0E",
      roughness: 0.035,
      metalness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.8,
      sheen: 0.5,
      sheenColor: new THREE.Color(SIGNAL.dim),
    });

    const trim = new THREE.MeshStandardMaterial({
      color: SIGNAL.dim,
      roughness: 0.38,
      metalness: 0.7,
      envMapIntensity: 1.3,
    });

    return { fabric, shell, hardware, dark, visor, trim };
  }, []);
}

/** A bellows joint — the detail that most reads as "pressure suit". */
function Bellows({
  position,
  rotation,
  radius,
  count = 3,
  spacing = 0.05,
  material,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  count?: number;
  spacing?: number;
  material: THREE.Material;
}) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[0, (i - (count - 1) / 2) * spacing, 0]}
          material={material}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radius, radius * 0.16, 8, 24]} />
        </mesh>
      ))}
    </group>
  );
}

/** Upper arm → elbow → forearm → glove, as one articulated limb. */
function Arm({
  side,
  materials,
}: {
  side: 1 | -1;
  materials: ReturnType<typeof useSuitMaterials>;
}) {
  // Asymmetric pose: one arm drawn in, the other trailing.
  const shoulderRot: [number, number, number] =
    side === -1 ? [0.18, 0, 0.78] : [-0.26, 0, -1.02];
  const forearmRot: [number, number, number] =
    side === -1 ? [-0.5, 0, 0.2] : [0.55, 0, -0.16];

  return (
    <group position={[side * 0.3, 0.62, 0]}>
      {/* Shoulder bearing */}
      <mesh material={materials.hardware}>
        <sphereGeometry args={[0.115, 24, 18]} />
      </mesh>

      <group rotation={shoulderRot}>
        <mesh position={[0, -0.19, 0]} material={materials.fabric}>
          <capsuleGeometry args={[0.088, 0.24, 8, 20]} />
        </mesh>
        <Bellows
          position={[0, -0.33, 0]}
          radius={0.088}
          material={materials.fabric}
        />

        {/* Elbow */}
        <mesh position={[0, -0.4, 0]} material={materials.shell}>
          <sphereGeometry args={[0.093, 24, 18]} />
        </mesh>

        <group position={[0, -0.4, 0]} rotation={forearmRot}>
          <mesh position={[0, -0.19, 0]} material={materials.fabric}>
            <capsuleGeometry args={[0.079, 0.22, 8, 20]} />
          </mesh>
          <Bellows
            position={[0, -0.32, 0]}
            radius={0.079}
            count={2}
            material={materials.fabric}
          />
          {/* Wrist ring and glove */}
          <mesh position={[0, -0.37, 0]} material={materials.hardware}>
            <torusGeometry args={[0.076, 0.016, 8, 24]} />
          </mesh>
          <mesh position={[0, -0.44, 0.01]} material={materials.dark}>
            <sphereGeometry args={[0.082, 24, 18]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Leg({
  side,
  materials,
}: {
  side: 1 | -1;
  materials: ReturnType<typeof useSuitMaterials>;
}) {
  const hipRot: [number, number, number] =
    side === -1 ? [0.24, 0, 0.13] : [-0.16, 0, -0.19];
  const kneeRot: [number, number, number] =
    side === -1 ? [-0.42, 0, 0] : [0.3, 0, 0];

  return (
    <group position={[side * 0.13, 0.02, 0]}>
      <mesh material={materials.hardware}>
        <sphereGeometry args={[0.108, 24, 18]} />
      </mesh>

      <group rotation={hipRot}>
        <mesh position={[0, -0.22, 0]} material={materials.fabric}>
          <capsuleGeometry args={[0.102, 0.26, 8, 20]} />
        </mesh>
        <Bellows
          position={[0, -0.37, 0]}
          radius={0.102}
          material={materials.fabric}
        />
        <mesh position={[0, -0.45, 0]} material={materials.shell}>
          <sphereGeometry args={[0.105, 24, 18]} />
        </mesh>

        <group position={[0, -0.45, 0]} rotation={kneeRot}>
          <mesh position={[0, -0.21, 0]} material={materials.fabric}>
            <capsuleGeometry args={[0.092, 0.24, 8, 20]} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.38, 0.03]} material={materials.dark}>
            <boxGeometry args={[0.14, 0.11, 0.23]} />
          </mesh>
          <mesh position={[0, -0.43, 0.05]} material={materials.hardware}>
            <boxGeometry args={[0.145, 0.03, 0.24]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function Astronaut({
  socketRef,
}: {
  /** Receives the pack's tether socket so the cable can track it. */
  socketRef?: React.Ref<THREE.Object3D>;
}) {
  const m = useSuitMaterials();

  // Torso profile — shoulders wider than waist, lathed rather than a capsule.
  const torso = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const profile: [number, number][] = [
      [0.0, -0.34],
      [0.19, -0.33],
      [0.235, -0.24],
      [0.25, -0.08],
      [0.268, 0.08],
      [0.275, 0.2],
      [0.252, 0.3],
      [0.19, 0.36],
      [0.0, 0.38],
    ];
    for (const [x, y] of profile) points.push(new THREE.Vector2(x, y));
    const geo = new THREE.LatheGeometry(points, 40);
    geo.scale(1, 1, 0.82); // Flatter front-to-back, as a torso is.
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Visor: a spherical cap across the front of the helmet.
  const visorGeometry = useMemo(
    () =>
      new THREE.SphereGeometry(
        0.303,
        48,
        32,
        Math.PI * 0.62,
        Math.PI * 0.76,
        Math.PI * 0.22,
        Math.PI * 0.5,
      ),
    [],
  );

  return (
    // Posed once: turned away and tipped, the way a body drifts when nothing
    // is holding it.
    <group rotation={[0.2, -0.5, 0.14]}>
      {/* ── Helmet ───────────────────────────────────────────────────── */}
      <mesh position={[0, 1.06, 0]} material={m.shell} scale={[1, 1.04, 1.02]}>
        <sphereGeometry args={[0.27, 64, 48]} />
      </mesh>
      {/* Helmet shoulder yoke — suits are not spheres balanced on tubes. */}
      <mesh position={[0, 0.86, -0.02]} material={m.shell} scale={[1.25, 0.5, 1.1]}>
        <sphereGeometry args={[0.22, 40, 28]} />
      </mesh>
      <mesh
        position={[0, 1.06, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        geometry={visorGeometry}
        material={m.visor}
        scale={[1, 1.04, 1.02]}
      />
      {/* Visor aperture trim */}
      <mesh position={[0, 1.06, 0.02]} rotation={[0.06, 0, 0]} material={m.hardware}>
        <torusGeometry args={[0.243, 0.011, 10, 48]} />
      </mesh>
      {/* Neck ring */}
      <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
        <torusGeometry args={[0.152, 0.026, 12, 40]} />
      </mesh>

      {/* ── Torso ────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.42, 0]} geometry={torso} material={m.shell} />
      {/* Waist bearing */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
        <torusGeometry args={[0.196, 0.026, 10, 32]} />
      </mesh>

      {/* Chest control module */}
      <RoundedBox
        args={[0.26, 0.18, 0.07]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.5, 0.21]}
        rotation={[0.1, 0, 0]}
        material={m.dark}
      />
      <mesh position={[0.07, 0.53, 0.25]} rotation={[0.1, 0, 0]} material={m.trim}>
        <boxGeometry args={[0.035, 0.012, 0.006]} />
      </mesh>
      {/* Umbilical connectors */}
      <mesh position={[-0.09, 0.46, 0.245]} rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
        <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
      </mesh>

      {/* ── Life-support pack ────────────────────────────────────────── */}
      <RoundedBox
        args={[0.44, 0.62, 0.24]}
        radius={0.05}
        smoothness={4}
        position={[0, 0.46, -0.26]}
        material={m.shell}
      />
      <RoundedBox
        args={[0.3, 0.14, 0.1]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.72, -0.33]}
        material={m.dark}
      />
      {/* Pack banding */}
      <mesh position={[0, 0.36, -0.26]} rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
        <torusGeometry args={[0.2, 0.012, 8, 6]} />
      </mesh>

      {/* ── Limbs ────────────────────────────────────────────────────── */}
      <Arm side={-1} materials={m} />
      <Arm side={1} materials={m} />
      <Leg side={-1} materials={m} />
      <Leg side={1} materials={m} />

      {/* ── Tether socket ────────────────────────────────────────────────
        An empty transform rather than geometry: the cable is a separate
        object that needs the pack connector's world position every frame, and
        parenting the socket here means it inherits the figure's pose and
        scale for free.

        This replaces a long tapered cylinder that used to trail from the
        pack. It was meant to read as an umbilical and instead read as a rod
        stuck to the model — a real cable meeting a real socket is what that
        idea actually wanted to be.
      */}
      <object3D ref={socketRef} position={[0.04, 0.34, -0.46]} />

      {/* Connector housing, so the cable terminates in hardware. */}
      <mesh
        position={[0.04, 0.34, -0.4]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.hardware}
      >
        <cylinderGeometry args={[0.062, 0.07, 0.1, 16]} />
      </mesh>
      <mesh
        position={[0.04, 0.34, -0.45]}
        rotation={[Math.PI / 2, 0, 0]}
        material={m.dark}
      >
        <torusGeometry args={[0.062, 0.015, 8, 20]} />
      </mesh>
    </group>
  );
}
