"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import {
  detectWebGLSupport,
  prefersSaveData,
} from "@/hooks/usePerformanceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsMobile, useMounted } from "@/hooks/useViewport";
import { FieldFallback } from "@/ui/FieldFallback";
import { InstrumentCursor } from "@/ui/InstrumentCursor";
import { MobileNarrative } from "@/ui/MobileNarrative";
import { ProjectList } from "@/ui/ProjectList";
import { SpecimenPanel } from "@/ui/SpecimenPanel";
import { TopRail } from "@/ui/TopRail";
import {
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
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const activeSection = useScrollProgress();
  const [capable, setCapable] = useState<boolean | null>(null);

  useEffect(() => {
    setCapable(detectWebGLSupport() && !prefersSaveData());
  }, []);

  // Mobile is a different telling of the same content, not a scaled-down
  // version of the scene.
  if (mounted && isMobile) {
    return (
      <main className="page page--mobile">
        <MobileNarrative />
        {/* The list is the only way in here, and it selects — so the panel
            has to exist on this path too, or the tap does nothing. */}
        <SpecimenPanel reducedMotion={reducedMotion} />
      </main>
    );
  }

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

      <TopRail activeSection={activeSection} />

      <article className="narrative">
        <LandingSection />
        <ExperienceSection />
        <ProjectsSection />
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

      <InstrumentCursor />
      <div className="grain" aria-hidden="true" />
    </main>
  );
}
