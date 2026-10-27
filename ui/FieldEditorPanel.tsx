"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { fieldActions, useFieldSelector } from "@/hooks/useFieldState";
import { PROJECT_OBJECTS } from "@/projects/ProjectData";
import { getCoordinate } from "@/projects/projectCoordinates";
import { stoneScale, stoneSpin, STANDING } from "@/projects/projectStanding";
import {
  checkField,
  currentPlacements,
  sizesForStanding,
  THRESHOLDS,
  type CheckResult,
} from "@/projects/fieldCheck";
import {
  EDITOR_SHOTS,
  canUndo,
  fieldEditor,
  parkAt,
  publishEditor,
  snapshot,
  subscribeEditor,
  undo,
} from "@/projects/fieldEditor";

import "./FieldEditorPanel.css";

/**
 * FieldEditorPanel — the layout mode's own instruments.
 *
 * Development only. It shows what is selected, what the arrangement
 * currently measures, and whether anything is broken — the same four rules
 * the field was solved against (projects/fieldCheck), read live while a
 * stone is dragged rather than discovered after a reload.
 *
 * The numbers are the point. Placing stones by eye is the fast part; knowing
 * the instant a name collides, a pebble touches its neighbour, or a weaker
 * project starts reading larger than a better one is what makes placing them
 * by eye safe.
 */

const RATE = 1000 / 12;   // the readout is for reading, not for animating

