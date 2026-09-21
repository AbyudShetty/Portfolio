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
  | "simulation"
  | "xr"
  | "systems"
  | "product"
  | "certification"
  | "toolkit"
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
  | "coursework"
  | "certificate"
  | "toolkit";

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
  /** GitHub repository name. Absent for certifications. */
  repo?: string;
  domain: Domain;
  tier: Tier;
  /** Employer or lab, where the work was done for one. */
  org?: string;
  /** One line, used by the label and the specimen panel's standfirst. */
  summary: string;
  /**
   * Four points — what is engraved on the stone.
   *
   * Written to be technically true and still readable by someone outside the
   * field: each project opens with what it does for a person, then how. The
   * engraving shrinks its type to fit, so these stay short enough to be read
   * at the lens, and the repository is one click away for the rest. Every
   * point here is traceable to PROJECT_INVENTORY.md.
   */
  points: string[];
  /**
   * A longer telling, as points, for a record that gets a full section of its
   * own rather than a stone — today only the Experience. Technical, but
   * written so someone outside the field can follow what happens end to end.
   */
  narrative?: string[];
  /** A deployed instance, where one exists and its URL is known. */
  demo?: string;
  /** The certificate itself, for a certification stone. */
  certificate?: string;
  /**
   * Absent until the field gathers, rather than drifting through the hero,
   * the About and the Experience with everything else.
   */
  arrivesWithField?: boolean;
  /**
   * The colour of the warm light the stone catches. Every stone is the same
   * graphite glass lit by the scene's orange bounce; a stone with a tint
   * catches that light in this hue instead — the certifications, in a
   * yellow-orange. Its engraved accents and field label follow.
   */
  tint?: string;
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
    org: "CaveLabs",
    summary:
      "Ten body-worn ESP32 + MPU6050 nodes to a live 3D avatar: ESP-NOW to hubs, UDP to a Kotlin SlimeVR server solving IK, streamed over WebSocket to a Three.js viewer.",
    narrative: [
      "Full-body motion capture, built from the hardware up: ten sensor nodes, each an ESP32 microcontroller paired with an MPU6050 motion sensor, worn on the body.",
      "Every node measures how its limb moves and turns, and reports to two hubs over ESP-NOW — a lightweight wireless link that needs no Wi-Fi router.",
      "The hubs forward those readings over UDP to a SlimeVR server written in Kotlin, which solves inverse kinematics: ten sensors in, the pose of a whole skeleton out.",
      "That pose streams over WebSocket to a Three.js viewer in the browser, where a rigged 3D character moves as the wearer moves.",
      "The entire pipeline is containerised with Docker, so it goes from hardware to avatar with a single command.",
    ],
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
      "Walk through real places in your browser: a campus parking lot and an amphitheatre, captured as Gaussian Splats.",
      "Gaussian splatting rebuilds a scene from a cloud of tiny coloured blobs instead of polygons, so it looks like a photograph.",
      "First-person controls with pointer lock and configurable bounds, so you explore freely without walking out of the scene.",
      "Loads compact .spz capture files and runs entirely in the browser — no install, no plugin.",
    ],
    stack: ["Three.js", "WebGL", "SPZ"],
    status: [{ kind: "live", label: "LIVE DEMO" }],
    demo: "https://parkinglot-3dgs.vercel.app/",
    year: "2026",
  },
  {
    id: "astronaut",
    name: "Astronaut Digital Twin",
    repo: "Astronaut_health_digital_twin",
    domain: "simulation",
    tier: "featured-1",
    summary:
      "Couples the Borbely sleep model to the Oman vestibular model through sleep-pressure-gated adaptation, then quantifies the excess mission risk that coupling produces.",
    points: [
      "Models how sleep loss and space motion sickness affect astronauts — and how one feeds into the other.",
      "Couples two classic 1982 models, Borbély's sleep model and Oman's motion-sickness model, that tools usually run apart.",
      "A new mechanism lets sleep pressure slow the body's adaptation; counterfactual runs measure the extra mission risk.",
      "Monte Carlo runs cover how people differ, BioGears adds heart responses, and a Three.js dashboard shows it all.",
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
      "A simulated control room for financial operations: it generates activity, scores risk and helps investigate what looks wrong.",
      "Every risk score is explainable — you see why a transaction was flagged, not just that it was.",
      "Maps how accounts and transactions connect as a graph, then groups related evidence into incidents.",
      "A modular Spring Boot backend on PostgreSQL with a React dashboard, openly scoped as a showcase rather than a live fraud system.",
    ],
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React", "TypeScript"],
    status: [],
    year: "2026",
  },
  {
    id: "cardiotriage",
    name: "CardioTriage",
    repo: "CardioTriage",
    domain: "simulation",
    tier: "featured-1",
    summary:
      "Mass-casualty triage under time pressure, with every vital sign computed by the BioGears physiology engine rather than faked from a lookup table.",
    points: [
      "A mass-casualty triage game: a queue of patients, 120 seconds, and every call about who gets treated first.",
      "Vital signs aren't scripted — the BioGears physiology engine computes them live, so patients respond like real bodies.",
      "Choose the wrong patient or the wrong intervention, and the penalty that follows is physiologically accurate.",
      "A React and Three.js front end with a beating 3D heart, fed by a FastAPI backend over WebSocket.",
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
      "Lets small Indian grocery stores run on voice notes and WhatsApp: orders arrive as speech, photos or text.",
      "Understands ten-plus languages, then matches loosely named items to the right products with fuzzy matching.",
      "Keeps a credit ledger for customers who buy on account, with escalating AI voice reminders when payments are overdue.",
      "Forecasts demand with XGBoost, across three FastAPI services using Gemini, Groq, Sarvam and Cloud Vision.",
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
      "Decides whether a message should notify you now, wait for a digest, or stay muted.",
      "Reads text, images and voice notes — including Hindi, English and code-mixed speech.",
      "Language models only extract signals; a transparent weighted scorecard makes the final call, so every decision can be explained.",
      "Weighs sender history, relationship strength and risk, backed by 244 passing tests.",
    ],
    stack: ["Python", "Vision models", "Sarvam STT", "244 tests"],
    status: [],
    year: "2026",
  },

  {
    id: "affordability",
    name: "Buy or Wait?",
    repo: "affordability-forecast-agent",
    domain: "ai",
    tier: "featured-2",
    summary:
      "An affordability agent that rebuilds a user's finances from transactions, messages and scanned documents, forecasts 90 days ahead and picks a safe way to pay.",
    points: [
      "Answers a deceptively hard question: can I actually afford this right now?",
      "Rebuilds a person's finances from transactions, messages and scanned bills, then forecasts their balance 90 days ahead.",
      "Recommends paying in full, in two parts, in instalments, waiting or declining — every number from a deterministic engine.",
      "Models only extract facts, each re-checked against its source. The full 250-request run cost $2.68.",
    ],
    stack: ["Python", "Claude Haiku 4.5", "Claude Sonnet 5", "103 tests"],
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
      "A live multiplayer IPL auction: join a room with a code and bid against friends in real time.",
      "Over 200 real players with career stats, so every bid is an actual squad decision.",
      "Drag-and-drop squad building, undo, a second round for unsold players, and analytics once the auction ends.",
      "Built on React and Firebase Realtime Database, and deployed live.",
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
      "A shared whiteboard that keeps working even when one of its servers goes down.",
      "Underneath is RAFT consensus, written from scratch: three nodes elect a leader and replicate every change.",
      "A live dashboard shows each node's role, term and commit progress as it happens.",
      "Kill a node mid-drawing and watch the cluster elect a new leader and carry on.",
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
      "Wind-farm operators want to know how reliable their turbines are, but won't share failure data with each other.",
      "VRATA computes a shared, fleet-wide reliability estimate without anyone revealing their raw data.",
      "It uses malicious-secure multi-party computation (MP-SPDZ, MASCOT) around a statistical Weibull fit.",
      "The result matches the centralised answer to within 0.0022%. The paper is written and not yet published.",
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
      "Turns a business idea — say, a coffee shop in Koramangala — into a simulation you can explore before committing.",
      "Thirteen engines cover location, market, competition, pricing, hiring, suppliers, risk and more.",
      "An orchestration screen shows the engines compiling in parallel; a workspace then maps the pipeline as a graph.",
      "An early build: the flow runs on a scripted front-end clock and the engines are still stubbed.",
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
      "A healthcare system for booking appointments and keeping patient records safe.",
      "Role-based access and multi-factor login decide who sees what, and records are encrypted with AES-256.",
      "Celery sends appointment reminders, and every action is written to an audit log.",
      "Tested at every level — unit, integration, system and Locust load tests — behind two CI workflows.",
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
      "Turns photos of prescriptions into structured, searchable records.",
      "Reads each one with three OCR engines — Tesseract, EasyOCR and Google Vision — and compares what they see.",
      "An LLM pass reconciles where the engines disagree into one clean record.",
      "Stored in a normalised MySQL schema, with triggers and stored procedures doing real work.",
    ],
    stack: ["Flask", "MySQL", "Tesseract", "Google Vision", "Groq"],
    status: [{ kind: "coursework", label: "ACADEMIC PROJECT" }],
    year: "2025",
  },

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  // Stones of their own, to the right of the projects, in a warm tint. Course
  // details from the certificates and NPTEL's published syllabi.
  {
    id: "dlcert",
    name: "Deep Learning",
    domain: "certification",
    tier: "featured-2",
    org: "NPTEL · IIT Ropar",
    summary:
      "NPTEL certification, Elite: a 12-week IIT Ropar course by Prof. Sudarshan Iyengar and Prof. Mitesh Khapra (IIT Madras), Jul–Oct 2025.",
    points: [
      "A 12-week NPTEL course from IIT Ropar, taught by Prof. Sudarshan Iyengar and Prof. Mitesh Khapra — completed with an Elite certificate.",
      "From a single perceptron up: feedforward networks, backpropagation, and the optimisers that train them — momentum, Nesterov, AdaGrad, RMSProp, Adam.",
      "What keeps deep networks learning well: autoencoders, regularisation and dropout, better initialisation and batch normalisation.",
      "The architectures behind vision and language: CNNs from LeNet to ResNet, RNNs, LSTMs and GRUs, encoder–decoders and attention.",
    ],
    certificate:
      "https://drive.google.com/file/d/19EUQoyp5-8SgQ_4tzsvh_pBF7fGvFWpR/view?usp=sharing",
    tint: "#E3A33B",
    stack: ["NPTEL", "IIT Ropar", "Elite", "Jul–Oct 2025"],
    status: [{ kind: "certificate", label: "NPTEL · ELITE" }],
    year: "2025",
  },
  {
    id: "llmcert",
    name: "Introduction to Large Language Models",
    shortName: "Intro to LLMs",
    domain: "certification",
    tier: "featured-2",
    org: "NPTEL · IIT Delhi & IIT Bombay",
    summary:
      "NPTEL certification: a 12-week course by Prof. Tanmoy Chakraborty (IIT Delhi) and Prof. Soumen Chakrabarti (IIT Bombay), Jul–Oct 2025.",
    points: [
      "A 12-week NPTEL course by Prof. Tanmoy Chakraborty (IIT Delhi) and Prof. Soumen Chakrabarti (IIT Bombay).",
      "How language models got here: n-gram models, word vectors like Word2Vec and GloVe, and sequence-to-sequence models with attention.",
      "The Transformer in depth — self-attention, positional embeddings, tokenisation — and the families built on it: BERT, GPT and T5.",
      "Making them useful: prompting and chain-of-thought, instruction tuning, alignment with human feedback (RLHF) and efficient fine-tuning with LoRA.",
    ],
    certificate:
      "https://drive.google.com/file/d/1-38n9DKv9I1ZTkRb0JyHjq2DPTB4w3JK/view?usp=sharing",
    tint: "#E3A33B",
    stack: ["NPTEL", "IIT Delhi", "IIT Bombay", "Jul–Oct 2025"],
    status: [{ kind: "certificate", label: "NPTEL · CERTIFIED" }],
    year: "2025",
  },

  // ── TOOLKIT ───────────────────────────────────────────────────────────────
  // Not a project: what every other stone in the field is made of, given a
  // stone of its own so the field can say it without a caption laid over it.
  // Blue, where the work is orange.
  {
    id: "toolkit",
    name: "Toolkit",
    domain: "toolkit",
    tier: "featured-2",
    summary:
      "What the work in this field is built with: languages, backend, AI/ML, 3D, systems, and how it is tested and shipped.",
    points: [
      "Languages — Python, Java, TypeScript, Kotlin, SQL, C++.",
      "Backend — Spring Boot, Django REST, FastAPI, PostgreSQL, Celery, WebSockets.",
      "AI / ML — PyTorch, scikit-learn, OpenCV, XGBoost, LLM APIs, NumPy and Pandas.",
      "3D & XR — Three.js, React Three Fiber, OpenGL, Unity, Blender.",
      "Systems — distributed systems, RAFT, secure MPC, ESP32 and ESP-NOW, quaternions and IK.",
      "Testing & DevOps — JUnit 5, PyTest, Locust, Docker, CI/CD, Linux.",
    ],
    tint: "#6FA8C7",
    // Blue among the drifting graphite stones raises a question the
    // Experience never answers, so this one waits for the field.
    arrivesWithField: true,
    stack: [],
    status: [{ kind: "toolkit", label: "THE FIELD'S OWN GROUND" }],
    year: "2026",
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

export function repoUrl(record: ProjectRecord): string | null {
  return record.repo ? `https://github.com/${GITHUB_USER}/${record.repo}` : null;
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
