/**
 * projectGeometry — one shared pebble family.
 *
 * Every project object is the same fundamental form: a smooth, slightly
 * irregular, flattened solid, like a polished stone. Projects are not given
 * different primitives, and nothing symbolic is placed inside them — what a
 * project *is* belongs to its detail view, not to a 3D icon. The field reads
 * as a collection of specimens from one environment, and hierarchy is carried
 * by depth, clarity, placement and interaction instead of by shape.
 *
 * Each pebble is deterministically seeded from its project id, so it has its
 * own irregularity, proportions and settle angle while staying unmistakably
 * part of the family. The same id always produces the same stone.
 */

import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** FNV-1a over the id — stable across sessions and machines. */
function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small LCG so every pebble draws its variation from one seed, repeatably. */
function makeRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const DETAIL = 4; // 5,120 triangles — smooth silhouette, well inside budget.

/**
 * Low-frequency displacement only. Three broad lobes give the stone its
 * asymmetry; anything higher frequency would read as noise or damage rather
 * than as something tumbled smooth.
 */
function displace(v: THREE.Vector3, p: number[]): number {
  return (
    0.15 * Math.sin(v.x * 1.6 + p[0]) * Math.cos(v.y * 1.25 + p[1]) +
    0.1 * Math.sin(v.y * 2.2 + p[2]) * Math.cos(v.z * 1.85 + p[3]) +
    0.055 * Math.sin(v.z * 2.9 + p[4]) * Math.cos(v.x * 2.45 + p[5])
  );
}

/**
 * A stone and the direction its broad face looks in.
 *
 * The flattening happens along local Y, and then three seeded rotations bake
 * a settle angle straight into the geometry — so by the time a pebble reaches
 * a component, which way is "flat" has been lost. The specimen view needs it
 * back: to hold a stone up to the lens you have to know which face to turn.
 * It is far cheaper to record the normal while the rotations are being
 * applied than to recover it afterwards from the vertices.
 */
export interface Pebble {
  geometry: THREE.BufferGeometry;
  /** Unit normal of the flat face, in the geometry's own space. */
  faceNormal: THREE.Vector3;
  /**
   * Centre of the stone's bounding box, in its own space.
   *
   * Not the origin. Three displacement lobes and a settle rotation push the
   * mass off centre by a tenth of a unit or so, differently for every stone.
   * In the field that is exactly the wanted irregularity; at the lens it is
   * not, because it means each project's silhouette sits somewhere slightly
   * different behind a panel that is always in the same place. Subtracting
   * this centres what the reader actually sees rather than what the transform
   * says is there.
   */
  centre: THREE.Vector3;
}

function buildPebble(id: string): Pebble {
  const random = makeRandom(seedFromId(id));
  const phases = Array.from({ length: 6 }, () => random() * Math.PI * 2);

  // An icosphere rather than a UV sphere: even vertex distribution, and no
  // pole pinching once the form is flattened. Merged first so vertex normals
  // come out smooth rather than faceted.
  const geometry = mergeVertices(new THREE.IcosahedronGeometry(1, DETAIL));

  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    v.multiplyScalar(1 + displace(v, phases));
    position.setXYZ(i, v.x, v.y, v.z);
  }
  position.needsUpdate = true;

  // Pebble proportions — wider than tall, never a sphere.
  geometry.scale(
    1.06 + random() * 0.1,
    0.58 + random() * 0.08,
    0.9 + random() * 0.1,
  );

  // Its own settle angle, as though it came to rest that way.
  const settleY = random() * Math.PI * 2;
  const settleZ = (random() - 0.5) * 0.5;
  const settleX = (random() - 0.5) * 0.35;
  geometry.rotateY(settleY);
  geometry.rotateZ(settleZ);
  geometry.rotateX(settleX);

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  const centre = new THREE.Vector3();
  geometry.boundingBox!.getCenter(centre);

  // The face started as +Y. The Y rotation spins the stone about that axis
  // and so leaves it alone; only the Z and X settles tip it, in that order.
  const faceNormal = new THREE.Vector3(0, 1, 0)
    .applyAxisAngle(AXIS_Z, settleZ)
    .applyAxisAngle(AXIS_X, settleX)
    .normalize();

  return { geometry, faceNormal, centre };
}

const AXIS_Z = new THREE.Vector3(0, 0, 1);
const AXIS_X = new THREE.Vector3(1, 0, 0);

const cache = new Map<string, Pebble>();

function getPebble(id: string): Pebble {
  let pebble = cache.get(id);
  if (!pebble) {
    pebble = buildPebble(id);
    cache.set(id, pebble);
  }
  return pebble;
}

export function getPebbleGeometry(id: string): THREE.BufferGeometry {
  return getPebble(id).geometry;
}

/** Unit normal of the stone's broad face, in its own space. */
export function getPebbleFaceNormal(id: string): THREE.Vector3 {
  return getPebble(id).faceNormal;
}

/** Centre of the stone's bounding box, in its own space. */
export function getPebbleCentre(id: string): THREE.Vector3 {
  return getPebble(id).centre;
}