export function FieldEditorPanel() {
  const version = useSyncExternalStore(subscribeEditor, () => editorVersion, () => 0);
  const [tick, setTick] = useState(0);
  const [report, setReport] = useState<CheckResult | null>(null);
  // The panel sits over the field it is judging, so it can be got out of
  // the way without leaving the mode.
  const [hidden, setHidden] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [spacingPercent, setSpacingPercent] = useState("5");
  const spacingAmount = Number(spacingPercent);
  const validSpacing = spacingPercent.trim() !== "" && Number.isFinite(spacingAmount) && spacingAmount > 0;

  const orientation = fieldEditor.orientation;
  /** A stone held at the lens, read as a visitor would see it. */
  const openId = useFieldSelector((f) => f.selectedId);
  const viewport = useMemo(
    () => ({ width: window.innerWidth, height: window.innerHeight }),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "h" && (e.target as HTMLElement)?.tagName !== "INPUT") {
        setHidden((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Live measurement, a few times a second rather than every frame. */
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), RATE);
    return () => window.clearInterval(id);
  }, []);

  const live = useMemo(
    () =>
      checkField(
        Object.fromEntries(
          Object.entries(fieldEditor.layout).map(([k, v]) => [
            k,
            { x: v.x, z: v.z, scale: v.scale },
          ]),
        ),
        orientation,
        viewport,
        STANDING,
      ),
    // Re-measured on the interval tick and on every discrete change.
    [version, tick, orientation, viewport],
  );

  const selected = fieldEditor.selectedId;
  const placement = selected ? fieldEditor.layout[selected] : null;
  const record = selected ? PROJECT_OBJECTS.find((p) => p.id === selected) : null;

  const resizeCluster = useCallback((factor: number, resizeStones = true) => {
    if (!Number.isFinite(factor) || factor <= 0) return;
    const placements = Object.values(fieldEditor.layout);
    if (!placements.length || fieldEditor.dragging) return;
    // Reject the whole step at the limits so relative sizes stay intact.
    if (resizeStones && placements.some((p) => p.scale * factor < 0.05 || p.scale * factor > 4)) {
      setSaved("Cluster size limit reached. Undo or resize in the other direction.");
      return;
    }
    const cx = placements.reduce((sum, p) => sum + p.x, 0) / placements.length;
    const cz = placements.reduce((sum, p) => sum + p.z, 0) / placements.length;
    if (placements.some((p) => !Number.isFinite(cx + (p.x - cx) * factor) || !Number.isFinite(cz + (p.z - cz) * factor))) return;
    snapshot();
    for (const p of placements) {
      p.x = cx + (p.x - cx) * factor;
      p.z = cz + (p.z - cz) * factor;
      if (resizeStones) p.scale *= factor;
    }
    fieldEditor.dirty = true;
    setSaved(null);
    setReport(null);
    publishEditor();
  }, []);

  const sizeByStanding = useCallback(() => {
    snapshot();
    const sizes = sizesForStanding(
      Object.fromEntries(
        Object.entries(fieldEditor.layout).map(([k, v]) => [
          k,
          { x: v.x, z: v.z, scale: v.scale },
        ]),
      ),
      orientation,
      STANDING,
    );
    for (const [id, scale] of Object.entries(sizes)) {
      if (fieldEditor.layout[id]) fieldEditor.layout[id].scale = scale;
    }
    fieldEditor.dirty = true;
    publishEditor();
  }, [orientation]);

  const revert = useCallback(() => {
    snapshot();
    seedLayout(orientation, true);
    fieldEditor.dirty = false;
    publishEditor();
  }, [orientation]);

  const save = useCallback(async () => {
    setSaved("saving…");
    const body = {
      orientation,
      placements: Object.fromEntries(
        Object.entries(fieldEditor.layout).map(([id, p]) => [
          id,
          { x: round(p.x), z: round(p.z), scale: round(p.scale), spin: round(p.spin, 4) },
        ]),
      ),
    };
    try {
      const res = await fetch("/api/field-layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      fieldEditor.dirty = false;
      setSaved(`written to ${json.files.join(", ")}`);
      publishEditor();
    } catch (error) {
      setSaved(`failed: ${(error as Error).message}`);
    }
  }, [orientation]);

  const bad = (kind: string) => live.findings.some((f) => f.kind === kind);

  return (
    <aside
      className="fed"
      data-hidden={hidden ? "true" : "false"}
      aria-label="Field layout mode"
    >
      <header className="fed__head">
        <span className="fed__title">Layout</span>
        <span className="fed__sub">
          {orientation} · {PROJECT_OBJECTS.length} stones
          {fieldEditor.dirty ? " · unsaved" : ""}
        </span>
      </header>

      <div className="fed__shots">
        {EDITOR_SHOTS.map((shot) => (
          <button
            key={shot.vh}
            type="button"
            className="fed__shot"
            aria-current={fieldEditor.shotVh === shot.vh ? "true" : undefined}
            onClick={() => parkAt(shot.vh)}
          >
            {shot.label}
          </button>
        ))}
      </div>

      <dl className="fed__stats">
        <div data-bad={live.worstGap < THRESHOLDS.gap ? "true" : "false"}>
          <dt>pebbles</dt>
          <dd>{live.worstGap.toFixed(2)}u</dd>
        </div>
        <div data-bad={live.worstLabel < THRESHOLDS.label ? "true" : "false"}>
          <dt>names</dt>
          <dd>{Math.round(live.worstLabel)}px</dd>
        </div>
        <div data-bad={live.worstFrame < THRESHOLDS.frame ? "true" : "false"}>
          <dt>frame</dt>
          <dd>{Math.round(live.worstFrame)}px</dd>
        </div>
        <div data-bad={live.inversions > 0 ? "true" : "false"}>
          <dt>order</dt>
          <dd>{live.inversions === 0 ? "true" : `${live.inversions} off`}</dd>
        </div>
      </dl>

      {placement && record ? (
        <section className="fed__stone">
          <h2>{record.name}</h2>
          <p className="fed__row">
            <span>x {placement.x.toFixed(2)}</span>
            <span>z {placement.z.toFixed(2)}</span>
            <span>size {placement.scale.toFixed(2)}</span>
            <span>turn {Math.round((placement.spin * 180) / Math.PI)}°</span>
          </p>
          <p className="fed__stone-actions">
            <button
              type="button"
              onClick={() =>
                fieldActions.select(openId === selected ? null : selected)
              }
            >
              {openId === selected ? "Close" : "Open at lens"}
            </button>
            <button
              type="button"
              onClick={() => {
                fieldEditor.selectedId = null;
                publishEditor();
              }}
            >
              Deselect
            </button>
          </p>
          <p className="fed__hint">
            drag to move, shift-drag to swing round, alt-drag to turn, wheel to
            size. Arrows nudge, [ ] size, , . turn, ctrl with the arrows turns
            the whole cluster. Double-click a stone to open it; click empty
            space or press escape to let go. z undo, h hides this panel.
          </p>
        </section>
      ) : (
        <p className="fed__hint fed__hint--idle">
          Click a stone to pick it up, double-click to open it at the lens.
          Ctrl with the arrows turns the whole cluster.
        </p>
      )}

      <div className="fed__actions">
        <button type="button" onClick={() => resizeCluster(0.95)} disabled={!!openId}>
          Cluster −5%
        </button>
        <button type="button" onClick={() => resizeCluster(1.05)} disabled={!!openId}>
          Cluster +5%
        </button>
      </div>
      <p className="fed__hint">
        Resize all stones and their spacing together, keeping the cluster centred.
        Close any open stone first. Undo reverses each step.
      </p>

      <label className="fed__spacing">
        Spacing change (%)
        <input
          type="number"
          min="0"
          step="any"
          value={spacingPercent}
          onChange={(event) => setSpacingPercent(event.target.value)}
          aria-describedby="spacing-help"
        />
      </label>
      <div className="fed__actions">
        <button
          type="button"
          disabled={!!openId || !validSpacing || spacingAmount >= 100}
          onClick={() => resizeCluster(1 - spacingAmount / 100, false)}
        >
          Decrease spacing
        </button>
        <button
          type="button"
          disabled={!!openId || !validSpacing}
          onClick={() => resizeCluster(1 + spacingAmount / 100, false)}
        >
          Increase spacing
        </button>
      </div>
      <p className="fed__hint" id="spacing-help">
        Changes centre-to-centre distances by this percentage per click.
        Pebble sizes and rotations stay fixed. Decreases must be below 100%.
        Check all shots for overlaps or stones leaving the frame.
      </p>

      <div className="fed__actions">
        <button type="button" onClick={() => void save()} disabled={!fieldEditor.dirty}>
          Save to files
        </button>
        <button type="button" onClick={() => setReport(live)}>
          Check all shots
        </button>
        <button type="button" onClick={sizeByStanding}>
          Size by standing
        </button>
        <button type="button" onClick={() => undo()} disabled={!canUndo()}>
          Undo
        </button>
        <button type="button" onClick={revert}>
          Revert
        </button>
      </div>

      {saved ? <p className="fed__saved">{saved}</p> : null}

      {report ? (
        <section className="fed__report">
          <header>
            <span>{report.ok && report.inversions === 0 ? "All clear" : "Findings"}</span>
            <button type="button" onClick={() => setReport(null)}>
              ×
            </button>
          </header>
          {report.findings.length === 0 ? (
            <p>Nothing touches, collides, leaves the frame or reads out of order.</p>
          ) : (
            <ul>
              {report.findings.slice(0, 14).map((f, i) => (
                <li key={i} data-kind={f.kind}>
                  {f.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <details className="fed__order" open={bad("order")}>
        <summary>Size on screen, biggest first</summary>
        <ol>
          {live.apparent.map((a) => (
            <li key={a.id}>
              <span>{a.id}</span>
              <span>{Math.round(a.percent)}%</span>
            </li>
          ))}
        </ol>
      </details>
    </aside>
  );
}

function round(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/** Bumped on every discrete change so the panel re-reads the mutable state. */
let editorVersion = 0;
subscribeEditor(() => {
  editorVersion += 1;
});

/** Fills the live layout from whatever the files currently say. */
export function seedLayout(orientation: "landscape" | "portrait", force = false): void {
  // Fast Refresh can remount the editor while a layout is being arranged.
  // Keep that draft until it is saved; Revert explicitly requests a fresh seed.
  if (!force && fieldEditor.dirty && Object.keys(fieldEditor.layout).length > 0) return;
  const seeded: typeof fieldEditor.layout = {};
  for (const record of PROJECT_OBJECTS) {
    const c = getCoordinate(record.id);
    const p = orientation === "portrait" ? c.portrait : c.gathered;
    seeded[record.id] = {
      x: p[0],
      z: p[2],
      scale: stoneScale(record.id),
      spin: stoneSpin(record.id),
    };
  }
  fieldEditor.layout = seeded;
  fieldEditor.orientation = orientation;
}

export { currentPlacements };
