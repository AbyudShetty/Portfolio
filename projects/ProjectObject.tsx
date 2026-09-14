"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { Spring } from "@/lib/spring";
import {
  fieldActions,
  pointer,
  readout,
  useFieldSelector,
} from "@/hooks/useFieldState";
import { useMountTier } from "@/hooks/usePerformanceTier";
import { scroll } from "@/hooks/useScrollProgress";
import { layerBehindEndurance } from "@/experience/enduranceLayer";
import { FIELD_OPTICS } from "@/scene/cameraChoreography";
import { ENDING, fallInto, windowProgress } from "@/scene/ending";
import {
  convergeFactor,
  easeOutCubic,
  revealFactor,
  smoothstep01,
} from "@/scene/reveal";
import { getPebbleCentre, getPebbleGeometry } from "./projectGeometry";
import {
  createEngravingMaterial,
  getEngravingGeometry,
  getEngravingTextures,
  getFaceFrame,
  type EngravingLink,
} from "./engraving";
import { ProjectLabel, type LabelState } from "./ProjectLabel";
import {
  APPROACH,
  ATTENUATION_COLOR,
  PRESENTED_SURFACE,
  SELECTED,
  SELECTED_TRANSMISSION,
  TIER_PROFILE,
} from "./projectMaterials";
import { formatCoordinate, type Coordinate } from "./projectCoordinates";
import { STATION } from "./specimen";
import type { ProjectRecord } from "./ProjectData";

const _worldPos = new THREE.Vector3();
const _screen = new THREE.Vector3();
const _toCamera = new THREE.Vector3();
const _field = new THREE.Vector3();
const _station = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _face = new THREE.Quaternion();
const _identity = new THREE.Quaternion();
const _centre = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _basis = new THREE.Matrix4();
const _exit = new THREE.Vector3();
const _home = new THREE.Vector3();

/** The field's left and right edges (gathered x), for leftmost-first order. */
const FIELD_X_MIN = -6.8;
const FIELD_X_SPAN = 13.9;
/** How far a stone travels left as it leaves, in world units. */
const EXIT_DISTANCE = 34;

/**
 * Both branches of the raycast toggle have to be real functions.
 *
 * React Three Fiber's `applyProps` skips undefined values outright —
 * "Ignore setting undefined props", pmndrs/react-three-fiber#274 — so
 * `raycast={interactive ? undefined : () => null}` is a one-way door: the
 * stub lands on the mesh during the hero, and the undefined that was meant
 * to lift it is silently discarded. The stone then stays unraycastable for
 * the rest of the session and the whole field is dead to the pointer, with
 * nothing logged to say so.
 *
 * Passing the stock prototype method back is explicit and reversible.
 */
