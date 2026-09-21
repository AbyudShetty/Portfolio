"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import {
  detectWebGLSupport,
  prefersSaveData,
} from "@/hooks/usePerformanceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useMounted } from "@/hooks/useViewport";
import { useReliveAtEnd } from "@/ui/relive";
import { Console, type ConsoleMode } from "@/ui/Console";
import { FieldFallback } from "@/ui/FieldFallback";
import { InstrumentCursor } from "@/ui/InstrumentCursor";
import { ProjectList } from "@/ui/ProjectList";
import { SpecimenPanel } from "@/ui/SpecimenPanel";
import { TopRail } from "@/ui/TopRail";
import { AboutSection } from "@/ui/sections/AboutSection";
import {
  EndingSection,
  ExperienceSection,
  LandingSection,
  ProjectsSection,
} from "@/ui/sections/NarrativeSections";

/**
 * Milestone 1 — landing, experience and the project field, as a scroll-driven
 * journey through space.
 *
 * The page is an ordinary tall document. One fixed canvas sits behind it and
 * reads the scroll position; the sections above supply the content and the
 * structure. Nothing here navigates a 3D environment — scrolling is the only
 * control, and the camera is a consequence of it.
 *
 * Detail pages, the Index, About and Contact are later milestones.
 */
const SpaceScene = dynamic(
  () => import("@/scene/SpaceScene").then((m) => m.SpaceScene),
  { ssr: false },
);

export default function Page() {
  const mounted = useMounted();
  const reducedMotion = useReducedMotion();
  const activeSection = useScrollProgress();
  const [capable, setCapable] = useState<boolean | null>(null);
  // The index and the contact panel, opened from the rail.
  const [consoleMode, setConsoleMode] = useState<ConsoleMode | null>(null);
  const closeConsole = useCallback(() => setConsoleMode(null), []);

  // The bottom of the page is a room of the tesseract; arriving there
  // returns the reader to the beginning.
  useReliveAtEnd(mounted);

  useEffect(() => {
    setCapable(detectWebGLSupport() && !prefersSaveData());
  }, []);

  // Phones get the same journey as everything else, framed for the screen
  // (scene/viewport.ts) — not a separate, stripped-down page.

  // No WebGL: the narrative still reads, in full.
  if (mounted && capable === false) {
    return (
      <main className="page page--static">
        <TopRail activeSection={activeSection} />
        <FieldFallback />
      </main>
    );
  }

  return (
    <main className="page" data-section={activeSection}>
      {mounted && capable ? <SpaceScene /> : null}

      <TopRail activeSection={activeSection} onOpen={setConsoleMode} />

      <article className="narrative">
        <LandingSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <EndingSection />
      </article>

      {/* Reduced motion holds one composed frame instead of travelling, so the
          projects are given a plainly readable list rather than being left to
          a camera move that no longer happens. */}
      {reducedMotion ? (
        <section className="static-projects" aria-label="All projects">
          <ProjectList variant="visible" />
        </section>
      ) : null}

      {/* One stone at a time, held up to the lens. Mounted outside the
          narrative so it sits above the canvas and below nothing. */}
      <SpecimenPanel reducedMotion={reducedMotion} />

      <Console mode={consoleMode} onClose={closeConsole} />

      <InstrumentCursor />
      <div className="grain" aria-hidden="true" />
      <div className="relive-flash" aria-hidden="true" />
    </main>
  );
}
