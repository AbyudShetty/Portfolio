/**
 * viewport — how the scene adapts to the shape of the screen.
 *
 * Every camera move was composed for a landscape window. Two things carry
 * that composition to a phone held upright:
 *
 *   fov       The vertical field of view widens as the screen narrows, so a
 *             portrait frame is not a thin vertical slice of the landscape
 *             one. Landscape windows (1.5 and wider) are left exactly as
 *             composed.
 *   portrait  A 0–1 weight for keyframes that carry a portrait framing of
 *             their own (cameraChoreography.ts): the astronaut above the
 *             Experience text instead of beside it, the field pulled back so
 *             all thirteen stones fit across.
 */

const COMPOSED_VFOV = 42;
const COMPOSED_ASPECT = 1.5;

export function fovForAspect(aspect: number): number {
  const stretch = Math.max(1, COMPOSED_ASPECT / Math.max(0.1, aspect));
  // Not fully compensated (exponent < 1): matching the landscape's horizontal
  // view exactly would need ~110° vertically, which bends everything at the
  // top and bottom of the frame.
  const t = Math.tan((COMPOSED_VFOV * Math.PI) / 360) * Math.pow(stretch, 0.75);
  return (Math.atan(t) * 360) / Math.PI;
}

export function portraitMix(aspect: number): number {
  return Math.min(1, Math.max(0, (1.3 - aspect) / 0.55));
}