const MESH_RAYCAST = THREE.Mesh.prototype.raycast;
const NO_RAYCAST = () => null;

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
  const tier = useMountTier();
  const gl = useThree((s) => s.gl);

  const profile = TIER_PROFILE[record.tier];
  const geometry = useMemo(() => getPebbleGeometry(record.id), [record.id]);
  const faceFrame = useMemo(() => getFaceFrame(record.id), [record.id]);
  const centre = useMemo(() => getPebbleCentre(record.id), [record.id]);
  // Held as colours rather than strings so the per-frame blend costs no
  // parsing. `_body` is the scratch the result is written through.
  const bodyTones = useMemo(
    () => ({
      field: new THREE.Color(profile.material.bodyColor),
      presented: new THREE.Color(PRESENTED_SURFACE.bodyColor),
    }),
    [profile.material.bodyColor],
  );

  const isHovered = useFieldSelector((s) => s.hoveredId === record.id);
  const isFocused = useFieldSelector((s) => s.focusedId === record.id);
  const isSelected = useFieldSelector((s) => s.selectedId === record.id);
  // Whether *some* stone is being presented, which is a different question
  // from whether this one is: the rest of the field steps back while one of
  // its members is being read.
  const specimenOpen = useFieldSelector((s) => s.selectedId !== null);
  const [proximate, setProximate] = useState(false);
  const publishedPresence = useRef(-1);
  const [labelled, setLabelled] = useState(reducedMotion);
  // True once the ending has begun: labels go out before the stones leave.
  const [ending, setEnding] = useState(false);

  /*
    The engraving is built the first time this stone is opened, not at mount:
    thirteen text canvases and decals nobody has asked to read yet would only
    slow the first load. After that it is cached (engraving.ts) and simply
    fades with the stone's flight.
  */
  const [engraving, setEngraving] = useState<{
    geometry: THREE.BufferGeometry;
    material: THREE.MeshStandardMaterial;
    links: EngravingLink[];
  } | null>(null);
  const decal = useRef<THREE.Mesh>(null);
  const overLink = useRef(false);

  /*
    Which engraved mark, if any, is under the pointer — the GitHub mark or a
    live site's globe, set beside the project's name.

    The decal lies exactly on the stone's surface, so which of the two a ray
    reaches first is a coin toss. Rather than race them, the stone's own
    handlers look through every intersection for the decal and read its UV:
    on a mark, the click opens its link; anywhere else it does what a click on
    the stone always did. Only once the words are fully cut in.
  */
  const linkUnder = (
    e: ThreeEvent<PointerEvent | MouseEvent>,
  ): EngravingLink | null => {
    if (!engraving || !isSelected || engraving.material.opacity < 0.9) {
      return null;
    }
    const hit = e.intersections.find((i) => i.object === decal.current);
    const uv = hit?.uv;
    if (!uv) return null;
    return (
      engraving.links.find(
        (l) => uv.x >= l.u0 && uv.x <= l.u1 && uv.y >= l.v0 && uv.y <= l.v1,
      ) ?? null
    );
  };
  const setOverLink = (over: boolean) => {
    if (over === overLink.current) return;
    overLink.current = over;
    // The native cursor is hidden behind the instrument reticle, so the
    // reticle is what says "this opens": see .cursor in SpecimenPanel.css.
    document.body.style.cursor = over ? "pointer" : "";
    if (over) document.body.dataset.cursorLink = "true";
    else delete document.body.dataset.cursorLink;
  };
  useEffect(() => {
    if (!isSelected) setOverLink(false);
  });
  useEffect(() => {
    if (!isSelected || engraving) return;
    let cancelled = false;
    getEngravingTextures(record, gl.capabilities.getMaxAnisotropy()).then(
      (textures) => {
        if (cancelled) return;
        setEngraving({
          geometry: getEngravingGeometry(record.id),
          material: createEngravingMaterial(textures),
          links: textures.links,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isSelected, engraving, record, gl]);
  useEffect(() => () => engraving?.material.dispose(), [engraving]);

  const active = isHovered || isFocused;
  // Hover outranks dimmed on purpose: with one stone at the lens the rest of
  // the field goes quiet, but pointing at a neighbour has to still say what it
  // is — that is how a reader knows what they are about to jump to.
  const labelState: LabelState = ending
    ? "dimmed"
    : active
    ? "hover"
    : specimenOpen
      ? "dimmed"
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
      // Starts closed. The field is distant at mount; glass is granted
      // by FIELD_OPTICS on approach.
      transmission: new Spring(0, {
        stiffness: 200,
        damping: 26,
        mass: 1,
      }),
      emissive: new Spring(0, { stiffness: 200, damping: 26, mass: 1 }),
      // Heavier than the surface springs: a stone leaving the field has mass,
      // and §6.1 asks for that to be felt. Critically damped, so it arrives
      // at the lens and stops rather than bouncing against it.
      present: new Spring(0, { stiffness: 90, damping: 19, mass: 1 }),
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
    const endingStarted = !reducedMotion && progress > ENDING.labelsOut.start;
    if (endingStarted !== ending) setEnding(endingStarted);
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
    // Glass is earned on approach — see FIELD_OPTICS. Before the window the
    // target is a hard zero, not a small number: three.js decides whether to
    // run the whole extra scene pass on `transmission > 0`, so 0.001 costs
    // exactly as much as 0.66.
    // ...and taken away again for the ending: a stone falling into the black
    // hole is too small to show refraction, and glass there would re-render
    // the whole scene — black hole and Endurance included — a second time.
    const optical = reducedMotion
      ? 1
      : smoothstep01(
          (progress - FIELD_OPTICS.start) /
            (FIELD_OPTICS.end - FIELD_OPTICS.start),
        ) *
        (1 - smoothstep01(windowProgress(progress, ENDING.labelsOut)));
    springs.transmission.target = isSelected
      ? SELECTED_TRANSMISSION
      : optical * profile.material.transmission;
    springs.emissive.target = isSelected ? SELECTED.emissiveIntensity : 0;
    springs.present.target = isSelected ? 1 : 0;

    if (reducedMotion) {
      springs.approach.set(springs.approach.target);
      springs.roughness.set(springs.roughness.target);
      springs.transmission.set(springs.transmission.target);
      springs.emissive.set(springs.emissive.target);
      springs.present.set(springs.present.target);
    } else {
      springs.approach.step(delta);
      springs.roughness.step(delta);
      springs.transmission.step(delta);
      springs.emissive.step(delta);
      springs.present.step(delta);
    }

    const present = springs.present.value;

    /*
      Publish the flight to CSS.

      The panel's text is not a card that appears when a stone is clicked —
      it surfaces out of the stone as the stone arrives, so its reveal has to
      be driven by the actual travel rather than by a timer started alongside
      it. A custom property on the root is how the rest of this site already
      hands per-frame values to the DOM layer (see useScrollProgress), and it
      costs one style write instead of a re-render.

      Only the selected stone writes. On a jump the outgoing stone is no
      longer selected, so it cannot fight the incoming one for the value.
    */
    if (isSelected) {
      const step = Math.round(present * 100) / 100;
      if (step !== publishedPresence.current) {
        publishedPresence.current = step;
        document.documentElement.style.setProperty(
          "--specimen-presence",
          String(step),
        );
      }
    } else {
      publishedPresence.current = -1;
    }

    // The specimen comes toward the observer when inspected — it is being
    // brought closer to the eye, not scaled up in place.
    const lift = springs.approach.value * APPROACH.distance;
    _toCamera.set(baseX, baseY, baseZ).sub(camera.position).normalize();
    _field.set(
      posX - _toCamera.x * lift,
      posY - _toCamera.y * lift,
      posZ - _toCamera.z * lift,
    );

    const arrivalScale = easeOutCubic(reveal);
    const unlayeredScale =
      profile.scale *
      arrivalScale *
      (1 + springs.approach.value * (APPROACH.scale - 1));
    // While the Endurance is present, a stone in its way is slid back along
    // the line of sight to behind it and scaled to match, so it looks exactly
    // the same but can never cross the ring's orbit. See enduranceLayer.ts.
    const fieldScale =
      unlayeredScale *
      layerBehindEndurance(
        _field,
        (geometry.boundingSphere?.radius ?? 1.2) * unlayeredScale,
        camera.position,
      );

    if (present > 0.0005) {
      // ── 4. Presentation. The station is recomputed in camera space every
      // frame rather than resolved once, so the stone stays framed if the
      // reader scrolls the camera on underneath it.
      _station
        .set(STATION.offsetX, STATION.offsetY, -STATION.distance)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);

      g.position.lerpVectors(_field, _station, present);
      const presentScale = fieldScale + (STATION.scale - fieldScale) * present;
      g.scale.setScalar(presentScale);

      // Turn the broad face to the lens. Slerped from rest rather than set,
      // so the stone rolls over as it travels instead of snapping flat the
      // instant it is clicked.
      // Not just "face the lens": the face's own right and up are mapped onto
      // the camera's, so the engraved lines read level instead of at whatever
      // roll the stone happened to settle at in the field.
      _axis.copy(camera.position).sub(g.position).normalize();
      _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
      _right.crossVectors(_camUp, _axis).normalize();
      _up.crossVectors(_axis, _right);
      _basis.makeBasis(_right, _up, _axis).multiply(faceFrame.toFrame);
      _face.setFromRotationMatrix(_basis);
      g.quaternion.slerpQuaternions(_identity, _face, present);

      // Put the stone's *silhouette* on the station rather than its origin,
      // so every project is framed identically behind a panel that never
      // moves. Weighted by the flight, so the field's own irregular placement
      // is untouched until the stone leaves it.
      _centre
        .copy(centre)
        .applyQuaternion(g.quaternion)
        .multiplyScalar(presentScale * present);
      g.position.sub(_centre);
    } else {
      g.position.copy(_field);
      g.scale.setScalar(fieldScale);
      if (g.quaternion.w !== 1) g.quaternion.identity();
    }

    // ── 5. The ending. The stones leave to the left, leftmost first, then
    // spiral into the black hole in the same order (scene/ending.ts).
    if (!reducedMotion && progress > ENDING.pebbles.start) {
      const timing = ENDING.pebbles;
      const order = THREE.MathUtils.clamp(
        (coordinate.gathered[0] - FIELD_X_MIN) / FIELD_X_SPAN,
        0,
        1,
      );
      const start = timing.start + timing.stagger * order;

      // Accelerating, and never clamped: a stone is taken, it does not glide
      // off and stop. It is still picking up speed when the fall catches it.
      _home.copy(g.position);
      const leave = Math.min(Math.max(progress - start, 0) / timing.leave, 2);
      const pull = leave * leave;
      _exit.copy(_home);
      _exit.x -= pull * EXIT_DISTANCE;
      _exit.y -= pull * 2;
      _exit.z -= pull * 8;

      const fallT = (progress - start - timing.catch) / timing.fall;

      let size = 1;
      if (fallT > 0) {
        size = fallInto(g.position, _exit, fallT, 1.5, _home);
      } else {
        g.position.copy(_exit);
      }
      if (size <= 0.002) {
        if (g.visible) g.visible = false;
        return;
      }
      g.scale.multiplyScalar(size);
    }

    const mat = materialRef.current;
    if (mat) {
      // The polish comes off as the stone arrives, and goes back on as it
      // leaves — see PRESENTED_SURFACE. Driven by the flight rather than by
      // the selection flag so the change happens *during* the travel and is
      // never a step.
      mat.clearcoat =
        profile.material.clearcoat +
        (PRESENTED_SURFACE.clearcoat - profile.material.clearcoat) * present;
      mat.envMapIntensity =
        profile.material.envMapIntensity +
        (PRESENTED_SURFACE.envMapIntensity -
          profile.material.envMapIntensity) *
          present;
      mat.roughness =
        springs.roughness.value +
        (PRESENTED_SURFACE.roughness - springs.roughness.value) * present;
      mat.color.copy(bodyTones.field).lerp(bodyTones.presented, present);
      // Snapped, so the spring's long tail toward zero cannot leave a
      // hundredth of a unit of transmission switching the pass back on.
      mat.transmission =
        springs.transmission.value < 0.02 ? 0 : springs.transmission.value;
      mat.emissiveIntensity = springs.emissive.value;
    }

    if (engraving) {
      // Cut in as the stone arrives and grown out as it leaves. The words are
      // on the surface, so their timing is the stone's timing by construction.
      const cut = smoothstep01((present - 0.35) / 0.55);
      engraving.material.opacity = cut;
      engraving.material.visible = cut > 0.002;
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
        raycast={interactive ? MESH_RAYCAST : NO_RAYCAST}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          fieldActions.hover(record.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          fieldActions.hover(null);
          setOverLink(false);
        }}
        onPointerMove={(e) => setOverLink(linkUnder(e) !== null)}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          const link = linkUnder(e);
          if (link) {
            window.open(link.url, "_blank", "noopener,noreferrer");
            return;
          }
          // Clicking the stone already at the lens puts it back. Clicking any
          // other one jumps straight to it, without closing first — moving
          // through the field is the point, not returning to it each time.
          fieldActions.select(isSelected ? null : record.id);
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
          attenuationColor={ATTENUATION_COLOR}
          attenuationDistance={profile.material.attenuationDistance}
          clearcoat={profile.material.clearcoat}
          clearcoatRoughness={profile.material.clearcoatRoughness}
          envMapIntensity={profile.material.envMapIntensity}
          emissive={profile.material.bodyColor}
          emissiveIntensity={0}
          transparent={false}
        />
      </mesh>

      {engraving ? (
        <mesh
          geometry={engraving.geometry}
          material={engraving.material}
          ref={decal}
          renderOrder={3}
          // Raycast, with a handler that does nothing, only so it appears in
          // the stone's intersections (see linkUnder). It never stops a click.
          raycast={isSelected ? MESH_RAYCAST : NO_RAYCAST}
          onPointerMove={() => undefined}
        />
      ) : null}

      {/* Identity is readable at rest — the field must communicate what it
          holds without the reader hovering twelve objects to find out. The
          label only mounts once the field is actually forming, so it never
          appears over the hero or during the approach. */}
      {labelled && !isSelected ? (
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
