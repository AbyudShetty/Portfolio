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
  /** One line, used by the label and the specimen panel's standfirst. */
  summary: string;
  /**
   * Two or three points — what the specimen panel actually says.
   *
   * Deliberately short. A stone held up to the lens is not a case study; it
   * has room for the shape of the thing and the one detail worth knowing,
   * and the repository is one click away for anyone who wants the rest.
   * Every point here is traceable to PROJECT_INVENTORY.md.
   */
  points: string[];
  /** A deployed instance, where one exists and its URL is known. */
  demo?: string;
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
    points: [
      "Ten body-worn ESP32 + MPU6050 nodes speak ESP-NOW to two hubs, which forward over UDP.",
      "A Kotlin/JVM SlimeVR server solves the IK skeleton and streams it on WebSocket to a Three.js viewer.",
      "Dockerised to a one-command setup, so the whole pipeline comes up together.",
    ],
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
    points: [
      "Renders .spz Gaussian Splat captures of real campus locations — a parking lot and an amphitheatre.",
      "Pointer-lock first-person navigation, with configurable scene bounds.",
      "Runs as a web page. No install, no plugin, no native build.",
    ],
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
    points: [
      "Couples the Borbély two-process sleep model to the Oman vestibular model — two 1982 papers that existing tools simulate separately.",
      "Adds sleep-pressure-gated vestibular adaptation, then runs counterfactuals to quantify the extra mission risk that coupling produces.",
      "Monte Carlo over inter-individual variability, with BioGears supplying cardiovascular response on discrete events.",
    ],
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
    points: [
      "A modular Spring Boot monolith: transaction engine, explainable risk scoring, temporal behavioural intelligence and graph intelligence.",
      "Correlates scored events into incidents and exposes the whole investigation through a control-room UI.",
      "Its own README scopes it honestly as a showcase MVP, not a production fraud system.",
    ],
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
    points: [
      "Mass-casualty triage against a 120-second clock, with every vital sign computed by the BioGears physiology engine.",
      "Wrong interventions carry physiologically accurate penalties rather than scripted ones.",
      "React and Three.js over an async FastAPI backend, with state streamed on WebSocket.",
    ],
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
    points: [
      "Turns voice, image and WhatsApp orders in ten-plus languages into structured operations across three FastAPI services.",
      "Fuzzy SKU matching, a credit ledger, and XGBoost demand forecasting.",
      "Gemini and Groq extract, Sarvam handles speech, Cloud Vision reads the images.",
    ],
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
    points: [
      "Routes each message to notify, digest or mute using a transparent weighted scorecard.",
      "Language models extract features only — they never make the final call, so every decision stays explainable.",
      "Separate perception experts for text, image and voice, behind 244 passing tests.",
    ],
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
    points: [
      "Live multiplayer cricket auction: room codes, real-time sync, and 200+ players with career stats.",
      "Drag-and-drop squad building, undo, an unsold second-round queue and auction analytics.",
      "Deployed and shareable, on Firebase Realtime Database.",
    ],
    demo: "https://goated-auction-2b1d8.web.app",
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
    points: [
      "A collaborative whiteboard whose real subject is the consensus layer underneath it.",
      "Leader election, log replication and heartbeats, written from scratch across three replica nodes.",
      "A dashboard shows each node's role, term and commit index; killing a node triggers re-election on screen.",
    ],
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
    points: [
      "Estimates fleet-wide Weibull reliability across wind-farm operators who never share raw failure data.",
      "Malicious-secure multi-party computation (MP-SPDZ, MASCOT) wrapped around a Newton-Raphson MLE solver.",
      "Matches the centralised ground truth to within 0.0022%. The paper is written and not yet published.",
    ],
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
    points: [
      "Compiles a business idea into a navigable operating simulation across thirteen domain engines.",
      "An orchestration screen animates the engines compiling in parallel, then a workspace presents the pipeline graph.",
      "An early build: the pipeline runs on a scripted front-end clock and the engine services are still stubbed.",
    ],
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
    points: [
      "Patient records and appointments with role-based access, MFA and AES-256 encrypted records.",
      "Celery-driven reminders and audit logging over Django REST and PostgreSQL.",
      "Carries unit, integration, system and Locust load tests behind two CI workflows.",
    ],
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
    points: [
      "Digitises prescriptions with three OCR engines — Tesseract, EasyOCR and Google Vision.",
      "An LLM pass reconciles where they disagree into one structured record.",
      "A normalised MySQL schema, with triggers and stored procedures doing real work.",
    ],
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

/** Every repository in this inventory lives under this account. */
export const GITHUB_USER = "AbyudShetty";

export function repoUrl(record: ProjectRecord): string {
  return `https://github.com/${GITHUB_USER}/${record.repo}`;
}

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
