"use client";

import {
  createContext,
  useCallback,
  useContext,
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

const WINDOW_MS = 2000;

export function PerformanceProvider({
  children,
  initialTier = 0,
}: {
  children: ReactNode;
  initialTier?: PerformanceTier;
}) {
  const [tier, setTier] = useState<PerformanceTier>(initialTier);
  const acc = useRef({ time: 0, frames: 0 });

  const reportFrame = useCallback((delta: number) => {
    const a = acc.current;
    a.time += delta * 1000;
    a.frames += 1;
    if (a.time < WINDOW_MS) return;

    const fps = (a.frames / a.time) * 1000;
    a.time = 0;
    a.frames = 0;

    setTier((current) => {
      if (current >= 2) return current;
      if (fps < 30) return 2;
      if (fps < 45) return Math.max(current, 1) as PerformanceTier;
      return current;
    });
  }, []);

  const value = useMemo(() => ({ tier, reportFrame }), [tier, reportFrame]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
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
