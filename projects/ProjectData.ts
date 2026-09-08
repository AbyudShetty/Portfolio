/**
 * ProjectData — the single structured data model for everything in the field.
 *
 * No project metadata may be hardcoded inside a React component. Every name,
 * status, stack entry and tier assignment originates here and is derived from
 * PROJECT_INVENTORY.md (final state, all user decisions applied).
 *
 * Excluded repositories (9) are intentionally absent and must never be added:
 * AbyudShetty, Ludo, Shell-Green-AI-Smart-Irrigation, Basic-chat-application,
 * neetcode-submissions, claude-code, system_prompts_leaks, IMU_Reconstruction,
 * Cloth_Cutting_Mesh_Manipulation.
 */

export type Domain =
  | "research"
  | "ai"
  | "graphics"
  | "xr"
  | "systems"
  | "product"
  | "experience";

/** Rank drives depth, scale, clarity and motion mass. DESIGN.md §7.1, §4.2, §6.1. */
export type Tier = "experience" | "featured-1" | "featured-2" | "secondary";

/**
 * The honesty system — DESIGN.md §8.5.
 *
 * Team projects are labelled as such without a commit ratio: the distinction
 * that matters to a reader is "this was collaborative", and a raw count
 * invites a precision the number does not actually carry. Commit statistics
 * are not displayed anywhere on the site.
 */
export type StatusKind =
  | "live"
  | "prototype"
  | "research"
  | "team"
  | "coursework";

export interface Status {
  kind: StatusKind;
  label: string;
}

export interface ProjectRecord {
  id: string;
  /** Display name in the index and detail views. */
  name: string;
  /**
   * Optional shorter form for the floating field label. A label in space has
   * no container to wrap in, so an over-long name simply collides with its
   * neighbour. Where a name is long enough to crowd the field, this is the
   * form the label uses; the full name is still what the list and the detail
   * view show.
   */
  shortName?: string;
  /** GitHub repository name, for later milestones. */
  repo: string;
  domain: Domain;
  tier: Tier;
  /** Employer or lab, where the work was done for one. */
  org?: string;
  /** One line, used by the label and later by the specimen panel. */
  summary: string;
  stack: string[];
  status: Status[];
  year: string;
}

