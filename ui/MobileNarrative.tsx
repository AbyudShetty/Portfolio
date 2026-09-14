"use client";

import { EXPERIENCE_RECORD } from "@/projects/ProjectData";
import { ProjectList } from "@/ui/ProjectList";
import { AboutContent } from "@/ui/sections/AboutSection";
import { SOCIALS } from "@/ui/sections/NarrativeSections";
import { relive } from "@/ui/relive";

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

      <section className="mobile__section" aria-labelledby="about-heading">
        <AboutContent staged={false} />
      </section>

      <section className="mobile__section" aria-labelledby="m-experience">
        <p className="kicker">Experience</p>
        <h2 id="m-experience" className="mobile__title">
          {record.name}
        </h2>
        <p className="mobile__meta">
          {record.org ? `${record.org} · ` : ""}Internship · {record.year}
        </p>
        <ul className="experience__points">
          {(record.narrative ?? [record.summary]).map((point) => (
            <li key={point} className="experience__point">
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="mobile__section" aria-labelledby="m-projects">
        <p className="kicker">The Field</p>
        <h2 id="m-projects" className="mobile__title">
          Selected Work
        </h2>
        <ProjectList variant="visible" />
      </section>

      {/* The same close as the desktop page: the name again, and the links. */}
      <section className="mobile__landing" aria-labelledby="m-credits">
        <h2 id="m-credits" className="mobile__name">
          Abyud Shetty
        </h2>
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
        <button
          type="button"
          className="landing__link credits__relive-mobile"
          onClick={relive}
        >
          Relive it from the beginning
        </button>
      </section>
    </div>
  );
}
