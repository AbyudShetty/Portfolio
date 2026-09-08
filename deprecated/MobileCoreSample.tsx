"use client";

import { useState } from "react";

import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import {
  EXPERIENCE_RECORD,
  PROJECT_OBJECTS,
  type ProjectRecord,
} from "@/projects/ProjectData";
import { COORDINATES } from "@/projects/projectCoordinates";

/**
 * MobileCoreSample — the field, rotated ninety degrees (DESIGN.md §11).
 *
 * A scene designed for lateral survey does not survive a 390px portrait
 * viewport, so mobile does not shrink it. On desktop the observer moves
 * *through* a horizontal field; here they descend *through a vertical
 * stratum* — a core sample drilled down through the same measured space.
 *
 * The conceptual language survives intact: depth still means importance (now
 * vertical position and card scale), the measured field survives as a ticked
 * depth ruler, coordinates are unchanged, and featured work still physically
 * occupies more of the screen. Zero WebGL at this size.
 */
export function MobileCoreSample() {
  const featured = PROJECT_OBJECTS.filter((p) => p.tier === "featured-1");
  const technical = PROJECT_OBJECTS.filter((p) => p.tier === "featured-2");
  const secondary = PROJECT_OBJECTS.filter((p) => p.tier === "secondary");

  return (
    <div className="core">
      <div className="core__ruler" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="core__tick"
            data-major={i % 4 === 0 ? "true" : "false"}
          >
            {i % 4 === 0 ? (
              <em className="core__tick-label">
                {(i * -1).toString().padStart(2, "0")}
              </em>
            ) : null}
          </span>
        ))}
      </div>

      <div className="core__stack">
        <ExperienceCard />

        {featured.map((record) => (
          <CoreCard key={record.id} record={record} variant="featured" />
        ))}

        {technical.map((record) => (
          <CoreCard key={record.id} record={record} variant="technical" />
        ))}

        <div className="core__pairs">
          {secondary.map((record) => (
            <CoreCard key={record.id} record={record} variant="secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceCard() {
  const record = EXPERIENCE_RECORD;
  const coordinate = COORDINATES[record.id];

  return (
    <article className="core-card core-card--experience">
      <span className="core-card__anchor-rule" aria-hidden="true" />
      <header>
        <span className="core-card__kicker">EXPERIENCE</span>
        <h2 className="core-card__title core-card__title--serif">
          {record.name}
        </h2>
      </header>
      <p className="core-card__summary">{record.summary}</p>
      <footer className="core-card__meta">
        <span>{coordinate.code}</span>
        <span>INTERNSHIP · {record.year}</span>
      </footer>
    </article>
  );
}

/**
 * Tap-to-expand in place — the Skiper `HoverExpand` mechanic translated to
 * touch, since hover-approach has no meaning without a pointer (§11).
 */
function CoreCard({
  record,
  variant,
}: {
  record: ProjectRecord;
  variant: "featured" | "technical" | "secondary";
}) {
  const [expanded, setExpanded] = useState(false);
  const coordinate = COORDINATES[record.id];
  const accent = DOMAIN_ACCENT[record.domain];

  return (
    <article
      className="core-card"
      data-variant={variant}
      data-expanded={expanded ? "true" : "false"}
    >
      <button
        type="button"
        className="core-card__trigger"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="core-card__rule" style={{ background: accent }} />
        <span className="core-card__code">{coordinate.code}</span>
        <span className="core-card__title">{record.name}</span>
        <span className="core-card__domain">{DOMAIN_LABEL[record.domain]}</span>
      </button>

      {expanded ? (
        <div className="core-card__body">
          <p className="core-card__summary">{record.summary}</p>
          <ul className="core-card__stack">
            {record.stack.slice(0, 6).map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
