import { screensFor } from "./projectScreens";

/**
 * screenLayout — the stone and its screen, composed as one pair.
 *
 * A stone with no screen sits dead centre at the lens (specimen.ts). A stone
 * with one steps left, and its screen stands to its right, so that the pair
 * — stone, gap, screen — is centred in the frame rather than the stone alone
 * with an empty left and a crowded right.
 *
 * One function answers for both halves: ProjectObject moves the stone by
 * `shift`, SpecimenScreen places the plate at `left`, and neither can drift
 * from the other. Returns null where the pair does not fit beside the step
 * arrows (a phone, a squarer window); the stone then stays centred and its
 * footer offers the screen instead.
 */

/**
 * Half the width of the stone at the lens, glass rim included, as a share of
 * the viewport height (the station is framed to the height). Measured off
 * centre, where perspective widens it: ~265px at a 674px-tall window.
 */
const STONE_HALF_WIDTH = 0.4;
/**
 * A stone sharing the frame is held a little smaller, so the pair clears the
 * step arrows and the section heading with room to spare.
 */
export const PAIRED_STONE_SCALE = 0.9;
/** Clear air between the stone and the screen, where the hairline runs. */
const GAP = 96;
/** Below this the screen would be a postage stamp. */
const MIN_WIDTH = 250;
const MAX_WIDTH = 640;
/** The screen and its caption keep to this share of the window's height. */
const MAX_HEIGHT = 0.64;

export interface ScreenLayout {
  /** The screen's width, px. */
  width: number;
  /** How far left of centre the stone's centre moves, px. */
  shift: number;
  /** The screen's left edge from the viewport's left, px. */
  left: number;
}

/** Room each side kept for the step arrow (SpecimenPanel.css) and air. */
function sideInset(viewportWidth: number): number {
  return Math.max(24, viewportWidth * 0.04) + 64;
}

export function screenLayout(
  projectId: string,
  viewportWidth: number,
  viewportHeight: number,
): ScreenLayout | null {
  const screen = screensFor(projectId)[0];
  if (!screen) return null;

  const stoneHalf = viewportHeight * STONE_HALF_WIDTH * PAIRED_STONE_SCALE;
  const available = viewportWidth - 2 * sideInset(viewportWidth);
  const byHeight =
    (viewportHeight * MAX_HEIGHT - 40) * (screen.width / screen.height);
  const width = Math.min(MAX_WIDTH, byHeight, available - 2 * stoneHalf - GAP);
  if (width < MIN_WIDTH) return null;

  // Centre the pair: the stone's centre moves left by half of what stands
  // to its right.
  const shift = (GAP + width) / 2;
  const left = viewportWidth / 2 - shift + stoneHalf + GAP;
  return { width, shift, left };
}
