"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { scroll } from "@/hooks/useScrollProgress";
import { smoothstep01 } from "@/scene/reveal";
import { ENDING, HOLE, HOLE_U, HOLE_V, windowProgress } from "@/scene/ending";
import { useWarmUp } from "@/scene/warmup";

/**
 * BlackHole — Gargantua, traced per pixel.
 *
 * A supplied model was tried first and dropped: its disc was a ringed-planet
 * texture with no dark centre, and no material fix made it read as a black
 * hole. This is drawn instead, and weighs nothing to download.
 *
 * Every pixel of a bounding sphere around the hole sends a ray from the camera
 * and bends it with the Schwarzschild photon equation (units where the horizon
 * radius is 1):
 *
 *     d²x/dλ² = −1.5 · h² · x / r⁵,   h = |x × dx/dλ|
 *
 * That one line produces everything that makes the picture recognisable: the
 * black shadow (~2.6 horizon radii across, larger than the horizon itself),
 * the far side of the disc lifted over the top and folded under the bottom,
 * and a thin bright ring where light has circled the hole before escaping.
 * Each crossing of the disc plane adds the disc's colour there, front to back;
 * a ray that falls inside the horizon ends black.
 *
 * The disc is hot white at its inner edge cooling to orange, streaked with
 * noise that turns at Keplerian speed (inner parts faster), and brighter on
 * the side moving toward the camera (relativistic beaming).
 *
 * Depth is written at the first thing each ray hits, so the stones, the
 * Endurance and the astronaut pass in front of the hole and behind its
 * shadow correctly even though all of them are inside its bounding sphere.
 */

