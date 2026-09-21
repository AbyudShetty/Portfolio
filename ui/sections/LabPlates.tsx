"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { scroll } from "@/hooks/useScrollProgress";
import { PlateViewer } from "@/ui/PlateViewer";
import { LAB_PLATES } from "./labPlateData";

import "./lab-plates.css";

/**
 * The lab, in four plates.
 *
 * The Experience panel tells the pipeline in words first; a little further
 * down the same scroll, the words give way to the plates in the same place
 * (lab-plates.css), each developing in turn like a print in the tray. Nothing
 * about the section's length or the camera changes: the plates take the
 * second half of the time the panel was already on screen.
 *
 * Choosing a plate opens it large, over the scene (ui/PlateViewer.tsx).
 */

/** Past this share of the section the plates own the panel (see the CSS). */
const PLATES_FROM = 0.45;

type Staged = CSSProperties & { "--at"?: number };

export function LabPlates() {
  const grid = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  // Only the beat on screen takes clicks: the plates share a box with the
  // words, and an invisible plate must not open under the reader's cursor.
  useEffect(() => {
    let frame = 0;
    let last = "";
    const tick = () => {
      const beat =
        scroll.sections.experience >= PLATES_FROM ? "plates" : "story";
      if (beat !== last && grid.current) {
        grid.current
          .closest(".experience__story")
          ?.setAttribute("data-beat", beat);
        last = beat;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={grid} className="lab">
      <p className="lab__label">
        From the lab <span aria-hidden="true">·</span> CAVE, PES University
      </p>
      <ul className="lab__plates">
        {LAB_PLATES.map((plate, index) => (
          <li
            key={plate.id}
            className="lab__plate"
            data-plate={plate.id}
            style={{ "--at": 0.47 + index * 0.028 } as Staged}
          >
            <button
              type="button"
              className="lab__open"
              onClick={() => setOpen(index)}
              aria-label={`${plate.title}: open larger`}
            >
              <span
                className="lab__frame"
                data-screen={plate.screen ? "true" : "false"}
              >
                <img
                  src={plate.src}
                  width={plate.width}
                  height={plate.height}
                  alt={plate.alt}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="lab__name">
                <span className="lab__code">{plate.code}</span>
                {plate.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <PlateViewer
          plates={LAB_PLATES}
          index={open}
          onStep={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
