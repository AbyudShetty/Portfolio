/**
 * standing — how much of the field each project is worth, and the size that
 * follows from it.
 *
 * One ordered list, best first. Everything else is derived, so re-ranking a
 * project means moving one line.
 *
 * Size is the signal, and it is spent on how large a stone reads *on screen*,
 * not how large it is in the world. Those differ: the field is deep enough
 * that perspective alone changes a stone's apparent size by half, so a stone
 * placed at the back must be physically larger to read the same as one in
 * front. Each scale below is therefore its wanted screen size multiplied by
 * its distance from the inspection camera — which is why the numbers look
 * unordered here, and why the stones are every size rather than three.
 *
 * The effect is a cluster of pebbles of all different sizes, scattered the
 * way stones on a beach are, with no front-to-back sorting — and yet the
 * best work is unmistakably the biggest thing on screen, from the top of the
 * list to the bottom: 100% down to 53%.
 *
 * The places themselves are in projectCoordinates.ts. Which stone lies
 * where was then solved against these sizes, so that no two pebbles touch,
 * the labels stay apart, and the sizes are scattered through the cluster
 * rather than sorted front to back.
 */

/** The order the field is ranked in, best first. */
export const STANDING: readonly string[] = [
  "quorum",
  "anchormatch",
  "tyretrace",
  "aegis",
  "affordability",
  "ghostaudit",
  "splats",
  "astronaut",
  "cardiotriage",
  "kirana",
  "msgrouter",
  "vrata",
  "miniraft",
  "ipl",
  "medivault",
  "realitycompiler",
  "hcrm",
  "dlcert",
  "llmcert",
  "toolkit",
];

/** Wanted screen size x distance from the lens. See the note above. */
const STONE_SCALE: Record<string, number> = {
  // Set by hand in the layout mode. Numbered by standing.
  tyretrace: 0.88,          // 1
  ghostaudit: 0.88,         // 2
  splats: 0.66,             // 3
  astronaut: 0.79,          // 4
  aegis: 0.92,              // 5
  cardiotriage: 0.61,       // 6
  kirana: 0.73,             // 7
  quorum: 1.14,             // 8
  msgrouter: 0.95,          // 9
  affordability: 1.01,      // 10
  anchormatch: 0.93,        // 11
  ipl: 0.89,                // 12
  miniraft: 0.61,           // 13
  vrata: 0.68,              // 14
  realitycompiler: 0.74,    // 15
  hcrm: 0.68,               // 16
  medivault: 0.68,          // 17
  dlcert: 0.63,             // 18
  llmcert: 0.63,            // 19
  toolkit: 0.61,            // 20
};

/**
 * How far each stone is turned about its own axis in the field, in radians.
 *
 * The pebble shapes themselves are baked with a settle angle at build time
 * (projectGeometry.ts), so this is the turn on top of that — set by hand in
 * the layout mode. It is cancelled as a stone presents to the lens, or every
 * engraving would arrive crooked (ProjectObject).
 */
const STONE_SPIN: Record<string, number> = {
  // Radians, on top of each pebble's own baked settle angle.
  tyretrace: 1.9897,        // 1
  aegis: 4.66,              // 2
  quorum: 2.9321,           // 3
  affordability: 11.205,    // 4
  miniraft: 2.042,          // 5
  vrata: 0.8901,            // 6
  llmcert: 2.042,           // 7
};

/** The scale a stone is drawn at; 1 for anything not in the field. */
export function stoneScale(id: string): number {
  return STONE_SCALE[id] ?? 1;
}

/** Place in the order, 0 first. -1 for anything not in the field. */
export function stoneSpin(id: string): number {
  return STONE_SPIN[id] ?? 0;
}

export function standingOf(id: string): number {
  return STANDING.indexOf(id);
}
