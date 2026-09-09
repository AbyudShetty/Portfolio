"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { DOMAIN_ACCENT, DOMAIN_LABEL } from "@/lib/design-tokens";
import { fieldActions, useFieldState } from "@/hooks/useFieldState";
import { getProject, repoUrl } from "@/projects/ProjectData";
import { getCoordinate } from "@/projects/projectCoordinates";
import { adjacentSpecimens, stepSpecimen } from "@/projects/specimen";

import "./SpecimenPanel.css";

/**
 * SpecimenPanel — what the stone says once it is at the lens.
 *
 * Plain centred DOM rather than an `Html` anchored to the object. The stone
 * always travels to the same station in camera space (see `specimen.ts`), so
 * its position on screen is a constant, and a fixed overlay lands on it every
 * time without chasing a 3D anchor. That also keeps the panel as real,
 * focusable, selectable, translatable document content — a `<dialog>`-shaped
 * thing with headings and links, not text baked into a transformed layer.
 *
 * It sits *inside* the stone's silhouette, not beside it. The stone fills
 * roughly two thirds of the frame behind the panel, so its edges, its
 * clearcoat catch and the field beyond it stay visible all the way round.
 * The glass ground underneath the text is what makes that survivable: the
 * stone refracts a moving starfield, and body copy laid straight onto it
 * would be unreadable half the time.
 *
 * Kept short by design (§10.4 is a bigger surface; this is not it). Two or
 * three points, the stack, and the repository. Anyone who wants the rest can
 * have the repository in one click.
 */
export function SpecimenPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const { selectedId } = useFieldState();
  const panel = useRef<HTMLDivElement>(null);
  const record = selectedId ? getProject(selectedId) : undefined;

  const close = useCallback(() => fieldActions.select(null), []);

  /* Keyboard: step between stones, and leave. */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fieldActions.select(null);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        fieldActions.select(stepSpecimen(selectedId, 1));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        fieldActions.select(stepSpecimen(selectedId, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  /**
   * Hold the page still while a stone is being read.
   *
   * Done by refusing the scroll rather than by `overflow: hidden`, which
   * would take the scrollbar away and shift the whole layout sideways at the
   * exact moment the reader is looking at something. The camera is scroll-
   * driven, so letting the page move here would carry the field out from
   * behind the stone.
   */
  useEffect(() => {
    if (!selectedId) return;
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(
          e.key,
        )
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);
    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [selectedId]);

  /*
    Start every opening from nothing.

    The reveal is driven by `--specimen-presence`, which the selected stone
    writes as it flies. On a jump the property still holds the last stone's
    finished value, so without this the new text would appear fully formed for
    one frame and then be yanked back down as the incoming stone starts
    reporting from zero. Layout effect, so it lands before the paint.
  */
  useLayoutEffect(() => {
    if (selectedId) {
      document.documentElement.style.setProperty("--specimen-presence", "0");
    }
  }, [selectedId]);

  /* Move focus into the panel so the keyboard reader lands where the eye did. */
  useEffect(() => {
    if (selectedId && panel.current) panel.current.focus({ preventScroll: true });
  }, [selectedId]);

  if (!record) return null;

  const accent = DOMAIN_ACCENT[record.domain];
  const coordinate = getCoordinate(record.id);
  const adjacent = adjacentSpecimens(record.id);

  return (
    <div className="specimen" data-reduced={reducedMotion ? "true" : "false"}>
      <div
        ref={panel}
        className="specimen__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specimen-title"
        tabIndex={-1}
        /* Remounted per project, so the content cross-fades on a jump
           instead of the new text sliding in under the old. */
        key={record.id}
      >
        {/* A real control, not just the scrim behind. On a narrow screen the
            panel is nearly the whole width, so "tap outside" stops being a
            reachable target. */}
        <button
          type="button"
          className="specimen__close"
          aria-label="Close project"
          onClick={close}
        >
          <span aria-hidden="true">×</span>
        </button>

        <header className="specimen__head">
          <span className="specimen__eyebrow">
            <span
              className="specimen__accent"
              style={{ background: accent }}
              aria-hidden="true"
            />
            {DOMAIN_LABEL[record.domain]}
            <span className="specimen__code">{coordinate.code}</span>
          </span>
          <h2 className="specimen__title" id="specimen-title">
            {record.name}
          </h2>
          {record.org ? (
            <p className="specimen__org">{record.org}</p>
          ) : null}
        </header>

        <ul className="specimen__points">
          {record.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <ul className="specimen__stack" aria-label="Stack">
          {record.stack.slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <footer className="specimen__foot">
          <div className="specimen__links">
            <a
              className="specimen__link"
              href={repoUrl(record)}
              target="_blank"
              rel="noreferrer noopener"
            >
              View on GitHub
              <span aria-hidden="true">↗</span>
            </a>
            {record.demo ? (
              <a
                className="specimen__link"
                href={record.demo}
                target="_blank"
                rel="noreferrer noopener"
              >
                Live demo
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>

          {record.status.length > 0 ? (
            <p className="specimen__status">
              {record.status.map((s) => s.label).join(" · ")}
            </p>
          ) : null}
        </footer>
      </div>

      {/* Stepping controls sit outside the stone, in the empty frame either
          side of it, so they never take room from the copy. */}
      <button
        type="button"
        className="specimen__step specimen__step--prev"
        aria-label="Previous project"
        onClick={() => fieldActions.select(stepSpecimen(record.id, -1))}
      >
        ←
      </button>
      <button
        type="button"
        className="specimen__step specimen__step--next"
        aria-label="Next project"
        onClick={() => fieldActions.select(stepSpecimen(record.id, 1))}
      >
        →
      </button>

      <nav className="specimen__adjacent" aria-label="Adjacent work">
        <span className="specimen__adjacent-title">Adjacent</span>
        {adjacent.map((item) => (
          <button
            key={item.id}
            type="button"
            className="specimen__adjacent-item"
            onClick={() => fieldActions.select(item.id)}
          >
            <span
              className="specimen__accent"
              style={{ background: DOMAIN_ACCENT[item.domain] }}
              aria-hidden="true"
            />
            {item.shortName ?? item.name}
          </button>
        ))}
      </nav>

      <p className="specimen__hint">
        <kbd>←</kbd>
        <kbd>→</kbd> to move between projects · <kbd>Esc</kbd> to return
      </p>
    </div>
  );
}
