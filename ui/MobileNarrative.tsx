"use client";

import { EXPERIENCE_RECORD } from "@/projects/ProjectData";
import { ProjectList } from "@/ui/ProjectList";

/**
 * MobileNarrative — the same three sections, told without the camera.
 *
 * A scroll-driven cinematic journey has no honest small-screen translation:
 * the frame is too narrow for the composition, and the frame budget is too
 * small for the scene. So mobile does not shrink the desktop experience — it
 * reads the same content as a quiet dark page, which is what a phone is
 * actually good at.
 *
 * A deliberate placeholder for this milestone: the full mobile treatment is
 * later work, but the content parity is real from today.
 */
export function MobileNarrative() {
  const record = EXPERIENCE_RECORD;

  return (
    <div className="mobile">
      <section className="mobile__landing" aria-label="Introduction">
        <h1 className="mobile__name">Abyud Shetty</h1>
      </section>

      <section className="mobile__section" aria-labelledby="m-experience">
        <p className="kicker">Experience</p>
        <h2 id="m-experience" className="mobile__title">
          {record.name}
        </h2>
        <p className="mobile__meta">
          {record.org ? `${record.org} · ` : ""}Internship · {record.year} ·{" "}
          {record.status.map((s) => s.label).join(" · ")}
        </p>
        <p className="mobile__summary">{record.summary}</p>
      </section>

      <section className="mobile__section" aria-labelledby="m-projects">
        <p className="kicker">The Field</p>
        <h2 id="m-projects" className="mobile__title">
          Selected Work
        </h2>
        <ProjectList variant="visible" />
      </section>
    </div>
  );
}
