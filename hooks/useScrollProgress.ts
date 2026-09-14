"use client";

import { useEffect, useState } from "react";

import {
  SECTION_ORDER,
  SECTION_VH,
  sectionStartVh,
  type SectionId,
} from "@/scene/cameraChoreography";

/**
 * Scroll progress — read every frame, so it lives outside React.
 *
 * `progress` is global narrative progress across the document (0–1) and drives
 * the camera. `sections` holds per-section progress and drives the DOM
 * overlays through CSS custom properties. Neither goes through React state:
 * this updates on every scroll event, and re-rendering the tree at that rate
 * to move a camera would be indefensible.
 *
 * Two deliberate details:
 *
 * Layout metrics (document height, section offsets) are measured on mount and
 * on resize, never during a scroll. Reading `scrollHeight` while also writing
 * custom properties to the root would thrash layout on every event; scrolling
 * now only reads `scrollY` and does arithmetic.
 *
 * The handler is *not* coalesced through requestAnimationFrame. Scroll events
 * already fire at most once per frame, and rAF stalls whenever the browser
 * parks frames — which would leave the overlays frozen at stale values in
 * exactly the cases (throttled, backgrounded, reduced-motion) where the DOM is
 * carrying the experience on its own.
 */
export const scroll = {
  progress: 0,
  sections: { landing: 0, about: 0, experience: 0, projects: 0, ending: 0 } as Record<
    SectionId,
    number
  >,
  active: "landing" as SectionId,
};

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function useScrollProgress(): SectionId {
  const [active, setActive] = useState<SectionId>("landing");

  useEffect(() => {
    const root = document.documentElement;
    let lastActive: SectionId = "landing";

    // Measured only when the layout can actually have changed.
    let scrollable = 1;
    let bounds: { id: SectionId; start: number; height: number }[] = [];
    let viewportHeight = 0;

    const measure = () => {
      viewportHeight = window.innerHeight;
      const unit = viewportHeight / 100;
      scrollable = Math.max(1, root.scrollHeight - viewportHeight);
      bounds = SECTION_ORDER.map((id) => ({
        id,
        start: sectionStartVh(id) * unit,
        height: SECTION_VH[id] * unit,
      }));
    };

    const read = () => {
      const scrollY = window.scrollY;
      scroll.progress = clamp01(scrollY / scrollable);

      let current: SectionId = "landing";
      for (const section of bounds) {
        const local = clamp01((scrollY - section.start) / section.height);
        scroll.sections[section.id] = local;
        root.style.setProperty(`--p-${section.id}`, local.toFixed(4));
        // The section owning the viewport's midpoint is the active one.
        if (scrollY + viewportHeight * 0.5 >= section.start) {
          current = section.id;
        }
      }

      scroll.active = current;
      if (current !== lastActive) {
        lastActive = current;
        setActive(current);
      }
    };

    const onResize = () => {
      measure();
      read();
    };

    measure();
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return active;
}
