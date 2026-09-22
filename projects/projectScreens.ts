import type { Plate } from "@/ui/PlateViewer";

/**
 * Screens — what a project looks like running, shown beside its stone.
 *
 * Keyed by project id; a project with no entry simply has no screen. A
 * project with several is shown as a small deck (ui/SpecimenScreen.tsx):
 * one screen toured, then the next, round again.
 *
 * Each screen carries a tour: the stops a slow camera makes across it while
 * it sits beside the stone, so the reader sees its parts at a readable size
 * without opening it. A stop is the point to centre, as fractions of the
 * image, and how far to lean in — 1 is the whole image fitted to the window.
 */

export interface TourStop {
  x: number;
  y: number;
  scale: number;
}

export interface ProjectScreen extends Plate {
  tour: TourStop[];
}

const WHOLE: TourStop = { x: 0.5, y: 0.5, scale: 1 };

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
        WHOLE,
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

  aegis: [
    {
      id: "aegis-control",
      code: "01",
      title: "The control room",
      caption:
        "The control plane at a glance: what has been persisted and what it scored, the active incidents, the financial-flow snapshot, and every transaction decision as it is made.",
      src: "/projects/aegis-1.webp",
      width: 1800,
      height: 1013,
      alt: "The AEGIS control plane: counters for 16 persisted transactions, 9 risk activities, 3 open incidents, 11 network nodes and 1,19,000 in flow volume; a priority queue of three high-severity incidents at risk 55; a financial flow snapshot graph; and a feed of transaction decisions marked block, review or approved.",
      screen: true,
      tour: [
        WHOLE,
        // What the system is holding, in numbers.
        { x: 0.34, y: 0.22, scale: 2 },
        // The incidents waiting on an analyst.
        { x: 0.36, y: 0.38, scale: 2.4 },
        // Every decision, with its risk score and verdict.
        { x: 0.36, y: 0.72, scale: 2.4 },
      ],
    },
    {
      id: "aegis-network",
      code: "02",
      title: "The money, as a graph",
      caption:
        "Accounts and transfers as a directed graph: senders fanning into a hub, the account under investigation, and a blocked transfer drawn as the edge it never became.",
      src: "/projects/aegis-2.webp",
      width: 1800,
      height: 1013,
      alt: "AEGIS network intelligence: a topology of eleven account nodes with amounts and risk scores, teal flow edges from four senders into a hub, orange investigation-focus nodes, a dashed red blocked transfer of 58,000, and a structural posture panel.",
      screen: true,
      tour: [
        WHOLE,
        // The senders, fanning in.
        { x: 0.42, y: 0.31, scale: 2.4 },
        // The account under investigation, and the transfer that was stopped.
        { x: 0.44, y: 0.54, scale: 2.4 },
        // What the graph itself says.
        { x: 0.88, y: 0.24, scale: 2.8 },
      ],
    },
    {
      id: "aegis-incidents",
      code: "03",
      title: "The investigation queue",
      caption:
        "Correlated evidence waiting on a decision: filters by severity, status and type, and three open cases each carrying the accounts and transactions behind them.",
      src: "/projects/aegis-3.webp",
      width: 1800,
      height: 1013,
      alt: "The AEGIS incident centre: severity, status and type filters, and three open high-severity cases — one suspicious account activity and two high-risk transactions — each at risk 55 with its account and transaction counts.",
      screen: true,
      // The page's foot is empty, so this one never pulls back to the whole.
      tour: [
        { x: 0.5, y: 0.3, scale: 1.45 },
        // The filters.
        { x: 0.34, y: 0.24, scale: 2.4 },
        // The cases themselves.
        { x: 0.38, y: 0.38, scale: 2.2 },
        // Their scores and dispositions.
        { x: 0.82, y: 0.38, scale: 2.4 },
      ],
    },
    {
      id: "aegis-simulation",
      code: "04",
      title: "The simulation lab",
      caption:
        "Seven repeatable scenarios — fan-in, fan-out, circular flow, account takeover — run through the real services, and the evidence each run leaves behind.",
      src: "/projects/aegis-4.webp",
      width: 1800,
      height: 1013,
      alt: "The AEGIS simulation lab: seven deterministic scenarios including normal day, high velocity, circular flow, fan out, fan in, account takeover and blocked transaction; and the result of a fan-in run with counts of accounts, transactions, approvals and blocks, and the events it persisted.",
      screen: true,
      tour: [
        WHOLE,
        // The scenarios that can be run.
        { x: 0.36, y: 0.27, scale: 2.2 },
        // What a run produced.
        { x: 0.4, y: 0.69, scale: 2.2 },
        // And the facts it left behind.
        { x: 0.4, y: 0.9, scale: 2.2 },
      ],
    },
  ],

  splats: [
    {
      id: "splats-entrance",
      code: "01",
      title: "The parking lot, walked",
      caption:
        "A campus parking lot captured as Gaussian splats and explored in first person in the browser — the controls and the live position read-out in the corners.",
      src: "/projects/splats-1.webp",
      width: 1800,
      height: 1012,
      alt: "First-person view inside the Gaussian splat capture of a campus parking lot: concrete pillars, traffic cones and a yellow barrier, with a controls panel top left and mouse sensitivity and position top right.",
      screen: true,
      // A photograph, not a dashboard — but the corners carry the controls,
      // so it opens wide, reads them, and walks in.
      tour: [
        WHOLE,
        // The controls, top left.
        { x: 0.12, y: 0.1, scale: 3 },
        // Into the lot.
        { x: 0.45, y: 0.55, scale: 1.9 },
      ],
    },
    {
      id: "splats-level",
      code: "02",
      title: "Further in",
      caption:
        "The same capture from deeper inside: the position read-out has moved, and the scene holds up as a photograph from a new angle.",
      src: "/projects/splats-2.webp",
      width: 1800,
      height: 1012,
      alt: "A second view deeper inside the parking lot capture: pillars, lane markings, a yellow barrier and cones, with the position read-out showing a new position.",
      screen: true,
      tour: [
        WHOLE,
        // The live position read-out, top right.
        { x: 0.9, y: 0.1, scale: 3 },
        // Down the far aisle.
        { x: 0.6, y: 0.5, scale: 1.9 },
      ],
    },
  ],

  astronaut: [
    {
      id: "astronaut-dashboard",
      code: "01",
      title: "Mission health",
      caption:
        "A seven-day mission run: the astronaut in the Endurance, live heart rate, fatigue and stress, the event log, the day-by-day timeline, and the risk the coupled models add up to.",
      src: "/projects/astronaut-1.webp",
      width: 1340,
      height: 1545,
      alt: "The Astronaut Digital Twin dashboard: mission and simulation controls, a 3D astronaut inside the Endurance, heart rate 87, fatigue 0.24, stress 0.47, SpO2 97.6, an event log, a seven-day mission timeline, fatigue, heart rate, sleep quality and risk charts, and mission risk analytics reading critical.",
      screen: true,
      tour: [
        WHOLE,
        // The twin in the Endurance, and the vitals under it.
        { x: 0.46, y: 0.17, scale: 2.4 },
        // Mission status and the event log.
        { x: 0.85, y: 0.22, scale: 2.6 },
        // Fatigue, heart rate, sleep and risk over the week.
        { x: 0.5, y: 0.53, scale: 2.8 },
      ],
    },
  ],

  cardiotriage: [
    {
      id: "cardiotriage-floor",
      code: "01",
      title: "Pressure ramp",
      caption:
        "Four patients, two seconds left: the queue, a beating heart for the patient in focus, their vitals from BioGears, and the interventions and budget that decide who is treated next.",
      src: "/projects/cardiotriage-1.webp",
      width: 1447,
      height: 1352,
      alt: "CardioTriage: a triage queue of four patients, a 3D heart for patient 4 with a pulse of 110, vitals panels (blood pressure 108/68, SpO2 79%), a patient arrival alert, response controls for IV fluid, oxygen and emergency procurement, and a budget and resource log.",
      screen: true,
      tour: [
        WHOLE,
        // The queue: four patients, and what is wrong with each.
        { x: 0.15, y: 0.3, scale: 2.2 },
        // The heart, beating for the patient in focus.
        { x: 0.5, y: 0.28, scale: 2.2 },
        // The vitals, and the patient who just arrived.
        { x: 0.85, y: 0.28, scale: 2.2 },
      ],
    },
  ],

  hcrm: [
    {
      id: "hcrm-overview",
      code: "01",
      title: "CareFlow, end to end",
      caption:
        "Who does what — patient, clinician, admin — the care journey from booking to an encrypted, audited record, and the stack underneath it.",
      src: "/projects/hcrm-1.webp",
      width: 1096,
      height: 1435,
      alt: "CareFlow overview: admin, patient and clinician roles; a six-step care journey from registering and booking to notification, consultation, AES-256 encrypted storage and an audit trail; and the stack — React, Django REST, PostgreSQL, JWT and role-based access, Redis and Celery, AES-256.",
      // A poster, read down the page.
      tour: [
        WHOLE,
        // The three roles.
        { x: 0.5, y: 0.22, scale: 2.2 },
        // The care journey, top half...
        { x: 0.5, y: 0.47, scale: 2.2 },
        // ...and the rest of it, to the audit trail.
        { x: 0.5, y: 0.69, scale: 2.2 },
        // The stack underneath — all six marks, so a little wider.
        { x: 0.5, y: 0.88, scale: 1.45 },
      ],
    },
  ],

  medivault: [
    {
      id: "medivault-dashboard",
      code: "01",
      title: "The vault",
      caption:
        "Upload a prescription to the three OCR engines, search by medicine or complaint, and see your history at a glance.",
      src: "/projects/medivault-1.webp",
      width: 1086,
      height: 1448,
      alt: "MediVault dashboard: upload a prescription with triple OCR and AI analysis, an AI-powered search box, medical statistics, and a prescription history card for a fever prescription.",
      screen: true,
      tour: [
        WHOLE,
        // Upload, and the three engines that read it.
        { x: 0.34, y: 0.21, scale: 2.2 },
        // Search, and what the history adds up to.
        { x: 0.34, y: 0.5, scale: 2.2 },
        // A prescription in the history.
        { x: 0.34, y: 0.8, scale: 2.2 },
      ],
    },
    {
      id: "medivault-prescription",
      code: "02",
      title: "A prescription, read",
      caption:
        "A handwritten prescription beside what was read out of it: the condition, the doctor, the date, and every medicine with its dosage and frequency.",
      src: "/projects/medivault-2.webp",
      width: 1299,
      height: 1143,
      alt: "A MediVault prescription page: the scanned handwritten prescription on the left, the extracted issue, doctor and dates on the right, and a table of four prescribed medicines with dosage and frequency.",
      screen: true,
      tour: [
        WHOLE,
        // The handwriting...
        { x: 0.27, y: 0.42, scale: 2 },
        // ...and what was read out of it.
        { x: 0.74, y: 0.32, scale: 2 },
        // Every medicine, with dosage and frequency — names first.
        { x: 0.3, y: 0.85, scale: 2 },
      ],
    },
    {
      id: "medivault-analytics",
      code: "03",
      title: "Search and analytics",
      caption:
        "Search across every prescription, and the analytics the MySQL schema computes — trends by month, most-used medicines through a stored procedure, and a nested query for complex prescriptions.",
      src: "/projects/medivault-3.webp",
      width: 1024,
      height: 1482,
      alt: "MediVault search results for fever, and the medical analytics dashboard: monthly prescription trends, most frequently used medicines, most common health issues and complex prescriptions, each labelled with the SQL behind it.",
      screen: true,
      tour: [
        WHOLE,
        // The search, and what it found — the page's top-left corner.
        { x: 0.3, y: 0.2, scale: 2.3 },
        // Most-used medicines, by stored procedure — names first.
        { x: 0.34, y: 0.53, scale: 2.3 },
        // Common issues, and the nested query under them.
        { x: 0.4, y: 0.85, scale: 2.3 },
      ],
    },
  ],
};

export function screensFor(id: string): ProjectScreen[] {
  return PROJECT_SCREENS[id] ?? [];
}

/**
 * The shape of the window a project's screens are shown in: the first
 * screen's own, but never narrower than square. A tall page in a tall window
 * made a sliver beside the stone; in a square one it is read the way a page
 * is — the tour leans in to its width and moves down it. Screens of another
 * shape are fitted inside.
 */
export function windowAspect(id: string): number {
  const first = screensFor(id)[0];
  if (!first) return 1;
  return Math.min(Math.max(first.width / first.height, 1), 1.8);
}
