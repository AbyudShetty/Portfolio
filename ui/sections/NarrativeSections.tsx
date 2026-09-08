"use client";

import { SECTION_VH } from "@/scene/cameraChoreography";
import { EXPERIENCE_RECORD } from "@/projects/ProjectData";
import { ProjectList } from "@/ui/ProjectList";

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

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/AbyudShetty" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abyud-somashekara-shetty-9051182ab/",
  },
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

        <div className="landing__meta">
          <nav className="landing__links" aria-label="Profiles">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                className="landing__link"
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.label}
              </a>
            ))}
          </nav>
          <p className="landing__cue" aria-hidden="true">
            Scroll to explore
          </p>
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
            {record.org ? `${record.org} · ` : ""}Internship · {record.year} ·{" "}
            {record.status.map((s) => s.label).join(" · ")}
          </p>
          <p className="experience__summary">{record.summary}</p>

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
      </div>
    </section>
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
          Projects
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
