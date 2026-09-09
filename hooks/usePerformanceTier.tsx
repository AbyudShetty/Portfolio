"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Performance tiers — DESIGN.md §12.1.
 *
 *   T0 full      transmission materials, bloom, grain, DOF
 *   T1 <45fps    DOF off, bloom off
 *   T2 <30fps    far band loses transmission, grid simplified
 *   T3           no WebGL at all — static composition + DOM content
 *
 * Degradation is one-way within a session. A scene that oscillates between
 * tiers is more distracting than one that has quietly given up an effect.
 */
export type PerformanceTier = 0 | 1 | 2 | 3;

interface PerformanceContextValue {
  tier: PerformanceTier;
  reportFrame: (delta: number) => void;
}

const PerformanceContext = createContext<PerformanceContextValue>({
  tier: 0,
  reportFrame: () => {},
});

/**
 * Sampling window. Long enough that a couple of slow frames cannot decide the
 * verdict on their own.
 */
const WINDOW_MS = 2000;

/**
 * Anything slower than this is a *stall*, not a frame rate.
 *
 * A restored background tab, a garbage collection pause, an uncomposited
 * window, devtools opening, a long paint on a scroll step — all deliver a
 * single frame hundreds of milliseconds long. Averaged in, one of them drags
 * an otherwise perfect 60fps window below 30, and because degradation is
 * one-way the scene then permanently gives up content the machine was drawing
 * without difficulty. Stalls are discarded and the window restarts.
 */
const STALL_MS = 120;

/**
 * Start-up is not representative: the first seconds carry GLB parsing, shader
 * compilation for fifty-odd materials and the first paint of the whole scene.
 * Measuring there judges the load, not the machine.
 */
const WARMUP_MS = 3000;

export function PerformanceProvider({
  children,
  initialTier = 0,
}: {
  children: ReactNode;
  initialTier?: PerformanceTier;
}) {
  const [tier, setTier] = useState<PerformanceTier>(initialTier);
  const acc = useRef({ time: 0, frames: 0, warmup: 0, pending: 0 });

  // A tab that comes back has been parked, not slow. Its first frames say
  // nothing about the hardware, so the window starts again from empty.
  useEffect(() => {
    const reset = () => {
      acc.current.time = 0;
      acc.current.frames = 0;
      acc.current.pending = 0;
    };
    document.addEventListener("visibilitychange", reset);
    return () => document.removeEventListener("visibilitychange", reset);
  }, []);

  const reportFrame = useCallback((delta: number) => {
    const a = acc.current;
    const ms = delta * 1000;

    if (ms > STALL_MS) {
      a.time = 0;
      a.frames = 0;
      return;
    }

    if (a.warmup < WARMUP_MS) {
      a.warmup += ms;
      return;
    }

    a.time += ms;
    a.frames += 1;
    if (a.time < WINDOW_MS) return;

    const fps = (a.frames / a.time) * 1000;
    a.time = 0;
    a.frames = 0;

    const verdict = fps < 30 ? 2 : fps < 45 ? 1 : 0;
    const previous = a.pending;
    a.pending = verdict;

    // One bad window is a hitch; two consecutive bad windows is a machine
    // that cannot keep up. Degrade to the *milder* of the two, so a single
    // anomalous window can never skip a tier on its own.
    if (verdict === 0 || previous === 0) return;
    const confirmed = Math.min(previous, verdict) as PerformanceTier;

    setTier((current) => {
      if (current >= 2) return current;
      return Math.max(current, confirmed) as PerformanceTier;
    });
  }, []);

  const value = useMemo(() => ({ tier, reportFrame }), [tier, reportFrame]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * The tier as it stood when the caller mounted.
 *
 * Anything that decides *how much content exists* — how many stars, how many
 * pebbles — must read this rather than the live tier. Content that appears or
 * disappears part-way through a scroll reads as a rendering fault, which is
 * worse than the frame it was trying to save. Effect *quality* (bloom, depth
 * of field, transmission) can and should keep reading the live tier: turning
 * an effect down is unobtrusive in a way that deleting objects is not.
 */
export function useMountTier(): PerformanceTier {
  const live = useContext(PerformanceContext).tier;
  const frozen = useRef(live);
  return frozen.current;
}

export function usePerformanceTier(): PerformanceTier {
  return useContext(PerformanceContext).tier;
}

export function useFrameReporter() {
  return useContext(PerformanceContext).reportFrame;
}

/** Cheap capability probe used to decide on T3 before anything mounts. */
export function detectWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function prefersSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return Boolean(connection?.saveData);
}
