"use client";

import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import { EXPERIENCE_RECORD, PROJECT_OBJECTS } from "@/projects/ProjectData";
import { COORDINATES } from "@/projects/projectCoordinates";

/**
 * FieldFallback — the field with no WebGL at all (DESIGN.md §12.1 tier T3).
 *
 * Shown when WebGL is unavailable or the client asks to save data. It is not
 * an error state: content parity is absolute (§14 rule 15), so every object in
 * the field is listed here with its coordinate, domain and summary intact.
 *
 * This is deliberately minimal — the full editorial Index is Milestone 2 work.
 */
export function FieldFallback() {
  const rows = [EXPERIENCE_RECORD, ...PROJECT_OBJECTS];

  return (
    <div className="fallback">
      <p className="fallback__note">
        Rendering the spatial field requires WebGL. The same content follows.
      </p>
      <ul className="fallback__list">
        {rows.map((record) => (
          <li key={record.id} className="fallback__row">
            <span
              className="fallback__rule"
              style={{ background: DOMAIN_ACCENT[record.domain] }}
              aria-hidden="true"
            />
            <span className="fallback__code">{COORDINATES[record.id].code}</span>
            <span className="fallback__title">{record.name}</span>
            <span className="fallback__domain">
              {DOMAIN_LABEL[record.domain]}
            </span>
            <p className="fallback__summary">{record.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
