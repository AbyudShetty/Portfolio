"use client";

import { useEffect } from "react";

import { fieldActions, useFieldSelector } from "@/hooks/useFieldState";
import { PROJECTS_BY_IMPORTANCE } from "@/projects/ProjectData";
import { COORDINATES } from "@/projects/projectCoordinates";

/**
 * FieldKeyboardLayer — the field as a real, traversable list (DESIGN.md §12.4).
 *
 * The canvas is aria-hidden, so this is the semantic field: a list of every
 * object in importance order (Experience → featured → secondary). Tab
 * traverses it, focus moves the camera to frame the object exactly as pointer
 * hover does, Enter selects, and Escape returns to the field.
 *
 * These controls are visually hidden but never `display: none` — they are
 * focusable, and focusing one is a first-class way to explore the field rather
 * than a fallback bolted on afterwards.
 */
export function FieldKeyboardLayer() {
  const selectedId = useFieldSelector((s) => s.selectedId);
  const focusedId = useFieldSelector((s) => s.focusedId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedId || focusedId) {
        fieldActions.select(null);
        fieldActions.focus(null);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, focusedId]);

  return (
    <ul
      className="field-keyboard"
      aria-label="Field objects"
      aria-description="Tab moves through objects in importance order and frames each one. Arrow up and down travel through the depth of the field, Home returns to the start, Escape returns to the field view."
    >
      {PROJECTS_BY_IMPORTANCE.map((record) => {
        const coordinate = COORDINATES[record.id];
        return (
          <li key={record.id}>
            <button
              type="button"
              className="field-keyboard__item"
              onFocus={() => fieldActions.focus(record.id)}
              onBlur={() => fieldActions.focus(null)}
              onClick={() => fieldActions.select(record.id)}
            >
              {record.tier === "experience" ? "Experience: " : ""}
              {record.name} — {coordinate.code}. {record.summary}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