export const PROJECTS: ProjectRecord[] = [
  // ── EXPERIENCE ────────────────────────────────────────────────────────────
  // Structurally distinct. Never rendered as a project object.
  {
    id: "slimevr",
    name: "IMU Motion Capture Pipeline",
    repo: "IMU-Reconstruction-SlimeVR",
    domain: "experience",
    tier: "experience",
    org: "CAVE",
    summary:
      "Ten body-worn ESP32 + MPU6050 nodes to a live 3D avatar: ESP-NOW to hubs, UDP to a Kotlin SlimeVR server solving IK, streamed over WebSocket to a Three.js viewer.",
    stack: ["ESP32", "ESP-NOW", "Kotlin/JVM", "Three.js", "Vite", "Docker"],
    status: [{ kind: "team", label: "TEAM PROJECT" }],
    year: "2026",
  },

  // ── TIER 1 — FEATURED ─────────────────────────────────────────────────────
  {
    id: "splats",
    name: "Gaussian Splat Viewer",
    repo: "3D-Visualization-of-Gaussian-Splats",
    domain: "xr",
    tier: "featured-1",
    summary:
      "Browser-based first-person viewer for Gaussian Splat captures of real campus locations. Pointer-lock navigation, configurable bounds, zero install.",
    stack: ["Three.js", "WebGL", "SPZ"],
    status: [{ kind: "live", label: "LIVE DEMO" }],
    year: "2026",
  },
  {
    id: "astronaut",
    name: "Astronaut Digital Twin",
    repo: "Astronaut_health_digital_twin",
    domain: "research",
    tier: "featured-1",
    summary:
      "Couples the Borbely sleep model to the Oman vestibular model through sleep-pressure-gated adaptation, then quantifies the excess mission risk that coupling produces.",
    stack: ["Python", "FastAPI", "BioGears", "Monte Carlo", "Three.js"],
    status: [{ kind: "team", label: "TEAM PROJECT" }],
    year: "2026",
  },
  {
    id: "aegis",
    name: "AEGIS",
    repo: "AEGIS",
    domain: "systems",
    tier: "featured-1",
    summary:
      "A deterministic financial control plane: transaction engine, explainable risk scoring, transaction-graph intelligence, incident correlation and an investigator control room.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React", "TypeScript"],
    status: [],
    year: "2026",
  },
  {
    id: "cardiotriage",
    name: "CardioTriage",
    repo: "CardioTriage",
    domain: "graphics",
    tier: "featured-1",
    summary:
      "Mass-casualty triage under time pressure, with every vital sign computed by the BioGears physiology engine rather than faked from a lookup table.",
    stack: ["React", "Three.js", "FastAPI", "WebSocket", "BioGears"],
    status: [{ kind: "team", label: "TEAM PROJECT" }],
    year: "2026",
  },
  {
    id: "kirana",
    name: "KiranaAI",
    repo: "KiranaAI",
    domain: "ai",
    tier: "featured-1",
    summary:
      "Voice and WhatsApp orders from Indian grocery stores turned into structured operations: multilingual ingestion, fuzzy SKU matching, a credit ledger and demand forecasting.",
    stack: ["FastAPI", "Gemini", "Sarvam STT", "MongoDB", "XGBoost", "React"],
    status: [{ kind: "team", label: "TEAM PROJECT" }],
    year: "2026",
  },

  // ── TIER 2 — FEATURED, TECHNICAL ──────────────────────────────────────────
  {
    id: "msgrouter",
    name: "Message Notification Router",
    shortName: "Message Router",
    repo: "Message-Notification-Router",
    domain: "ai",
    tier: "featured-2",
    summary:
      "Routes messages to notify, digest or mute using a transparent weighted scorecard. Language models extract features; they never make the final call.",
    stack: ["Python", "Vision models", "Sarvam STT", "244 tests"],
    status: [],
    year: "2026",
  },

  // ── TIER 3 — SECONDARY ────────────────────────────────────────────────────
  // Further away, never hidden. No "show more" (§14 rule 5).
  {
    id: "ipl",
    name: "Goated Auction",
    repo: "Mock-IPL-Auction",
    domain: "product",
    tier: "secondary",
    summary:
      "Real-time multiplayer IPL auction simulator with room sync, 200+ players and a drag-and-drop squad builder.",
    stack: ["React", "Vite", "Firebase RTDB"],
    status: [{ kind: "live", label: "LIVE DEMO" }],
    year: "2026",
  },
  {
    id: "miniraft",
    name: "MiniRAFT Drawing Board",
    shortName: "MiniRAFT Board",
    repo: "MiniRAFT-DrawingBoard",
    domain: "systems",
    tier: "secondary",
    summary:
      "A collaborative canvas backed by a from-scratch RAFT implementation — leader election, log replication and failover, visible live.",
    stack: ["Node.js", "WebSocket", "Docker"],
    status: [{ kind: "team", label: "TEAM PROJECT" }],
    year: "2026",
  },
  {
    id: "vrata",
    name: "VRATA",
    repo: "VRATA",
    domain: "research",
    tier: "secondary",
    summary:
      "Fleet-wide Weibull reliability estimated across mutually distrusting wind-farm operators using malicious-secure multi-party computation.",
    stack: ["MP-SPDZ", "MASCOT", "Python"],
    status: [
      { kind: "research", label: "PAPER IN PREPARATION" },
      { kind: "team", label: "TEAM PROJECT" },
    ],
    year: "2026",
  },
  {
    id: "realitycompiler",
    name: "Reality Compiler",
    repo: "Reality-Compiler",
    domain: "product",
    tier: "secondary",
    summary:
      "Compiles a business idea into a navigable operating simulation across thirteen domain engines.",
    stack: ["Next.js 15", "TypeScript", "Zustand", "React Flow"],
    status: [{ kind: "prototype", label: "PROTOTYPE · BACKEND STUBBED" }],
    year: "2026",
  },
  {
    id: "hcrm",
    name: "Healthcare Records System",
    shortName: "Healthcare Records",
    repo: "Healthcare-Appointment-and-Patient-Record-Manager",
    domain: "product",
    tier: "secondary",
    summary:
      "Patient records and appointments with role-based access, MFA, AES-256 encrypted records and a full unit/integration/load test suite.",
    stack: ["Django REST", "React", "PostgreSQL", "Celery"],
    status: [{ kind: "coursework", label: "ACADEMIC PROJECT" }],
    year: "2025",
  },
  {
    id: "medivault",
    name: "MediVault",
    repo: "Medivault",
    domain: "ai",
    tier: "secondary",
    summary:
      "Prescription digitisation through three OCR engines reconciled by an LLM extraction pass, over a normalised MySQL schema.",
    stack: ["Flask", "MySQL", "Tesseract", "Google Vision", "Groq"],
    status: [{ kind: "coursework", label: "ACADEMIC PROJECT" }],
    year: "2025",
  },
];

export const EXPERIENCE_ID = "slimevr";

export const PROJECT_OBJECTS = PROJECTS.filter(
  (p) => p.tier !== "experience",
);

export const EXPERIENCE_RECORD = PROJECTS.find(
  (p) => p.id === EXPERIENCE_ID,
)!;

export function getProject(id: string): ProjectRecord | undefined {
  return PROJECTS.find((p) => p.id === id);
}

/** Importance order — drives keyboard traversal and entrance stagger. §6.3, §12.4. */
const TIER_ORDER: Record<Tier, number> = {
  experience: 0,
  "featured-1": 1,
  "featured-2": 2,
  secondary: 3,
};

export const PROJECTS_BY_IMPORTANCE = [...PROJECTS].sort(
  (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier],
);
