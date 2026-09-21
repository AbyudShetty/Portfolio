"use client";

import { useEffect, useRef } from "react";

import { readout } from "@/hooks/useFieldState";
import type { SectionId } from "@/scene/cameraChoreography";
import type { ConsoleMode } from "@/ui/Console";

/**
 * TopRail — name, live readout, section.
 *
 * Absent on the landing screen and fading in as the journey begins: the first
 * viewport belongs to the name alone, and chrome sitting over it from the
 * first frame would undo that. Its opacity is driven by `--p-landing`, the
 * same scroll variable the overlays use.
 *
 * The readout updates every frame, so it is written straight to the DOM from
 * an animation loop rather than held in React state.
 */
export function TopRail({
  activeSection,
  onOpen,
}: {
  activeSection: SectionId;
  /** Opens the console (ui/Console.tsx): the index, or the way to write. */
  onOpen?: (mode: ConsoleMode) => void;
}) {
  const codeRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastCode = "";
    let lastCoord = "";

    const tick = () => {
      const code = readout.objectCode ?? readout.code;
      const coord = readout.objectCoordinate ?? readout.coordinate;
      if (code !== lastCode && codeRef.current) {
        codeRef.current.textContent = code;
        codeRef.current.dataset.engaged = readout.objectCode ? "true" : "false";
        lastCode = code;
      }
      if (coord !== lastCoord && coordRef.current) {
        coordRef.current.textContent = coord;
        lastCoord = coord;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header className="rail" data-section={activeSection}>
      <span className="rail__name">Abyud</span>

      <div className="rail__readout" aria-hidden="true">
        <span ref={codeRef} className="rail__code" data-engaged="false">
          LANDING
        </span>
        <span className="rail__divider" />
        <span ref={coordRef} className="rail__coord">
          0.0%
        </span>
      </div>

      <div className="rail__right">
        <span className="rail__section">{activeSection.toUpperCase()}</span>
        {onOpen ? (
          <>
            {/* Two ways out of the journey, for a reader who has ten seconds
                or something to say. Quiet until wanted. */}
            <button
              type="button"
              className="rail__action"
              onClick={() => onOpen("index")}
            >
              Index
            </button>
            <button
              type="button"
              className="rail__action"
              onClick={() => onOpen("contact")}
            >
              Contact
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
