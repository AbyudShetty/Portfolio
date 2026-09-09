"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Constellations — faint chart markings, meant to be found rather than seen.
 *
 * Four small figures, thin lines, very low opacity. The intent is the quiet
 * annotation of a scientific star chart: something a reader notices on the
 * second or third look and reads as care, not as an overlay telling them
 * something. If a line is the first thing the eye lands on, it is too strong.
 *
 * Each figure's own stars are drawn slightly brighter than the surrounding
 * field, because a constellation whose lines connect nothing visible reads as
 * decoration. The lines join actual points of light.
 */
const RADIUS = 176;
const LINE_OPACITY = 0.11;

/**
 * Figures are authored, not generated: an anchor direction plus a small path
 * in the local tangent plane. Real constellations are irregular and open, so
 * these avoid symmetry and never close into a shape.
 */
const FIGURES: {
  direction: [number, number, number];
  /** Points in the tangent plane, in degrees of arc. */
  points: [number, number][];
  /** Index pairs to connect. */
  links: [number, number][];
}[] = [
  {
    // A long, loose chain — the most visible of the four.
    direction: [-0.55, 0.34, -0.76],
    points: [
      [0, 0],
      [3.1, 1.6],
      [6.4, 1.1],
      [8.9, 3.4],
      [12.2, 3.0],
      [5.2, -2.4],
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  {
    // A compact quadrilateral with one trailing star.
    direction: [0.72, 0.18, -0.67],
    points: [
      [0, 0],
      [4.2, 0.9],
      [4.9, 4.3],
      [0.8, 3.6],
      [7.8, 6.1],
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
  },
  {
    // A shallow arc, high in the sky.
    direction: [0.1, 0.82, -0.56],
    points: [
      [0, 0],
      [2.8, 2.2],
      [6.1, 3.0],
      [9.4, 2.1],
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    /*
      Ethylbenzene — a benzene ring with a two-carbon chain off one vertex.
      Placed in the upper right of the hero frame, at roughly +17° right and
      +13° above the opening camera's axis — moved further into the corner in
      this pass so there is comfortable negative space between it and the
      title, the profile links and the scroll cue.

      Drawn to the same rules as every other figure here: same star size, same
      line weight, same opacity. It reads as a constellation first — the
      chemistry is there for anyone who looks twice, which is the point. No
      label, no double bonds, no diagram conventions, and the vertices carry
      the same small irregularities as the rest of the sky so it never looks
      like something printed on top of the stars.
    */
    direction: [0.2855, 0.6618, -0.6932],
    points: [
      // Ring.
      [2.28, 0.06],
      [1.02, 1.98],
      [-1.18, 1.86],
      [-2.24, -0.08],
      [-1.04, -1.94],
      [1.14, -1.84],
      // Ethyl chain.
      [4.42, 1.06],
      [6.52, 0.16],
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [0, 6],
      [6, 7],
    ],
  },
  {
    // A small hook, low and to the left — the faintest.
    direction: [-0.84, -0.24, -0.49],
    points: [
      [0, 0],
      [2.4, -1.8],
      [5.3, -1.2],
      [6.1, 1.6],
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
];

/** Places a tangent-plane point (in degrees) onto the sky shell. */
function toSky(
  direction: THREE.Vector3,
  right: THREE.Vector3,
  up: THREE.Vector3,
  arcX: number,
  arcY: number,
): THREE.Vector3 {
  const x = THREE.MathUtils.degToRad(arcX);
  const y = THREE.MathUtils.degToRad(arcY);
  return direction
    .clone()
    .addScaledVector(right, Math.tan(x))
    .addScaledVector(up, Math.tan(y))
    .normalize()
    .multiplyScalar(RADIUS);
}

export function Constellations() {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  const { lineGeometry, starGeometry } = useMemo(() => {
    const linePositions: number[] = [];
    const starPositions: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    for (const figure of FIGURES) {
      const direction = new THREE.Vector3(...figure.direction).normalize();
      const right = new THREE.Vector3()
        .crossVectors(direction, up)
        .normalize();
      const localUp = new THREE.Vector3()
        .crossVectors(right, direction)
        .normalize();

      const placed = figure.points.map(([ax, ay]) =>
        toSky(direction, right, localUp, ax, ay),
      );

      for (const p of placed) starPositions.push(p.x, p.y, p.z);
      for (const [a, b] of figure.links) {
        linePositions.push(
          placed[a].x,
          placed[a].y,
          placed[a].z,
          placed[b].x,
          placed[b].y,
          placed[b].z,
        );
      }
    }

    const lines = new THREE.BufferGeometry();
    lines.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3),
    );
    const stars = new THREE.BufferGeometry();
    stars.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3),
    );
    return { lineGeometry: lines, starGeometry: stars };
  }, []);

  const { lineMaterial, starMaterial } = useMemo(
    () => ({
      lineMaterial: new THREE.LineBasicMaterial({
        color: "#9AA3AA",
        transparent: true,
        opacity: LINE_OPACITY,
        depthWrite: false,
        depthTest: false,
        fog: false,
      }),
      starMaterial: new THREE.PointsMaterial({
        color: "#E6E8EA",
        size: 2.6,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
      }),
    }),
    [],
  );

  useFrame(() => {
    // Sits with the star shell at effective infinity.
    if (group.current) group.current.position.copy(camera.position);
  });

  return (
    <group ref={group} renderOrder={-1}>
      <lineSegments
        geometry={lineGeometry}
        material={lineMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
      <points
        geometry={starGeometry}
        material={starMaterial}
        frustumCulled={false}
        raycast={() => null}
      />
    </group>
  );
}