/** Horizon radii. The disc runs from just outside the innermost orbit out. */
const DISC_INNER = 2.6;
const DISC_OUTER = 12;
/** Past this radius bending is negligible; rays start and stop here. */
const BOUND = 16;

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uPresence;
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uCentre;
  uniform mat3 uToLocal;
  uniform mat4 uViewProj;
  varying vec3 vWorld;

  const float R_IN = ${DISC_INNER.toFixed(2)};
  const float R_OUT = ${DISC_OUTER.toFixed(2)};
  const float BOUND = ${BOUND.toFixed(2)};

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Value noise, periodic in x so the streaks close around the disc.
  float noiseP(vec2 p, float period) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float x0 = mod(i.x, period);
    float x1 = mod(i.x + 1.0, period);
    return mix(
      mix(hash(vec2(x0, i.y)), hash(vec2(x1, i.y)), f.x),
      mix(hash(vec2(x0, i.y + 1.0)), hash(vec2(x1, i.y + 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p, float period) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      sum += amp * noiseP(p, period);
      p *= 2.0;
      period *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }

  vec3 disc(vec3 q, vec3 dir, out float alpha) {
    float r = length(q.xz);
    float t = clamp((r - R_IN) / (R_OUT - R_IN), 0.0, 1.0);

    // Keplerian shear: the inner disc laps the outer.
    float turn = atan(q.z, q.x) / 6.2831853 - uTime * 0.9 * pow(r, -1.5);
    float streak = fbm(vec2(fract(turn) * 28.0, r * 2.4), 28.0);

    float density =
      smoothstep(R_IN, R_IN + 0.6, r) * (1.0 - smoothstep(R_OUT * 0.5, R_OUT, r));
    alpha = clamp(density * (0.5 + 0.7 * streak), 0.0, 1.0);

    // Beaming: the side of the disc coming toward the camera is brighter.
    vec3 velocity = normalize(vec3(-q.z, 0.0, q.x));
    float beta = clamp(0.5 / sqrt(max(r - 1.0, 0.3)), 0.0, 0.55);
    float g = sqrt(1.0 - beta * beta) / (1.0 - beta * dot(velocity, -dir));
    float beam = clamp(g * g * g, 0.25, 3.5);

    vec3 hot = vec3(1.0, 0.93, 0.82);
    vec3 warm = vec3(1.0, 0.56, 0.2);
    vec3 cool = vec3(0.78, 0.26, 0.07);
    vec3 tone = mix(hot, warm, smoothstep(0.0, 0.3, t));
    tone = mix(tone, cool, smoothstep(0.3, 1.0, t));

    float intensity = (2.8 * pow(1.0 - t, 1.8) + 0.3) * (0.4 + 0.9 * streak) * beam;
    return tone * intensity;
  }

  void main() {
    vec3 ro = uToLocal * (cameraPosition - uCentre) / uScale;
    vec3 rd = normalize(uToLocal * normalize(vWorld - cameraPosition));

    float b = dot(ro, rd);
    float h = b * b - (dot(ro, ro) - BOUND * BOUND);
    if (h < 0.0) discard;

    vec3 p = ro + rd * max(-b - sqrt(h), 0.0);
    vec3 v = rd;
    vec3 L = cross(p, v);
    float h2 = dot(L, L);

    vec3 colour = vec3(0.0);
    float alpha = 0.0;
    vec3 hit = p;
    bool hasHit = false;

    for (int i = 0; i < STEPS; i++) {
      float r = length(p);
      float dt = clamp(STEP_K * r, 0.03, 0.7);
      v += (-1.5 * h2 * p / pow(r, 5.0)) * dt;
      vec3 next = p + v * dt;

      if (p.y * next.y < 0.0) {
        vec3 q = mix(p, next, p.y / (p.y - next.y));
        float rq = length(q.xz);
        if (rq > R_IN && rq < R_OUT) {
          float a;
          vec3 c = disc(q, normalize(v), a);
          if (!hasHit && a > 0.08) { hit = q; hasHit = true; }
          colour += (1.0 - alpha) * c * a;
          alpha += (1.0 - alpha) * a;
        }
      }

      p = next;
      float rn = length(p);
      if (rn < 1.0) {
        if (!hasHit) { hit = p; hasHit = true; }
        alpha = 1.0;
        break;
      }
      if (rn > BOUND && dot(p, v) > 0.0) break;
      if (alpha > 0.995) break;
    }

    if (alpha < 0.003) discard;

    vec3 hitWorld = uCentre + transpose(uToLocal) * hit * uScale;
    vec4 clip = uViewProj * vec4(hitWorld, 1.0);
    gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(colour * uPresence, alpha * uPresence);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function BlackHole({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const camera = useThree((state) => state.camera);
  // The ray-tracing shader compiled during the landing, not at the reveal.
  useWarmUp(mesh, 1100);

  const material = useMemo(() => {
    // Rows u, n, v: world direction → disc-local (x, y = up the normal, z).
    // v = n × u, so local angle increases the same way the falls in
    // scene/ending.ts go round, and the disc turns with them.
    const toLocal = new THREE.Matrix3().set(
      HOLE_U.x, HOLE_U.y, HOLE_U.z,
      HOLE.normal.x, HOLE.normal.y, HOLE.normal.z,
      HOLE_V.x, HOLE_V.y, HOLE_V.z,
    );
    // Phones trace with fewer, longer steps: the same picture to the eye at
    // a fraction of the per-pixel cost.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      defines: coarse
        ? { STEPS: 72, STEP_K: "0.11" }
        : { STEPS: 120, STEP_K: "0.07" },
      uniforms: {
        uPresence: { value: 0 },
        uTime: { value: 0 },
        uScale: { value: HOLE.scale },
        uCentre: { value: HOLE.centre.clone() },
        uToLocal: { value: toLocal },
        uViewProj: { value: new THREE.Matrix4() },
      },
      // The back faces, so the hole still draws with the camera inside its
      // bounds; the real depth comes from gl_FragDepth.
      side: THREE.BackSide,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    });
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;

    const progress = scroll.progress;
    const presence = reducedMotion
      ? 0
      : smoothstep01(windowProgress(progress, ENDING.holeIn)) *
        (1 - smoothstep01(windowProgress(progress, ENDING.holeFade)));

    if (presence <= 0.002) {
      if (m.visible) m.visible = false;
      return;
    }
    if (!m.visible) m.visible = true;

    const u = material.uniforms;
    u.uPresence.value = presence;
    u.uTime.value += Math.min(delta, 1 / 30);
    (u.uViewProj.value as THREE.Matrix4).multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
  });

  return (
    <mesh
      ref={mesh}
      position={HOLE.centre}
      material={material}
      visible={false}
      // Drawn after the stars and the scene it swallows.
      renderOrder={2}
    >
      <sphereGeometry args={[BOUND * HOLE.scale, 48, 32]} />
    </mesh>
  );
}
