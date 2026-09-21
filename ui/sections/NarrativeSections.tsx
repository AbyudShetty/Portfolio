"use client";

import { SECTION_VH } from "@/scene/cameraChoreography";
import { EXPERIENCE_RECORD } from "@/projects/ProjectData";
import { PROFILE_LINKS } from "@/lib/contact";
import { ProjectList } from "@/ui/ProjectList";
import { LabPlates } from "@/ui/sections/LabPlates";

/**
 * The narrative, as an ordinary scrollable document.
 *
 * Each section is a tall block whose content is `position: sticky`, so the
 * page scrolls normally while the text holds still and the camera travels
 * behind it. Opacity is driven by CSS custom properties the scroll hook
 * publishes, keeping the overlays in step with the camera without a React
 * re-render per frame.
 *
 * This is real content, not captions: headings, a list, a described pipeline.
 * With WebGL removed, motion reduced, or a screen reader running, the page
 * still says everything it has to say.
 */

/** The CAVE signal path, as data — the chain of labels is a reading of it. */
const PIPELINE = [
  "10 IMU NODES",
  "ESP-NOW",
  "HUBS",
  "SLIMEVR SERVER",
  "IK SOLVE",
  "3D AVATAR",
];

export function LandingSection() {
  return (
    <section
      id="landing"
      className="section section--landing"
      style={{ height: `${SECTION_VH.landing}vh` }}
      aria-label="Introduction"
    >
      <div className="section__sticky landing">
        <h1 className="landing__name">Abyud Shetty</h1>

        {/* What he is, in four words: the first screen used to say only the
            name, which tells a reader with ten seconds nothing. */}
        <p className="landing__role">
          CS Undergrad · AI/ML · Full Stack · 3D &amp; XR
        </p>

        <div className="landing__meta">
          <nav className="landing__links" aria-label="Profiles and contact">
            {PROFILE_LINKS.map((link) => (
              <a
                key={link.label}
                className="landing__link"
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* The invitation to scroll, as a mark rather than words: three
            arrow heads lighting in turn, downward. Gone with the first
            scroll. */}
        <div className="landing__scroll" aria-hidden="true">
          <span className="landing__scroll-arrow" />
          <span className="landing__scroll-arrow" />
          <span className="landing__scroll-arrow" />
        </div>
      </div>
    </section>
  );
}

export function ExperienceSection() {
  const record = EXPERIENCE_RECORD;

  return (
    <section
      id="experience"
      className="section section--experience"
      style={{ height: `${SECTION_VH.experience}vh` }}
      aria-labelledby="experience-heading"
    >
      <div className="section__sticky experience">
        <div className="experience__panel">
          <p className="kicker">Experience</p>
          <h2 id="experience-heading" className="experience__title">
            {record.name}
          </h2>
          <p className="experience__meta">
            {record.org ? `${record.org} · ` : ""}Software Development Intern ·{" "}
            {record.year}
          </p>
          {/* Two beats in one box: the pipeline in words, then the lab's own
              plates of it, in the same place (LabPlates.tsx). The signal
              path and the stack belong to the words and leave with them, so
              the plates have the whole box. */}
          <div className="experience__story" data-beat="story">
            <div className="experience__words">
              <ul className="experience__points">
                {(record.narrative ?? [record.summary]).map((point) => (
                  <li key={point} className="experience__point">
                    {point}
                  </li>
                ))}
              </ul>

              <h3 className="sr-only">Pipeline</h3>
              <ol className="pipeline" aria-label="Signal path">
                {PIPELINE.map((stage) => (
                  <li key={stage} className="pipeline__stage">
                    {stage}
                  </li>
                ))}
              </ol>

              <ul className="stack" aria-label="Technologies">
                {record.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
            <LabPlates />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The ending — scroll room only. Nothing is written here: the black hole, the
 * tesseract and the room at the end of it are the scene's alone, and reaching
 * the bottom returns the reader to the top (ui/relive.ts).
 */
export function EndingSection() {
  return (
    <section
      id="ending"
      className="section section--ending"
      style={{ height: `${SECTION_VH.ending}vh` }}
      aria-hidden="true"
    />
  );
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="section section--projects"
      style={{ height: `${SECTION_VH.projects}vh` }}
      aria-labelledby="projects-heading"
    >
      {/*
        The heading is a UI layer anchored to the section, not an object in the
        scene. It stays pinned in the viewport for the whole of the projects
        section — through the descent, the fog and every camera move — because
        the reader needs to know where they are at the exact moment the camera
        is furthest into the field.
      */}
      <div className="projects__heading">
        <h2 id="projects-heading" className="projects__title">
          Projects &amp; Certifications
        </h2>
      </div>

      <div className="section__sticky projects">
        {/* Present for keyboard and assistive technology throughout the
            cinematic pass; focusing an entry resolves its pebble. */}
        <ProjectList variant="quiet" />
      </div>
    </section>
  );
}
