"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { SIGNAL } from "@/lib/design-tokens";

/**
 * ServiceModule — the spacecraft after separation.
 *
 * Not a launch vehicle. This is the part that survives staging and carries on:
 * a compact pressurised bus with a docking collar at one end, a propulsion
 * section at the other, radiator panels, RCS quads and a steerable antenna.
 * The silhouette is deliberately stubby — a launch stack is long and thin
 * because it has to leave an atmosphere, and a transfer module is short and
 * dense because it does not.
 *
 * Dimensions are in the scene's metres. The bus is ~2.6m across and the whole
 * assembly ~5.6m long, against a ~2.2m suited figure: unmistakably a
 * spacecraft next to a person, without dominating the frame.
 *
 * Modelled along +Y so the sequence can orient it along its own travel.
 */
export const MODULE_LENGTH = 5.6;

function useModuleMaterials() {
  return useMemo(() => {
    // Shares the astronaut's hard-shell treatment, so the two read as one
    // production rather than two assets that happen to share a scene.
    const hull = new THREE.MeshPhysicalMaterial({
      color: "#C3C6C6",
      roughness: 0.44,
      metalness: 0.12,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.15,
    });

    const panel = new THREE.MeshStandardMaterial({
      color: "#878C90",
      roughness: 0.4,
      metalness: 0.6,
      envMapIntensity: 1.35,
    });

    const hardware = new THREE.MeshStandardMaterial({
      color: "#6A6F73",
      roughness: 0.3,
      metalness: 0.86,
      envMapIntensity: 1.6,
    });

    const dark = new THREE.MeshStandardMaterial({
      color: "#212527",
      roughness: 0.52,
      metalness: 0.4,
      envMapIntensity: 1.05,
    });

    // Radiators read as dark, matte, faintly warm panels — not solar blue.
    const radiator = new THREE.MeshStandardMaterial({
      color: "#2C2E30",
      roughness: 0.66,
      metalness: 0.28,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
    });

    // Inside the bell only, at the same 0.2 ceiling a selected object gets.
    const throat = new THREE.MeshStandardMaterial({
      color: "#2A1D14",
      emissive: new THREE.Color(SIGNAL.dim),
      emissiveIntensity: 0.2,
      roughness: 0.6,
      metalness: 0.3,
    });

    const trim = new THREE.MeshStandardMaterial({
      color: SIGNAL.dim,
      roughness: 0.42,
      metalness: 0.68,
      envMapIntensity: 1.2,
    });

    return { hull, panel, hardware, dark, radiator, throat, trim };
  }, []);
}

