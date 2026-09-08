"use client";

import { useEffect, useRef } from "react";

import { fieldActions, pointer, useFieldSelector } from "@/hooks/useFieldState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { damp } from "@/lib/spring";

/**
 * GlassDock — the field's view control (DESIGN.md §8.1).
 *
 * A dock is how an operating environment is navigated, which is the right
 * metaphor for a site that presents itself as an instrument, and it is the one
 * navigation pattern that survives the move to mobile intact.
 *
 * FIELD and EXPERIENCE are the two marked camera positions and are live.
 * INDEX, ABOUT and CONTACT belong to later milestones: they are rendered,
 * focusable and announced as unavailable rather than faked or hidden.
 */
type DockItem = {
  id: string;
  label: string;
  view?: "field" | "experience";
  pending?: boolean;
};

const ITEMS: DockItem[] = [
  { id: "field", label: "FIELD", view: "field" },
  { id: "experience", label: "EXPERIENCE", view: "experience" },
  { id: "index", label: "INDEX", pending: true },
  { id: "about", label: "ABOUT", pending: true },
  { id: "contact", label: "CONTACT", pending: true },
];

/** ≤4px pull toward the pointer. It exists to feel physical, not to be seen. */
const MAGNET_MAX = 4;

export function GlassDock() {
  const view = useFieldSelector((s) => s.view);
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const list = listRef.current;
    if (!list) return;

    const buttons = Array.from(
      list.querySelectorAll<HTMLElement>("[data-magnetic]"),
    );
    const offsets = buttons.map(() => ({ x: 0, y: 0 }));
    let raf = 0;

    const tick = () => {
      for (let i = 0; i < buttons.length; i++) {
        const rect = buttons[i].getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const distance = Math.hypot(dx, dy);
        const strength = distance < 90 ? 1 - distance / 90 : 0;
        const targetX = (dx / (distance || 1)) * MAGNET_MAX * strength;
        const targetY = (dy / (distance || 1)) * MAGNET_MAX * strength;
        offsets[i].x = damp(offsets[i].x, targetX, 10, 1 / 60);
        offsets[i].y = damp(offsets[i].y, targetY, 10, 1 / 60);
        buttons[i].style.transform = `translate3d(${offsets[i].x.toFixed(2)}px, ${offsets[i].y.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <nav className="dock" aria-label="Field views">
      <ul ref={listRef} className="dock__list">
        {ITEMS.map((item) => {
          const active = !item.pending && item.view === view;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-magnetic
                className="dock__item"
                data-active={active ? "true" : "false"}
                data-pending={item.pending ? "true" : "false"}
                aria-current={active ? "true" : undefined}
                aria-disabled={item.pending ? "true" : undefined}
                onClick={() => {
                  if (item.pending || !item.view) return;
                  fieldActions.setView(item.view);
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
