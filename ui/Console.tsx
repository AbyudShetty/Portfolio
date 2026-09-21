"use client";

import { useCallback, useEffect, useRef } from "react";

import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import { CONTACT_LINES } from "@/lib/contact";
import { fieldActions } from "@/hooks/useFieldState";
import { cameraSnap } from "@/hooks/useScrollProgress";
import { PROJECT_OBJECTS } from "@/projects/ProjectData";
import { COORDINATES } from "@/projects/projectCoordinates";
import { SCROLL_VH } from "@/scene/cameraChoreography";

import "./Console.css";

/**
 * Console — the two things the journey cannot be asked to carry.
 *
 * The site is a single scroll with no menu, which is the point of it; but a
 * reader who has ten seconds, or who wants to write to him, should not have
 * to fly the whole journey to get there. So the rail opens one panel in two
 * modes, in the instrument's own language — hairlines, mono labels, dark
 * glass over the scene rather than a page that replaces it:
 *
 *   index     every stone as a line of type. Choosing one puts the page at
 *             the field and opens that stone, so the fast path lands in the
 *             same place the slow one does.
 *   contact   the ways out to a person: mail, phone, résumé, the profiles.
 */

export type ConsoleMode = "index" | "contact";

/** Where the field is composed and inspectable (cameraChoreography.ts). */
const FIELD_VH = 985;

export function Console({
  mode,
  onClose,
}: {
  mode: ConsoleMode | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  useEffect(() => {
    if (mode && panel.current) panel.current.focus({ preventScroll: true });
  }, [mode]);

  /*
    Straight to the stone: the page is put where the field is composed, the
    camera is told to cut rather than fly the distance (it would otherwise
    travel the whole journey at speed), and the stone opens on the next frame,
    once the scene has been placed.
  */
  const openStone = useCallback(
    (id: string) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * (FIELD_VH / SCROLL_VH), behavior: "instant" });
      cameraSnap.pending = true;
      onClose();
      requestAnimationFrame(() => fieldActions.select(id));
    },
    [onClose],
  );

  if (!mode) return null;

  return (
    <div className="console" data-mode={mode}>
      {/* Clicking the scene behind it closes, like putting a stone back. */}
      <button
        type="button"
        className="console__scrim"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        ref={panel}
        className="console__panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "index" ? "Index of work" : "Contact"}
        tabIndex={-1}
      >
        <header className="console__head">
          <span className="console__title">
            {mode === "index" ? "Index" : "Contact"}
          </span>
          <span className="console__note">
            {mode === "index"
              ? `${PROJECT_OBJECTS.length} entries · choose one to open it in the field`
              : "Always happy to hear about interesting problems"}
          </span>
          <button
            type="button"
            className="console__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {mode === "index" ? (
          <ol className="console__index">
            {PROJECT_OBJECTS.map((record) => {
              const coordinate = COORDINATES[record.id];
              return (
                <li key={record.id}>
                  <button
                    type="button"
                    className="console__entry"
                    onClick={() => openStone(record.id)}
                    onMouseEnter={() => fieldActions.hover(record.id)}
                    onMouseLeave={() => fieldActions.hover(null)}
                  >
                    <span
                      className="console__rule"
                      style={{ background: DOMAIN_ACCENT[record.domain] }}
                      aria-hidden="true"
                    />
                    <span className="console__code">{coordinate.code}</span>
                    <span className="console__name">{record.name}</span>
                    <span className="console__domain">
                      {DOMAIN_LABEL[record.domain]}
                    </span>
                    <span className="console__summary">{record.summary}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <ul className="console__contact">
            {CONTACT_LINES.map((line) => (
              <li key={line.label}>
                <a
                  className="console__line"
                  href={line.href}
                  {...(line.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  <span className="console__code">{line.label}</span>
                  <span className="console__value">{line.value}</span>
                  <span className="console__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
