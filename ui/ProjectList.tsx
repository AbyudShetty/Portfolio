"use client";

import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import { fieldActions } from "@/hooks/useFieldState";
import { PROJECT_OBJECTS } from "@/projects/ProjectData";
import { COORDINATES } from "@/projects/projectCoordinates";

/**
 * ProjectList — the projects as real, readable DOM.
 *
 * One component serving three contexts, which is the point: the cinematic
 * pass, the reduced-motion composition and the mobile page all render the
 * *same* markup, so the content cannot drift between them and there is no
 * version of this site where a project exists only inside WebGL.
 *
 *   variant="quiet"   visually hidden until focused, sits behind the scene
 *   variant="visible" a plain readable list
 *
 * In the quiet variant, focusing an entry drives the same hover state the
 * pointer does, so a keyboard user inspecting the list sees the corresponding
 * specimen resolve in the scene.
 */
export function ProjectList({
  variant = "visible",
}: {
  variant?: "quiet" | "visible";
}) {
  return (
    <ol className="project-list" data-variant={variant}>
      {PROJECT_OBJECTS.map((record) => {
        const coordinate = COORDINATES[record.id];
        return (
          <li key={record.id} className="project-list__item">
            <button
              type="button"
              className="project-list__entry"
              onFocus={() => fieldActions.focus(record.id)}
              onBlur={() => fieldActions.focus(null)}
              onMouseEnter={() => fieldActions.hover(record.id)}
              onMouseLeave={() => fieldActions.hover(null)}
              onClick={() => fieldActions.select(record.id)}
            >
              <span
                className="project-list__rule"
                style={{ background: DOMAIN_ACCENT[record.domain] }}
                aria-hidden="true"
              />
              <span className="project-list__code">{coordinate.code}</span>
              <span className="project-list__name">{record.name}</span>
              <span className="project-list__domain">
                {DOMAIN_LABEL[record.domain]}
              </span>
              <span className="project-list__summary">{record.summary}</span>
              {record.status.length > 0 ? (
                <span className="project-list__status">
                  {record.status.map((s) => s.label).join(" · ")}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
