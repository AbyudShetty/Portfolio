import type { Plate } from "@/ui/PlateViewer";

/**
 * Screens — what a project looks like running, shown beside its stone.
 *
 * Keyed by project id; a project with no entry simply has no screen. Each
 * screen carries a tour: the stops a slow camera makes across the screenshot
 * while it sits beside the stone (ui/SpecimenScreen.tsx), so the reader sees
 * its parts at a readable size without opening it. Stops are the point to
 * centre, as fractions of the image, and how far to lean in.
 */

export interface TourStop {
  x: number;
  y: number;
  scale: number;
}

export interface ProjectScreen extends Plate {
  tour: TourStop[];
}

export const PROJECT_SCREENS: Record<string, ProjectScreen[]> = {
  ipl: [
    {
      id: "ipl-floor",
      code: "01",
      title: "The auction floor",
      caption:
        "The player on the block, every team's purse and squad, the auction's running statistics and the sets still to come — one screen, kept in sync for everyone in the room.",
      src: "/projects/goated-auction.webp",
      width: 1607,
      height: 1442,
      alt: "Goated Auction: MS Dhoni up in the Wicket Keeper set, four teams with purses and squads, auction statistics (most expensive Virat Kohli at 16 crore, 11 players sold), and the upcoming batsman and fast bowler sets.",
      screen: true,
      tour: [
        { x: 0.5, y: 0.5, scale: 1 },
        // The title and the player on the block.
        { x: 0.5, y: 0.17, scale: 2.5 },
        // The teams — yours marked, purses and squads.
        { x: 0.63, y: 0.37, scale: 2.5 },
        // The running statistics.
        { x: 0.5, y: 0.6, scale: 2.5 },
        // The sets still to come.
        { x: 0.36, y: 0.74, scale: 2.5 },
      ],
    },
  ],
};

export function screensFor(id: string): ProjectScreen[] {
  return PROJECT_SCREENS[id] ?? [];
}
