"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { scroll } from "@/hooks/useScrollProgress";
import { smoothstep01 } from "@/scene/reveal";
import { ENDING, HOLE, TESSERACT_CAMERA, windowProgress } from "@/scene/ending";

/**
 * Tesseract — what is inside the black hole.
 *
 * As in the film: a lattice without end, every corridor running away to one
 * vanishing point. Its edges are not bars but loose bundles of fine strands,
 * each carrying slow waves and quick sparks of light toward the viewer — time,
 * laid out as space. The cells around the central corridor are rooms, faintly
 * slatted like shelves; a few are lit. Gold dust drifts through all of it,
 * and a soft light waits at the far end.
 *
 * Nothing is written here. Scrolling on carries the camera down the corridor
 * and into one of the rooms — a different one each visit — whose light grows
 * until it fills the frame. At the bottom of the page that light becomes the
 * flash that returns the reader to the beginning (ui/relive.ts).
 *
 * Built in the resting camera's own frame (TESSERACT_CAMERA): -Z is ahead,
 * so the corridors meet at the centre of the screen.
 */

/* ── Proportions ────────────────────────────────────────────────────────── */

const CELL = 3.2;
/** Lattice lines sit at (i + 0.5) · CELL for i in [-HALF, HALF). */
const HALF = 4;
const DEPTH_CELLS = 26;
/** Strands per edge, across the edge. */
const STRANDS = [-0.13, -0.06, -0.015, 0.045, 0.12];
/** World units per second the cross-beams and rooms drift toward the viewer. */
const FLOW_SPEED = 0.45;

const DEEP = new THREE.Color("#6E4020");
const WARM = new THREE.Color("#D69451");
const PALE = new THREE.Color("#FFE8C2");

/** Deterministic noise, so the lattice is the same structure on every visit. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ── Strands ────────────────────────────────────────────────────────────── */

const strandVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aAxis;
  varying float vAlong;
  varying float vSeed;
  varying float vDist;
  void main() {
    vec4 local = instanceMatrix * vec4(position, 1.0);
    vAlong = aAxis < 0.5 ? local.x : (aAxis < 1.5 ? local.y : local.z);
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * local;
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const strandFragment = /* glsl */ `
  uniform float uPresence;
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uWarm;
  uniform vec3 uPale;
  varying float vAlong;
  varying float vSeed;
  varying float vDist;
  void main() {
    float far = exp(-max(vDist - 4.0, 0.0) * 0.06);
    float near = smoothstep(1.2, 5.5, vDist);

    // Slow waves and rare quick sparks, both travelling toward the viewer.
    float wave = 0.5 + 0.5 * sin(vAlong * 0.75 + uTime * 1.2 + vSeed * 6.2831);
    float spark = pow(0.5 + 0.5 * sin(vAlong * 0.19 + uTime * 2.4 + vSeed * 31.0), 28.0);
    float base = 0.16 + 0.34 * vSeed;

    float heat = clamp(0.2 + 0.55 * wave * vSeed + spark, 0.0, 1.0);
    vec3 tone = mix(uDeep, uWarm, smoothstep(0.0, 0.55, heat));
    tone = mix(tone, uPale, smoothstep(0.55, 1.0, heat));

    float light = (base + 0.45 * wave + 2.2 * spark) * far * near * uPresence;
    gl_FragColor = vec4(tone * light * 0.34, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface Strand {
  position: [number, number, number];
  scale: [number, number, number];
  axis: number;
}

function buildStrands(): { along: Strand[]; across: Strand[] } {
  const along: Strand[] = [];
  const across: Strand[] = [];
  const span = HALF * 2 * CELL + CELL;
  const depth = (DEPTH_CELLS + 3) * CELL;
  let n = 0;
  const thickness = () => 0.01 + 0.022 * seeded(++n * 3.1);
  const wobble = () => (seeded(++n * 7.7) - 0.5) * 0.04;

  for (let i = -HALF; i < HALF; i++) {
    for (let j = -HALF; j < HALF; j++) {
      const x = (i + 0.5) * CELL;
      const y = (j + 0.5) * CELL;
      STRANDS.forEach((o, s) => {
        const t = thickness();
        // Bundles are fanned diagonally, so each edge reads as many threads
        // from any angle rather than as one flat ribbon.
        along.push({
          position: [x + o + wobble(), y + STRANDS[(s + 2) % 5] * 0.7 + wobble(), CELL * 3 - depth / 2],
          scale: [t, t, depth],
          axis: 2,
        });
      });
    }
  }

  for (let k = -1; k <= DEPTH_CELLS; k++) {
    const z = -k * CELL;
    for (let j = -HALF; j < HALF; j++) {
      STRANDS.forEach((o, s) => {
        const a = thickness();
        across.push({
          position: [0, (j + 0.5) * CELL + o + wobble(), z + STRANDS[(s + 1) % 5] * 0.6],
          scale: [span, a, a],
          axis: 0,
        });
        const b = thickness();
        across.push({
          position: [(j + 0.5) * CELL + o + wobble(), 0, z + STRANDS[(s + 3) % 5] * 0.6],
          scale: [b, span, b],
          axis: 1,
        });
      });
    }
  }
  return { along, across };
}

function strandMesh(strands: Strand[], material: THREE.ShaderMaterial) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const seeds = new Float32Array(strands.length);
  const axes = new Float32Array(strands.length);
  const mesh = new THREE.InstancedMesh(geometry, material, strands.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  strands.forEach((strand, index) => {
    m.compose(p.set(...strand.position), q, s.set(...strand.scale));
    mesh.setMatrixAt(index, m);
    seeds[index] = seeded(index + strand.axis * 1000);
    axes[index] = strand.axis;
  });
  geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  geometry.setAttribute("aAxis", new THREE.InstancedBufferAttribute(axes, 1));
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return mesh;
}

/* ── Rooms ──────────────────────────────────────────────────────────────── */

const roomVertex = /* glsl */ `
  attribute float aSeed;
  varying vec2 vUv;
  varying float vSeed;
  varying float vDist;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const roomFragment = /* glsl */ `
  uniform float uPresence;
  uniform float uTime;
  uniform vec3 uWarm;
  uniform vec3 uPale;
  varying vec2 vUv;
  varying float vSeed;
  varying float vDist;
  void main() {
    float far = exp(-max(vDist - 4.0, 0.0) * 0.14);
    float near = smoothstep(2.0, 7.0, vDist);
    vec2 uv = vUv;
    float frame = smoothstep(0.0, 0.12, uv.x) * smoothstep(0.0, 0.12, 1.0 - uv.x)
                * smoothstep(0.0, 0.12, uv.y) * smoothstep(0.0, 0.12, 1.0 - uv.y);
    // Shelves, and the uneven spines along them.
    float shelf = smoothstep(0.35, 0.5, fract(uv.y * 7.0 + vSeed * 3.0));
    float spines = 0.6 + 0.4 * sin(uv.x * (70.0 + vSeed * 40.0) + vSeed * 50.0);
    float lit = vSeed > 0.93 ? 0.3 : (vSeed > 0.75 ? 0.07 : 0.018);
    lit *= 0.8 + 0.2 * sin(uTime * (0.35 + vSeed) + vSeed * 30.0);
    vec3 tone = mix(uWarm, uPale, lit);
    float light = lit * (0.35 + 0.65 * shelf * spines) * frame * far * near * uPresence;
    gl_FragColor = vec4(tone * light, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The room the camera is carried into: brighter, and brightening. */
const chosenFragment = /* glsl */ `
  uniform float uPresence;
  uniform float uLight;
  uniform float uTime;
  uniform vec3 uWarm;
  uniform vec3 uPale;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c * vec2(1.0, 1.1));
    float body = smoothstep(0.5, 0.05, r);
    float shelf = smoothstep(0.3, 0.5, fract(vUv.y * 7.0));
    float spines = 0.65 + 0.35 * sin(vUv.x * 90.0);
    vec3 tone = mix(uWarm, uPale, 0.35 + 0.65 * uLight);
    float light = (0.28 + 1.6 * uLight * uLight) * body * mix(0.6 + 0.4 * shelf * spines, 1.0, uLight);
    light *= 0.92 + 0.08 * sin(uTime * 1.3);
    gl_FragColor = vec4(tone * light * uPresence, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const plainVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ── Dust ───────────────────────────────────────────────────────────────── */

const DUST_COUNT = 1400;
const DUST_DEPTH = 64;

const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.z = mod(p.z + uTime * (0.35 + aSeed * 0.9), ${DUST_DEPTH.toFixed(1)}) - ${(DUST_DEPTH - 6).toFixed(1)};
    p.x += sin(uTime * 0.21 + aSeed * 40.0) * 0.35;
    p.y += cos(uTime * 0.17 + aSeed * 23.0) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(-mv.z, 0.1);
    gl_PointSize = min((1.2 + aSeed * 2.8) * uPixelRatio * (16.0 / depth), 7.0 * uPixelRatio);
    vAlpha = smoothstep(${(DUST_DEPTH - 8).toFixed(1)}, 12.0, depth) * smoothstep(0.4, 2.5, depth);
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`;

const dustFragment = /* glsl */ `
  uniform float uPresence;
  uniform float uTime;
  uniform vec3 uPale;
  uniform vec3 uWarm;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + vSeed * 2.0) + vSeed * 60.0);
    vec3 tone = mix(uWarm, uPale, vSeed);
    gl_FragColor = vec4(tone * a * a * vAlpha * twinkle * uPresence * 0.7, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ── Glows ──────────────────────────────────────────────────────────────── */

const glowFragment = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uWarm;
  uniform vec3 uPale;
  uniform float uFalloff;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float g = exp(-r * r * uFalloff);
    vec3 tone = mix(uWarm, uPale, g);
    gl_FragColor = vec4(tone * g * uIntensity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function additive(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Rooms the camera can be carried into: the eight around the corridor. */
const ROOM_CHOICES: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1],
];

const _camLocal = new THREE.Vector3();
const _roomTarget = new THREE.Vector3();

function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/* ── Assembly ───────────────────────────────────────────────────────────── */

export function Tesseract({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const lattice = useRef<THREE.Group>(null);
  const travel = useRef<THREE.Group>(null);
  const drift = useRef<THREE.Group>(null);
  const chosen = useRef<THREE.Mesh>(null);
  const screenGlow = useRef<THREE.Mesh>(null);

  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  /** Which room this visit ends in, chosen afresh every time the tesseract opens. */
  const room = useRef({ x: 0, y: 0, z: 0, rolled: false });
  const phase = useRef(0);

  const orientation = useMemo(() => {
    // The same basis camera.lookAt gives the resting camera.
    const m = new THREE.Matrix4().lookAt(
      TESSERACT_CAMERA,
      HOLE.centre,
      new THREE.Vector3(0, 1, 0),
    );
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, []);

  const parts = useMemo(() => {
    const shared = {
      uPresence: { value: 0 },
      uTime: { value: 0 },
      uDeep: { value: DEEP.clone() },
      uWarm: { value: WARM.clone() },
      uPale: { value: PALE.clone() },
    };

    const strandMaterial = additive(strandVertex, strandFragment, shared);
    // Strands test depth against nothing opaque here, but keep them sorted
    // among themselves by drawing without depth.
    const strands = buildStrands();
    const along = strandMesh(strands.along, strandMaterial);
    const across = strandMesh(strands.across, strandMaterial);

    // Rooms: every cell around the central corridor, a layer per cell depth.
    const roomMaterial = additive(roomVertex, roomFragment, shared);
    const roomGeometry = new THREE.PlaneGeometry(1, 1);
    const cells: [number, number, number][] = [];
    for (let k = 0; k <= DEPTH_CELLS; k++) {
      for (let i = -HALF + 1; i < HALF; i++) {
        for (let j = -HALF + 1; j < HALF; j++) {
          if (i === 0 && j === 0) continue;
          cells.push([i * CELL, j * CELL, -(k + 0.5) * CELL]);
        }
      }
    }
    const roomSeeds = new Float32Array(cells.length);
    const rooms = new THREE.InstancedMesh(roomGeometry, roomMaterial, cells.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(CELL * 0.84, CELL * 0.84, 1);
    const p = new THREE.Vector3();
    cells.forEach((cell, index) => {
      m.compose(p.set(...cell), q, s);
      rooms.setMatrixAt(index, m);
      roomSeeds[index] = seeded(index * 1.37 + 500);
    });
    roomGeometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(roomSeeds, 1));
    rooms.frustumCulled = false;
    rooms.renderOrder = 2;

    const chosenMaterial = additive(plainVertex, chosenFragment, {
      ...shared,
      uLight: { value: 0 },
    });

    // Dust.
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustSeeds = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (seeded(i * 2.1) - 0.5) * CELL * 7;
      dustPositions[i * 3 + 1] = (seeded(i * 3.3 + 9) - 0.5) * CELL * 7;
      dustPositions[i * 3 + 2] = -seeded(i * 5.7 + 4) * DUST_DEPTH;
      dustSeeds[i] = seeded(i * 7.9 + 2);
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 1));
    const dustMaterial = additive(dustVertex, dustFragment, {
      ...shared,
      uPixelRatio: { value: 1 },
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    dust.frustumCulled = false;
    dust.renderOrder = 4;

    const vanishMaterial = additive(plainVertex, glowFragment, {
      uIntensity: { value: 0 },
      uFalloff: { value: 5 },
      uWarm: shared.uWarm,
      uPale: shared.uPale,
    });
    const screenMaterial = additive(plainVertex, glowFragment, {
      uIntensity: { value: 0 },
      uFalloff: { value: 1.2 },
      uWarm: shared.uWarm,
      uPale: shared.uPale,
    });
    screenMaterial.toneMapped = false;

    const backdrop = new THREE.MeshBasicMaterial({
      color: "#0B0704",
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
    });

    return {
      shared,
      strandMaterial,
      along,
      across,
      rooms,
      roomMaterial,
      chosenMaterial,
      dust,
      dustMaterial,
      vanishMaterial,
      screenMaterial,
      backdrop,
    };
  }, []);

  useEffect(
    () => () => {
      parts.along.geometry.dispose();
      parts.across.geometry.dispose();
      parts.rooms.geometry.dispose();
      parts.dust.geometry.dispose();
      for (const material of [
        parts.strandMaterial,
        parts.roomMaterial,
        parts.chosenMaterial,
        parts.dustMaterial,
        parts.vanishMaterial,
        parts.screenMaterial,
        parts.backdrop,
      ]) {
        material.dispose();
      }
    },
    [parts],
  );

  useFrame((_, delta) => {
    const g = root.current;
    if (!g || !lattice.current || !travel.current || !drift.current) return;
    if (!chosen.current || !screenGlow.current) return;

    const progress = scroll.progress;
    const unfold = reducedMotion
      ? 0
      : smoothstep01(windowProgress(progress, ENDING.tesseractIn));

    if (unfold <= 0.002) {
      if (g.visible) g.visible = false;
      room.current.rolled = false;
      return;
    }
    if (!g.visible) g.visible = true;

    const dt = Math.min(delta, 1 / 30);
    const shared = parts.shared;
    shared.uPresence.value = unfold;
    shared.uTime.value += dt;
    parts.dustMaterial.uniforms.uPixelRatio.value = gl.getPixelRatio();

    // Unfolding out of the point the camera fell into.
    lattice.current.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - unfold, 3)));
    parts.backdrop.opacity = 0.94 * unfold;
    parts.vanishMaterial.uniforms.uIntensity.value = 0.22 * unfold;

    const carry = THREE.MathUtils.clamp(windowProgress(progress, ENDING.room), 0, 1);

    // A new room each time the tesseract opens.
    if (!room.current.rolled) {
      const [ix, iy] = ROOM_CHOICES[Math.floor(Math.random() * ROOM_CHOICES.length)];
      const k = 4 + Math.floor(Math.random() * 3);
      room.current = { x: ix * CELL, y: iy * CELL, z: -(k + 0.5) * CELL, rolled: true };
    }

    // The drift stops as the carry begins, so the room holds still to be
    // entered. It only wraps while nothing is being travelled toward.
    phase.current += dt * FLOW_SPEED * (1 - smoothstep01(carry * 5));
    if (carry <= 0) phase.current %= CELL;
    drift.current.position.z = phase.current;

    chosen.current.position.set(room.current.x, room.current.y, room.current.z + 0.02);

    // Down the corridor first, then across into the room.
    _roomTarget.set(
      room.current.x * easeInOut((carry - 0.3) / 0.7),
      room.current.y * easeInOut((carry - 0.3) / 0.7),
      (room.current.z + phase.current) * easeInOut(carry / 0.95),
    );
    travel.current.position.copy(_roomTarget).negate();

    const light = smoothstep01(windowProgress(progress, ENDING.roomLight));
    parts.chosenMaterial.uniforms.uLight.value = Math.max(carry * 0.35, light);

    // The room's light, at the lens.
    _camLocal.copy(camera.position);
    g.worldToLocal(_camLocal);
    screenGlow.current.position.set(_camLocal.x, _camLocal.y, _camLocal.z - 0.6);
    parts.screenMaterial.uniforms.uIntensity.value = Math.pow(light, 3) * 1.8;
    screenGlow.current.visible = light > 0.001;
  });

  return (
    <group
      ref={root}
      position={TESSERACT_CAMERA}
      quaternion={orientation}
      visible={false}
    >
      {/* A warm dark behind everything, closing off the stars. */}
      <mesh material={parts.backdrop} renderOrder={1}>
        <sphereGeometry args={[110, 24, 16]} />
      </mesh>

      {/* The light at the end of every corridor. */}
      <mesh material={parts.vanishMaterial} position={[0, 0, -90]} renderOrder={1}>
        <planeGeometry args={[120, 120]} />
      </mesh>

      <group ref={lattice}>
        <group ref={travel}>
          <primitive object={parts.along} />
          <primitive object={parts.dust} />
          <group ref={drift}>
            <primitive object={parts.across} />
            <primitive object={parts.rooms} />
            <mesh ref={chosen} material={parts.chosenMaterial} renderOrder={2}>
              <planeGeometry args={[CELL * 0.84, CELL * 0.84]} />
            </mesh>
          </group>
        </group>
      </group>

      <mesh ref={screenGlow} material={parts.screenMaterial} renderOrder={10} visible={false}>
        <planeGeometry args={[3, 3]} />
      </mesh>
    </group>
  );
}
