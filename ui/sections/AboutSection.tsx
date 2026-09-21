"use client";

import type { CSSProperties } from "react";

import { SECTION_VH } from "@/scene/cameraChoreography";
import { ABOUT } from "./aboutContent";

import "./about.css";

/**
 * About — the person, before the work.
 *
 * It sits between the landing and the Experience, while the stones drift in
 * behind it and before the Endurance and the astronaut exist at all: the
 * craft and the figure belong to the Experience, so this section gets space,
 * stars and the arriving field, and nothing else.
 *
 * Three beats in one pinned viewport — who, where from, what along the way —
 * each surfacing at its own point in the section's scroll (`--at` against
 * `--p-about`) and then holding, so the page composes itself as the reader
 * scrolls and stays composed long enough to be read.
 */

type Staged = CSSProperties & { "--at"?: number };

export function AboutContent({ staged }: { staged: boolean }) {
  const beat = (at: number): Staged | undefined =>
    staged ? { "--at": at } : undefined;
  const cls = (name: string) => (staged ? `${name} about__beat` : name);

  return (
    <div className="about__grid" data-staged={staged ? "true" : "false"}>
      <div className={cls("about__intro")} style={beat(0.02)}>
        <p className="kicker">About me</p>
        <h2 id="about-heading" className="about__statement">
          {ABOUT.statement}
        </h2>
        {ABOUT.paragraphs.map((paragraph) => (
          <p key={paragraph} className="about__paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      <section
        className={cls("about__education")}
        style={beat(0.1)}
        aria-labelledby="about-education"
      >
        <h3 id="about-education" className="about__label">
          Education
        </h3>
        <ol className="timeline">
          {ABOUT.education.map((stop, index) => (
            <li
              key={stop.place}
              className="timeline__item"
              data-current={"current" in stop && stop.current ? "true" : "false"}
              // Listed newest first but arriving oldest first, bottom up,
              // as the line draws toward the present.
              style={beat(
                0.13 + (ABOUT.education.length - 1 - index) * 0.045,
              )}
            >
              <span className="timeline__years">{stop.years}</span>
              <span className="timeline__place">
                {stop.place}
                {"location" in stop && stop.location ? (
                  <span className="timeline__location">
                    , {stop.location}
                  </span>
                ) : null}
              </span>
              <span className="timeline__stage">{stop.stage}</span>
              {"coursework" in stop && stop.coursework ? (
                <ul className="coursework" aria-label="Coursework">
                  {stop.coursework.map((course) => (
                    <li key={course}>{course}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className={cls("about__highlights")}
        style={beat(0.3)}
        aria-labelledby="about-highlights"
      >
        <h3 id="about-highlights" className="about__label">
          {ABOUT.highlightsTitle}
        </h3>
        <ul className="highlights">
          {ABOUT.highlights.map((item, index) => (
            <li
              key={item.lead}
              className="highlights__item"
              style={beat(0.33 + index * 0.04)}
            >
              <span className="highlights__lead">{item.lead}</span>
              <span className="highlights__detail">{item.detail}</span>
            </li>
          ))}
        </ul>
        <p className="about__closing" style={beat(0.46)}>
          {ABOUT.closing}
        </p>
      </section>

    </div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="section section--about"
      style={{ height: `${SECTION_VH.about}vh` }}
      aria-labelledby="about-heading"
    >
      <div className="section__sticky about">
        <AboutContent staged />
      </div>
    </section>
  );
}
