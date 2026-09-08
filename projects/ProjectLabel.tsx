"use client";

import { Html } from "@react-three/drei";
import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import type { Domain } from "./ProjectData";

export type LabelState = "ambient" | "proximity" | "hover";

/**
 * ProjectLabel — the identity of a real project, always legible.
 *
 * The field is an inspection interface, not a puzzle: a reader must be able to
 * see what every stone is without hovering each one to find out. So the name
 * and its domain are present at rest, and hover raises prominence rather than
 * supplying the information for the first time.
 *
 * Nothing here is ever blurred. No filter, no depth-of-field, no softening at
 * any state — the previous build faded labels in *through* a blur, which made
 * project names unreadable in exactly the section that exists to name them.
 * Transitions move opacity and position only.
 *
 * `Html` is used without `transform`, so this stays crisp screen-space text
 * that can be selected, translated and read by a screen reader.
 */
export function ProjectLabel({
  code,
  name,
  domain,
  state,
  offsetY,
  reducedMotion,
}: {
  code: string;
  name: string;
  domain: Domain;
  state: LabelState;
  offsetY: number;
  reducedMotion: boolean;
}) {
  return (
    <Html
      position={[0, offsetY, 0]}
      center
      zIndexRange={[12, 0]}
      style={{ pointerEvents: "none", userSelect: "none" }}
      prepend
    >
      <div
        className="pebble-label"
        data-state={state}
        style={{
          transition: reducedMotion
            ? "none"
            : "opacity 260ms cubic-bezier(0.22,1,0.36,1), transform 260ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <span
          className="pebble-label__rule"
          style={{ background: DOMAIN_ACCENT[domain] }}
        />
        <span className="pebble-label__name">{name}</span>
        <span className="pebble-label__meta">
          {DOMAIN_LABEL[domain]}
          <span className="pebble-label__code">{code}</span>
        </span>
      </div>
    </Html>
  );
}
