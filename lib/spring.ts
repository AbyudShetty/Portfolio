/**
 * A small semi-implicit spring integrator.
 *
 * Used instead of tweened durations so that motion carries mass: DESIGN.md §6.1
 * makes weight proportional to importance, which is how the field communicates
 * hierarchy without labels. Framer Motion drives DOM chrome; this drives the
 * per-frame 3D values where allocating objects each frame would be wasteful.
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

/** Frames can stall (tab switch, GC). Clamp dt or the spring explodes. */
const MAX_DT = 1 / 30;

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  private config: SpringConfig;

  constructor(initial: number, config: SpringConfig) {
    this.value = initial;
    this.target = initial;
    this.config = config;
  }

  setConfig(config: SpringConfig) {
    this.config = config;
  }

  /** Jump immediately — used for reduced motion and for camera cuts. */
  set(value: number) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  step(dt: number): number {
    const h = Math.min(dt, MAX_DT);
    const { stiffness, damping, mass } = this.config;
    const force = -stiffness * (this.value - this.target);
    const damper = -damping * this.velocity;
    this.velocity += ((force + damper) / mass) * h;
    this.value += this.velocity * h;
    return this.value;
  }

  get settled(): boolean {
    return (
      Math.abs(this.velocity) < 0.001 &&
      Math.abs(this.target - this.value) < 0.001
    );
  }
}

export class Spring3 {
  readonly x: Spring;
  readonly y: Spring;
  readonly z: Spring;

  constructor(initial: readonly [number, number, number], config: SpringConfig) {
    this.x = new Spring(initial[0], config);
    this.y = new Spring(initial[1], config);
    this.z = new Spring(initial[2], config);
  }

  setTarget(t: readonly [number, number, number]) {
    this.x.target = t[0];
    this.y.target = t[1];
    this.z.target = t[2];
  }

  set(v: readonly [number, number, number]) {
    this.x.set(v[0]);
    this.y.set(v[1]);
    this.z.set(v[2]);
  }

  setConfig(config: SpringConfig) {
    this.x.setConfig(config);
    this.y.setConfig(config);
    this.z.setConfig(config);
  }

  step(dt: number) {
    this.x.step(dt);
    this.y.step(dt);
    this.z.step(dt);
  }
}

/** Frame-rate independent lerp, for values that don't need mass (cursor, pan). */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