export function Rocket() {
  const m = useModuleMaterials();

  // The pressurised bus: a short barrel with shallow domed ends, lathed so
  // the shoulders are a continuous curve rather than a stack of cylinders.
  const bus = useMemo(() => {
    const profile: [number, number][] = [
      [0.0, 1.72],
      [0.42, 1.68],
      [0.78, 1.56],
      [1.06, 1.34],
      [1.24, 1.06],
      [1.3, 0.72],
      [1.3, -0.72],
      [1.24, -1.04],
      [1.06, -1.3],
      [0.72, -1.48],
      [0.0, -1.52],
    ];
    const geo = new THREE.LatheGeometry(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      56,
    );
    geo.computeVertexNormals();
    return geo;
  }, []);

  const bell = useMemo(() => {
    const profile: [number, number][] = [
      [0.2, 0.0],
      [0.26, -0.16],
      [0.38, -0.36],
      [0.54, -0.56],
      [0.68, -0.7],
    ];
    const geo = new THREE.LatheGeometry(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      44,
    );
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={bus} material={m.hull} />

      {/* Micrometeoroid banding around the barrel — gives the bus scale. */}
      {[1.0, 0.2, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} material={m.panel}>
          <cylinderGeometry args={[1.312, 1.312, 0.12, 56, 1, true]} />
        </mesh>
      ))}
      <mesh position={[0, -1.02, 0]} material={m.trim}>
        <cylinderGeometry args={[1.262, 1.262, 0.05, 56, 1, true]} />
      </mesh>

      {/* ── Forward docking collar ───────────────────────────────────── */}
      <mesh position={[0, 1.86, 0]} material={m.hardware}>
        <cylinderGeometry args={[0.46, 0.52, 0.34, 32]} />
      </mesh>
      <mesh position={[0, 2.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
        <torusGeometry args={[0.46, 0.055, 12, 36]} />
      </mesh>
      <mesh position={[0, 2.02, 0]} material={m.dark}>
        <cylinderGeometry args={[0.36, 0.36, 0.12, 28]} />
      </mesh>
      {/* Capture latches around the collar. */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.46, 1.98, Math.sin(a) * 0.46]}
            material={m.hardware}
          >
            <boxGeometry args={[0.08, 0.16, 0.05]} />
          </mesh>
        );
      })}

      {/* ── Propulsion section ───────────────────────────────────────── */}
      <mesh position={[0, -1.62, 0]} material={m.hardware}>
        <cylinderGeometry args={[0.78, 0.92, 0.3, 40]} />
      </mesh>
      <mesh geometry={bell} position={[0, -1.78, 0]} material={m.hardware} />
      <mesh position={[0, -2.24, 0]} material={m.throat}>
        <sphereGeometry args={[0.32, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Propellant tanks flanking the engine. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.82, -1.5, 0.1]} material={m.panel}>
          <capsuleGeometry args={[0.24, 0.36, 8, 20]} />
        </mesh>
      ))}

      {/* ── Radiator panels ──────────────────────────────────────────── */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.32, 0.1, 0]} rotation={[0, 0, side * 0.12]}>
          <mesh position={[side * 0.9, 0, 0]} material={m.radiator}>
            <boxGeometry args={[1.8, 1.5, 0.05]} />
          </mesh>
          {/* Panel ribs. */}
          {[-0.45, 0, 0.45].map((y, i) => (
            <mesh key={i} position={[side * 0.9, y, 0.04]} material={m.hardware}>
              <boxGeometry args={[1.78, 0.03, 0.02]} />
            </mesh>
          ))}
          {/* Mounting arm. */}
          <mesh position={[side * 0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.hardware}>
            <cylinderGeometry args={[0.045, 0.045, 0.2, 12]} />
          </mesh>
        </group>
      ))}

      {/* ── RCS thruster quads ───────────────────────────────────────── */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.5;
        return (
          <group
            key={i}
            position={[Math.cos(a) * 1.3, 1.16, Math.sin(a) * 1.3]}
            rotation={[0, -a, 0]}
          >
            <mesh material={m.hardware}>
              <boxGeometry args={[0.16, 0.14, 0.18]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[0.09, s * 0.05, 0]}
                rotation={[0, 0, Math.PI / 2]}
                material={m.dark}
              >
                <cylinderGeometry args={[0.026, 0.036, 0.07, 10]} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ── High-gain antenna ────────────────────────────────────────── */}
      <group position={[0.5, 1.34, 1.16]} rotation={[0.5, 0.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.hardware}>
          <cylinderGeometry args={[0.028, 0.028, 0.44, 10]} />
        </mesh>
        <mesh position={[0, 0, 0.26]} rotation={[-Math.PI / 2, 0, 0]} material={m.panel}>
          <sphereGeometry args={[0.34, 28, 14, 0, Math.PI * 2, 0, Math.PI / 3]} />
        </mesh>
      </group>

      {/* ── Tether hardpoint ─────────────────────────────────────────────
        A real fitting on the hull, at the point the cable leaves from, so the
        cable terminates in hardware at both ends rather than in mid-air. */}
      <mesh position={[0.92, 0.62, 0.86]} rotation={[0.4, 0.8, 0]} material={m.hardware}>
        <torusGeometry args={[0.11, 0.032, 10, 22]} />
      </mesh>
      <mesh position={[0.86, 0.58, 0.8]} material={m.dark}>
        <boxGeometry args={[0.18, 0.14, 0.12]} />
      </mesh>
    </group>
  );
}

/** Where the tether leaves the module, in its local frame. */
export const ROCKET_ANCHOR: [number, number, number] = [0.96, 0.64, 0.9];
