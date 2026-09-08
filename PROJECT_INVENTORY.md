# Project Inventory — github.com/AbyudShetty

Research pass over all 22 repositories on the GitHub profile, via the GitHub API (repo metadata, commit authorship, file trees, and READMEs). No source code was modified. Commit-authorship checks were used specifically to distinguish "forked and untouched" from "forked because it's a team project hosted on a teammate's account, with real authored contributions."

> **User decision (confirmed, round 1):** the following 7 repositories are excluded from the portfolio outright: `AbyudShetty` (profile repo), `Ludo`, `Shell-Green-AI-Smart-Irrigation`, `Basic-chat-application`, `neetcode-submissions`, `claude-code`, `system_prompts_leaks`.
>
> **User decision (confirmed, round 2):**
> - `IMU-Reconstruction-SlimeVR` is **not a portfolio project** — it is the user's internship work and must be represented separately as an **EXPERIENCE / Internship** entry, not placed in the normal project hierarchy or any project domain grouping. It keeps a special, visually distinct treatment in the eventual 3D site (e.g., a larger anchored node, its own timeline/location, or another unique spatial treatment) rather than sitting among the project bubbles.
> - `IMU_Reconstruction` is **excluded completely** — something tried during the internship that the user does not want represented anywhere (not featured, not secondary, not internship, not companion, not pending).
> - `Cloth_Cutting_Mesh_Manipulation` is **excluded completely** — no longer pending/open, removed outright.
>
> Excluded count is now 9: the original 7 plus `IMU_Reconstruction` and `Cloth_Cutting_Mesh_Manipulation`. The remaining 12 project repositories stay open for consideration; `IMU-Reconstruction-SlimeVR` sits in its own Experience category, outside both the excluded list and the project hierarchy. Repos still carrying open questions (`Reality-Compiler`, `Astronaut_health_digital_twin`, `VRATA`) still need input, not exclusion, unless the user says otherwise.

---

## 1. Full Repository Table

| # | Repository | Fork? | Author's commits / total | What it does (verified) | Category |
|---|---|---|---|---|---|
| 1 | **AEGIS** | No | n/a (single-author) | Simulated financial fraud/risk "control plane": transaction engine, explainable risk scoring, graph/network analysis of transactions, incident correlation, investigator UI | Systems / Software Engineering |
| 2 | **CardioTriage** | Fork (from thorOdinson16) | 3 / 13 | Real-time mass-casualty triage hackathon game; vitals driven by the BioGears physiology engine (not lookup tables), 3D beating-heart viewport (Three.js), FastAPI + WebSocket backend | Computer Graphics / Simulation / AI |
| 3 | **Message-Notification-Router** | No | n/a | Deterministic (non-LLM-decision) WhatsApp notification triage system: multimodal perception (text/image/voice experts), semantic feature extraction, weighted scorecard decision engine, 244 passing tests | AI / Systems |
| 4 | **Mock-IPL-Auction** ("Goated Auction") | No | n/a | Real-time multiplayer cricket-auction simulator, React+Vite, Firebase Realtime DB sync, drag-and-drop team builder, live deployed app | Software Engineering |
| 5 | **3D-Visualization-of-Gaussian-Splats** | No | n/a | Browser-based first-person Gaussian Splat viewer (WASD + mouse-look) for `.spz` scenes of real campus locations (parking lot, amphitheater), pointer-lock controls, configurable boundaries | Computer Graphics / XR |
| 6 | **IMU-Reconstruction-SlimeVR** | Fork (thorOdinson16 / BioMechanicalTwin org) | 9 / 20 | Full-body mocap pipeline: 10 custom ESP32+MPU6050 IMU nodes → ESP-NOW → hubs → SlimeVR server (Kotlin, IK skeleton solving) → Three.js viewer driving a Mixamo-rigged avatar; Dockerized | **EXPERIENCE / Internship** (not a project-domain category) |
| 7 | **IMU_Reconstruction** | Fork (thorOdinson16) | 22 / 49 | Earlier/companion native C++ IMU visualizer: OpenGL/GLFW renderer, custom quaternion calibration across 8 sensor-orientation modes, UDP protocol, glTF skinned model rendering | **EXCLUDED** (per user decision) |
| 8 | **KiranaAI** | Fork (AKPranav1 / Kirana-orchestrator) | 16 / 66 | Enterprise automation platform for Indian grocery stores: 3 microservices (FastAPI), voice/image/text order ingestion (Gemini, Sarvam STT, Cloud Vision OCR), fuzzy multilingual SKU matching, credit-ledger + debt-collection ("Vasooli") voice escalation via ElevenLabs TTS, XGBoost demand forecasting, React dashboard | AI / Software Engineering |
| 9 | **VRATA** | Fork (thorOdinson16) | 1 / 36 | Privacy-preserving federated statistics research project: malicious-secure MPC (MASCOT protocol, MP-SPDZ) to jointly estimate Weibull reliability parameters across wind-turbine fleets without sharing raw data; includes baselines, results, apparent publication writeup | Systems / Research |
| 10 | **MiniRAFT-DrawingBoard** | Fork (thorOdinson16) | 2 / 15 | Real-time collaborative whiteboard backed by a from-scratch RAFT consensus implementation (leader election, log replication, heartbeats) with a live cluster-health dashboard visualizing node roles/terms | Systems / Distributed Computing |
| 11 | **Astronaut_health_digital_twin** | Fork (thorOdinson16) | 5 / 16 | Research-grade coupled sleep-fatigue/space-motion-sickness digital twin (Borbely + Oman models coupled via a novel mechanism), Monte Carlo analysis, BioGears cardiovascular integration, literature-cited parameters, Three.js Interstellar-themed 3D dashboard | AI / Research / Computer Graphics — **Featured** (updated after README added) |
| 12 | **Healthcare-Appointment-and-Patient-Record-Manager** | No | n/a | Full Django REST + React healthcare records system: RBAC auth w/ MFA, AES-256 encrypted records, appointment booking, Celery notifications, audit logs; extensive test suite (unit/integration/system/performance/Locust load tests) and CI/CD workflows — reads as a structured coursework/assessment project (has a `project-evaluation.yml` CI workflow) | Software Engineering |
| 13 | **Medivault** | No | n/a | Flask + MySQL prescription manager with triple OCR (Tesseract/EasyOCR/Google Vision) and Groq/Llama-based extraction of prescription data, basic CRUD + analytics UI | Software Engineering / AI |
| 14 | **Ludo** | No | n/a | Full-stack Ludo board game: Node.js/Express backend, MongoDB leaderboard, vanilla JS game logic/UI, auth | Software Engineering |
| 15 | **Reality-Compiler** | No | n/a | "Reality Compiler" — turns a business idea into a navigable operating simulation via 13 pluggable domain "engines"; self-documented as an early-build presentation prototype with a scripted front-end orchestration flow and stubbed backend | Software Engineering — **Secondary** (updated after README added) |
| 16 | **Shell-Green-AI-Smart-Irrigation** | No | n/a | Jupyter notebook project (evidently a Shell-sponsored hackathon/challenge): sensor-driven irrigation optimization | AI / Coursework |
| 17 | **Cloth_Cutting_Mesh_Manipulation** | Fork (thorOdinson16) | 0 / 4 | Progressive C++ cloth-cutting simulator: mass-spring physics → full mesh re-triangulation/topology splitting → half-edge experimental version; no authored commits by this account | **EXCLUDED** (per user decision) |
| 18 | **Basic-chat-application** | Fork (pizz-beep) | 0 / 3 | Raw-socket Python chat room (coursework networking exercise); no authored commits | Systems / Coursework |
| 19 | **neetcode-submissions** | No | 12 / 12 | Auto-synced NeetCode.io interview-prep submissions (generated by NeetCode's GitHub integration, not hand-built) | Other |
| 20 | **claude-code** | Fork (codeaashu/claude-code — a third-party clone project, not the official Anthropic tool) | 0 / n/a | Untouched fork, 0 authored commits | Other |
| 21 | **system_prompts_leaks** | Fork (asgeirtj) | 0 / n/a | Untouched reference fork of a public system-prompt archive | Other |
| 22 | **AbyudShetty** (profile README repo) | No | n/a | GitHub profile README ("CS undergrad building intelligent systems across AI, ML, computer vision, immersive tech, simulations") | Other (meta) |

---

## 2. Per-Project Detail

### AEGIS
- **Does:** A deterministic financial-operations simulation/control-plane. Generates synthetic financial activity, scores transaction risk explainably, builds a transaction-relationship graph, correlates evidence into "incidents," and exposes the whole investigation workflow through a control-room UI.
- **Tech:** Java 21, Spring Boot 3.5 (modular monolith: Transaction Engine / Risk Engine / Temporal Behavioral Intelligence / Graph Intelligence / Simulation), PostgreSQL 16, React + TypeScript frontend, Docker Compose.
- **Evidence:** README explicitly states scope/limits ("not presented as a real-world fraud detection system... demo controls to showcase engineering"); 274-file tree with a real Spring Boot module structure (`account/controller`, etc.) and four committed UI screenshots (`docs/assets/*.png`) matching the described control room, incident investigation, network intelligence, and simulation lab views.
- **Originality:** Original, single-author, actively developed (created and last pushed within the same day — Aug 2026).
- **Portfolio value:** High. Full-stack, architecturally deliberate ("showcase MVP" framing shows self-awareness about scope), has real screenshots, graph visualization is inherently visual.
- **Status: Featured.**

### CardioTriage
- **Does:** A mass-casualty triage command-center game where patient vitals are computed live by the BioGears physiology engine rather than faked — wrong interventions apply physiologically accurate penalties. 120-second real-time sessions.
- **Tech:** React + Vite + TypeScript + Three.js frontend (PatientQueue, HeartViewport, ECGOverlay), FastAPI/Python async backend, WebSocket + REST.
- **Evidence:** README architecture diagram matches file tree; repo contains an actual 3D "beating heart" GLB model with full texture set under `frontend/public/beat-heart/`. Built as a hackathon project per README. 3/13 commits authored by user — a real, substantive contribution on a small team.
- **Originality:** Team hackathon project (forked from teammate thorOdinson16), partial authorship.
- **Portfolio value:** High — a literal animated 3D heart driven by a physiology engine is an unusually strong visual centerpiece for a 3D-themed portfolio.
- **Status: Featured.**

### Message-Notification-Router
- **Does:** Routes WhatsApp-style messages into Notify/Digest/Mute using a transparent weighted scorecard (semantic signals, sender history, business reputation, relationship strength, risk) rather than letting an LLM make the final call — LLMs are used only for feature extraction upstream.
- **Tech:** Python 3.11, modular pipeline (perception experts for text/image/voice, NVIDIA vision models, Sarvam STT for Hindi/English/code-mixed speech), deterministic decision engine.
- **Evidence:** README states "244 passing tests"; file tree shows a genuinely modular architecture (`context/`, `decision/`, `perception/`, `history/`, `models/`, `evaluation/`) matching the README's diagram exactly.
- **Originality:** Original, single-author.
- **Portfolio value:** High for demonstrating AI-systems judgment (deliberately keeping the LLM out of the final decision loop is a notable design choice) — less visual, better suited to a technical deep-dive page than a 3D hero.
- **Status: Featured (as a technical/AI-engineering showcase, not a visual one).**

### Mock-IPL-Auction ("Goated Auction")
- **Does:** A live multiplayer cricket-auction simulator — real-time room sync, 200+ real IPL players with career stats, drag-and-drop squad building, undo, auction analytics.
- **Tech:** React + Vite, Firebase Realtime Database, Firebase Hosting.
- **Evidence:** **Has a live deployed demo** (`goated-auction-2b1d8.web.app`, linked directly in the README). Feature list is long and specific (room codes, second-round unsold queue, stale-room cleanup) suggesting real usage/iteration, not a stub.
- **Originality:** Original, single-author, actively maintained (pushed Sept 2026).
- **Portfolio value:** Medium-high — it's a real, live, shareable product with a fun domain, good for demonstrating full-stack/real-time engineering, but domain (fantasy cricket auction) is less "impressive tech" than the AI/graphics projects.
- **Status: Secondary** (good "here's a live thing you can click" entry, not a 3D centerpiece).

### 3D-Visualization-of-Gaussian-Splats
- **Does:** A browser-based, pointer-locked, first-person Gaussian Splat viewer for real-world captured scenes (a university parking lot and amphitheater, captured as `.spz` files).
- **Tech:** Three.js / WebGL, browser-native, zero-install.
- **Evidence:** README documents two shipped variants (adjustable-boundary vs. hardcoded), includes an actual demo screenshot (`image.png`) and real `.spz` scene files in the repo; most recently pushed repo on the account (Sept 2026).
- **Originality:** Original, single-author.
- **Portfolio value:** Very high for a "3D developer portfolio" specifically — this is literally a Gaussian-splat 3D renderer, directly thematically aligned, and could plausibly be embedded/linked as an interactive exhibit.
- **Status: Featured** (strong candidate for direct embedding or a prominent 3D showcase link).

### IMU-Reconstruction-SlimeVR — EXPERIENCE / INTERNSHIP (not a normal project)
- **Does:** A from-scratch full-body motion-capture pipeline: 10 custom ESP32+MPU6050 sensor nodes talk ESP-NOW to 2 hubs, which forward over UDP to a SlimeVR server (Kotlin/JVM) doing IK skeleton solving, streamed via WebSocket to a Three.js viewer animating a Mixamo-rigged 3D character.
- **Tech:** ESP32 firmware, Kotlin/JVM, Three.js + Vite, Docker Compose.
- **Evidence:** README architecture diagram matches; Dockerized one-command setup documented. 9/20 commits authored — real, meaningful contribution to a hardware+software team project.
- **Originality:** Team project (forked from thorOdinson16 / BioMechanicalTwin org) — per the user, this is their internship work.
- **Portfolio value:** Very high, but **not to be presented as a project bubble.** Per user decision, this is classified as **EXPERIENCE → Internship** and requires distinct spatial/visual treatment in the eventual 3D site (larger anchored node, its own timeline/location marker, or another unique treatment that sets it apart from the project hierarchy). The verified technical details and contribution above are retained for use in that experience entry.
- **Status: EXPERIENCE / Internship** (excluded from the normal Featured/Secondary project hierarchy by user decision).

### IMU_Reconstruction — EXCLUDED
- **Does:** An earlier native C++ IMU visualizer built during the same internship — OpenGL/GLFW rendering of a glTF/Mixamo-rigged skeleton driven by raw UDP quaternion packets from body-worn IMUs, with an 8-mode calibration system for different physical sensor mountings.
- **Tech:** C++17, OpenGL/GLFW/GLUT, glm, custom UDP protocol.
- **Originality:** Team project (forked from thorOdinson16); 22/49 commits authored.
- **Status: EXCLUDED per user decision.** The user has stated this was something tried during the internship that they do not want represented anywhere in the portfolio — not as featured, secondary, internship, companion, or pending. No further recommendation is made for this repository.

### KiranaAI
- **Does:** An enterprise-grade automation platform turning voice/WhatsApp orders from Indian grocery stores into structured data: multilingual (10+ languages) voice/image/text ingestion, fuzzy SKU matching, a credit ledger ("Khata") with escalating AI-voice debt-collection calls ("Vasooli"), and ML-based demand forecasting.
- **Tech:** 3 FastAPI microservices, Google Gemini + Groq LLMs, Sarvam STT, Google Cloud Vision OCR, MongoDB, XGBoost, ElevenLabs TTS, React+TS+Tailwind frontend.
- **Evidence:** README is a genuine internal documentation doc (service ports, DB schema, integration table) rather than marketing copy; 16/66 commits authored — real, sizeable contribution to a substantial system.
- **Originality:** Team project (forked from AKPranav1 / Kirana-orchestrator).
- **Portfolio value:** Very high — this is the most feature-complete, real-world-applicable AI system in the list (genuine microservice architecture, multiple ML/AI integrations, a real business problem).
- **Status: Featured.**

### VRATA
- **Does:** Research project computing fleet-wide Weibull reliability parameters for wind turbines across multiple mutually-distrusting operators using malicious-secure multi-party computation, so no raw failure data is ever shared. Reports the MPC result matches centralized ground truth to within 0.0022%/0.00001%, beating 4 baselines by ~2 orders of magnitude.
- **Tech:** MP-SPDZ (MASCOT protocol), Python driver/orchestration, Newton-Raphson MLE solver.
- **Evidence:** README documents a full baselines/results section and a "Publication" section; the user has confirmed **the paper is written but not yet published** — this is research in preparation, not a completed publication. Despite only 1/36 authored commits, the project itself is technically the most sophisticated (cryptographic MPC + applied statistics) in the inventory.
- **Originality:** Team research project (forked from thorOdinson16); minimal individual commit share.
- **Portfolio value:** Medium — technically impressive and worth mentioning, but must be framed as "manuscript in preparation / under review," not as a published result. Thin personal authorship share and no visual/UI surface also make it a poor fit for a 3D-visual showcase; better suited to a text case-study or "research" callout.
- **Status: Secondary** (mention with honest framing of role/contribution, do not present as a solo build).

### MiniRAFT-DrawingBoard
- **Does:** A collaborative real-time whiteboard where the interesting part is the infrastructure underneath: a from-scratch RAFT consensus implementation (leader election, log replication, heartbeats) coordinating 3 replica nodes, with a live dashboard showing each node's role/term/commit-index, and fault tolerance demoed by killing a node.
- **Tech:** Node.js, WebSockets, Docker Compose, vanilla JS canvas frontend.
- **Evidence:** README architecture/port table matches file tree; explicitly documents fault-tolerance behavior (auto re-election on node failure). Only 2/15 commits authored, though.
- **Originality:** Team project (forked from thorOdinson16); light individual contribution.
- **Portfolio value:** Medium — the RAFT-from-scratch angle is a strong distributed-systems credibility signal, and the live cluster dashboard is visually demonstrable, but low personal commit share should be disclosed.
- **Status: Secondary.**

### Astronaut_health_digital_twin
- **Does:** *(Description updated after the user added a full README to their fork — this supersedes the earlier inferred description.)* A research-grade physiological digital twin titled "A Service-Oriented Hybrid Digital Twin for Coupled Sleep-Fatigue and Space Motion Sickness." Its core scientific contribution is coupling two independently-published physiological models that prior tools treat separately: the Borbely two-process sleep model (1982) and the Oman vestibular-mismatch model (1982). It implements a novel mechanism — sleep-pressure-gated vestibular adaptation — and runs counterfactual analysis to quantify how much extra motion-sickness/fatigue risk the coupling produces versus treating the systems independently.
- **Tech:** Python/FastAPI backend (coupled ODE physics core, `EventScheduler` for stochastic events, Monte Carlo engine with inter-individual variability sampling, BioGears integration for high-fidelity cardiovascular responses on discrete events); Jinja2 + vanilla-JS frontend with a **Three.js, Interstellar-themed 3D dashboard** (`Astronaut.glb`, `Endurance.glb`, `BlackHole.glb` models, camera modes between ship-exterior and astronaut-interior, click-to-inspect raycaster on head/torso/lower-body regions, risk-driven lighting/tremor effects, Web Audio risk-transition tones); Groq (Llama 3.3 70B) and Anthropic Claude integration for natural-language risk explanation; in-browser PDF report generation with a flight-surgeon signature block.
- **Evidence:** The (now user-supplied) README is unusually rigorous for this inventory: explicit differential equations for each model, a parameter table with literature citations (Borbely 1982, Oman 1982, Barger et al. 2014, Daan et al. 1984, Flynn-Evans et al. 2016, Heer & Paloski 2006, NASA-STD-3001, and others), a dedicated "Known Limitations" section written in the voice of a researcher preparing for journal submission (flags the counterfactual approximation, uncited nonlinear exponents, an unconstrained free parameter `w_s`, and the need for validation against real ISS actigraphy data). This reads as active, self-aware research work, not a demo. 5/16 commits authored by this account.
- **Originality:** Team research project (forked from thorOdinson16). Its relationship to CardioTriage is now clarified by the README: **it is not the same simulation base or platform CardioTriage was built on** — the two are separate BioGears-integrated physiological-simulation projects (different scientific domains: astronaut sleep/vestibular coupling here vs. mass-casualty triage there), most likely sharing a collaborator/team pattern and a general "BioGears-backed physiological simulation" theme rather than shared code.
- **Portfolio value:** High. The combination of a genuinely novel scientific coupling mechanism, literature-cited parameters, an honest limitations section, and a fully realized 3D Interstellar-style dashboard (not just an ODE solver with no face) makes this one of the strongest technical+visual pairings in the inventory.
- **Status: Featured** (promoted from Secondary now that scope is confirmed — see Section 5).

### Healthcare-Appointment-and-Patient-Record-Manager
- **Does:** A full healthcare records/appointment system with RBAC, MFA, AES-256 record encryption, Celery-based reminders, and audit logging.
- **Tech:** Django REST Framework, React + Redux + Material-UI, PostgreSQL, Celery/Redis.
- **Evidence:** Extensive, specific test suite (unit, integration, system, and Locust-based performance tests) and two CI workflows, one literally named `project-evaluation.yml` — strong signal this was built for/graded by an academic or bootcamp assessment framework rather than as a personal product idea.
- **Originality:** Appears to be structured coursework/assessment (single push, comprehensive scaffolding delivered essentially at once).
- **Portfolio value:** Medium — demonstrates enterprise engineering discipline (testing, CI, security) well, but reads as coursework rather than a personal initiative; not visual.
- **Status: Secondary.**

### Medivault
- **Does:** A prescription-management webapp using triple OCR (Tesseract + EasyOCR + Google Vision) reconciled by a Groq/Llama-3.3 call to extract structured prescription data, with CRUD + analytics over a MySQL schema (triggers, stored procedures).
- **Tech:** Flask, MySQL, Tesseract/EasyOCR/Google Vision, Groq API.
- **Evidence:** README is implementation-accurate (specific setup steps, exact file paths like `pytesseract.pytesseract.tesseract_cmd`); file tree confirms a small, single-file Flask app (`app.py`) rather than a larger framework — consistent with a focused course/database project.
- **Originality:** Original but small-scale; likely a DBMS-course project (emphasis on triggers/stored procedures/3NF in README).
- **Portfolio value:** Low-medium — interesting OCR+LLM combo, but small footprint and coursework framing.
- **Status: Secondary.**

### Ludo
- **Does:** A full-stack multiplayer Ludo board game with auth, turn logic, and a MongoDB leaderboard.
- **Tech:** Node.js/Express, MongoDB, vanilla JavaScript, HTML/CSS.
- **Evidence:** File tree confirms a working client/server split (`server/routes/{auth,game,leaderboard,profile}.js`, `public/js/Ludo.js`).
- **Originality:** Original, but an older/introductory full-stack exercise (created Nov 2024).
- **Portfolio value:** Low — a solid intro full-stack project but not distinctive next to the AI/graphics/systems work.
- **Status: Exclude** (or fold into a brief "earlier projects" list rather than a standalone entry).

### Reality-Compiler
- **Does:** *(Description updated after the user added a full README — this supersedes the earlier "cannot describe without guessing" entry.)* "Reality Compiler" turns a real-world business idea (e.g. "Open a specialty coffee shop in Koramangala") into a navigable operating simulation before the user commits to it. A landing screen captures the idea; an orchestration screen animates a network of 13 domain "engines" (location, market, competition, demographics, pricing, financial, hiring, inventory, supplier, marketing, risk, timeline, idea-parser, reality-simulator) "compiling" in parallel; a workspace dashboard then presents a pipeline graph, a modules grid (Foundation/Operations/Validation), and simulation status.
- **Tech:** Next.js 15 (App Router) + React 19, TypeScript, Tailwind CSS, Zustand, Framer Motion, TanStack Query, React Flow (pipeline graph visualization), Recharts, Radix UI.
- **Evidence:** The README is self-disclosed and unusually candid about the project's actual state: **"Status: Early build / presentation prototype. The compilation pipeline currently runs on a scripted, front-end-only clock; engine services are stubbed and ready to be wired up to a real backend."** It also ships an explicit Roadmap (wire engines to a real backend/LLM pipeline, persist simulations, replace the scripted clock with real progress events, flesh out placeholder charts) — i.e., the user has been transparent that this is a front-end presentation shell over stubbed logic, not a working product yet.
- **Originality:** Original, single-author, very recent (July 2026).
- **Portfolio value:** Medium. The "idea → live orchestration → workspace" flow and the React-Flow pipeline visualization are a genuinely interesting, on-theme visual concept for a 3D/motion-forward portfolio, but per the project's own documented status it should be presented honestly as an early-stage interaction-design prototype (a real, running front-end demo) rather than as a functioning product.
- **Status: Secondary** — include with an explicit "presentation prototype, backend not yet implemented" caveat, not as a completed system.

### Shell-Green-AI-Smart-Irrigation
- **Does:** A smart irrigation system using sensor data and automation to optimize water usage (per its one-line README); implemented as a Jupyter notebook.
- **Tech:** Jupyter Notebook.
- **Evidence:** Repo name and thin README (`Shell...`) strongly suggest a Shell-sponsored hackathon/challenge submission; single notebook, no application layer.
- **Originality:** Coursework/hackathon exercise.
- **Portfolio value:** Low — thin documentation, notebook-only, no visual or deployable surface.
- **Status: Exclude.**

### Cloth_Cutting_Mesh_Manipulation — EXCLUDED
- **Does:** A progressive series of C++ cloth-cutting simulators: basic spring-only cutting → full mesh re-triangulation with topology splitting and BFS-based physical separation → an experimental half-edge-based rewrite → a diagnostic/debug build.
- **Tech:** C++, mass-spring physics, computational geometry (edge-intersection detection, re-triangulation, half-edge structures).
- **Originality:** Team project (forked from thorOdinson16); 0 commits authored by this account.
- **Status: EXCLUDED per user decision.** No longer pending or open — removed outright from the portfolio, domain groupings, technical-distinctiveness lists, authorship caveats, and open questions.

### Basic-chat-application
- **Does:** A raw-socket Python chat room supporting multiple users, file exchange, and audio messages — an explicit networking-course exercise per its own README ("helped us gain a deeper understanding of socket programming").
- **Tech:** Python sockets.
- **Evidence:** README self-describes as a course learning exercise; 0 commits authored.
- **Originality:** Coursework, no verified individual contribution.
- **Status: Exclude.**

### neetcode-submissions
- **Does:** Auto-synced interview-prep problem solutions, generated automatically by NeetCode.io's GitHub integration — not hand-built or hand-organized.
- **Status: Exclude** (not a project; a practice-problem log).

### claude-code
- **Does:** An unmodified fork of a third-party ("codeaashu") Claude Code clone/demo. Not the official Anthropic tool. 0 authored commits.
- **Status: Exclude.**

### system_prompts_leaks
- **Does:** An unmodified fork of a public archive of leaked LLM system prompts. 0 authored commits.
- **Status: Exclude.**

### AbyudShetty (profile repo)
- **Does:** The GitHub profile README itself (bio + tech-stack badges). Not a project.
- **Status: Exclude from inventory as a "project," but its bio text is useful raw material for the portfolio's About/Hero copy** ("CS undergrad building intelligent systems across AI, machine learning, computer vision, immersive tech, and simulations").

---

## 3. Domain Grouping

**EXPERIENCE (separate from project domains — special treatment, not a bubble in the grid)**
- IMU-Reconstruction-SlimeVR — internship work; see dedicated Experience entry in Section 5.

**AI / ML**
- KiranaAI (featured) — multilingual voice/vision LLM pipeline + forecasting
- Message-Notification-Router (featured) — deterministic multimodal decision engine
- Astronaut_health_digital_twin (featured) — coupled-ODE physiological research model, Monte Carlo, BioGears integration
- Medivault (secondary) — OCR + LLM extraction

**Computer Vision / Perception**
- KiranaAI (OCR, image order ingestion) — see AI/ML
- Message-Notification-Router (image expert / NVIDIA vision models) — see AI/ML

**XR / VR / Motion Capture**
- 3D-Visualization-of-Gaussian-Splats (featured) — first-person Gaussian Splat viewer
- (IMU-Reconstruction-SlimeVR is motion-capture work but is classified as EXPERIENCE, not a domain project — see above)

**Computer Graphics**
- CardioTriage (featured) — physiologically-driven 3D heart viewport
- Astronaut_health_digital_twin (featured) — Three.js Interstellar-themed 3D dashboard (Endurance ship, black hole, astronaut model, click-to-inspect regions)
- (3D-Viz above also belongs here)

**Systems / Distributed Computing**
- AEGIS (featured) — modular monolith, graph analysis engine
- MiniRAFT-DrawingBoard (secondary) — RAFT consensus from scratch
- VRATA (secondary) — malicious-secure MPC, applied cryptography (paper in preparation, not yet published)

**Software Engineering (full-stack/product)**
- Mock-IPL-Auction (secondary) — live real-time multiplayer app
- Healthcare-Appointment-and-Patient-Record-Manager (secondary) — enterprise Django/React, testing/CI discipline
- Reality-Compiler (secondary) — idea-to-simulation orchestration UI; self-documented as an early-build presentation prototype with a stubbed backend

**Excluded (confirmed by user)**
- AbyudShetty (profile repo), Ludo, Shell-Green-AI-Smart-Irrigation, Basic-chat-application, neetcode-submissions, claude-code, system_prompts_leaks, IMU_Reconstruction, Cloth_Cutting_Mesh_Manipulation

---

## 4. Cross-Cutting Findings

**Projects with live/running demos**
- Mock-IPL-Auction — live at `goated-auction-2b1d8.web.app`
- 3D-Visualization-of-Gaussian-Splats — runs entirely client-side in-browser, embeddable

**Projects with real screenshots/visual assets already in-repo**
- AEGIS — 4 committed UI screenshots (control room, incidents, network, simulation)
- 3D-Visualization-of-Gaussian-Splats — demo screenshot + real `.spz` capture files
- CardioTriage — full 3D heart model + textures
- Astronaut_health_digital_twin — 3D GLB assets (astronaut, station, black hole) + audio

**Most technically distinctive implementations**
- Astronaut_health_digital_twin — novel coupling of two independently-published physiological models (Borbely sleep + Oman vestibular), with literature-cited parameters and a self-aware limitations/validation section
- VRATA — malicious-secure MPC for cross-party statistics (rare, research-grade; paper in preparation)
- MiniRAFT-DrawingBoard — RAFT consensus written from scratch
- AEGIS — genuinely multi-module financial simulation architecture

**Projects that would visually benefit most from a 3D presentation layer**
1. 3D-Visualization-of-Gaussian-Splats — is itself a 3D renderer; could be embedded directly as a portfolio exhibit
2. Astronaut_health_digital_twin — full Three.js Interstellar-themed 3D scene (Endurance ship, black hole, astronaut model) with click-to-inspect regions and risk-driven lighting
3. CardioTriage — animated 3D heart driven by real physiology data
4. AEGIS — the transaction-network graph is a natural fit for a 3D force-directed graph visualization
5. Reality-Compiler — the animated multi-engine "compiling" orchestration screen and React Flow pipeline graph are visually striking, though the project is a front-end presentation prototype (backend stubbed) and should be labeled as such

*(IMU-Reconstruction-SlimeVR also renders a live 3D avatar and is highly visual, but per user decision it is presented as the dedicated EXPERIENCE / Internship entry — see Section 5 — rather than in this project-visuals list.)*

**Authorship caveats to disclose (do not present as solo work without a caveat)**
- VRATA, MiniRAFT-DrawingBoard: very small authored-commit share (1/36, 2/15) relative to team size — fine to include, but frame honestly as team projects with a specific role, not solo builds.
- VRATA: the associated paper is written but not yet published — frame as research in preparation, not a completed publication.
- Reality-Compiler: per its own README, the backend is stubbed and the compilation pipeline runs on a scripted front-end clock — frame as an early-build presentation prototype, not a finished product.

---

## 5. Recommended Portfolio Hierarchy

**EXPERIENCE (structurally separate from the project hierarchy below)**

```
EXPERIENCE
└── Internship
    └── IMU-Reconstruction-SlimeVR
```

- Full-body motion-capture pipeline built during the user's internship: 10 custom ESP32+MPU6050 IMU nodes → ESP-NOW → hubs → SlimeVR server (Kotlin/JVM, IK skeleton solving) → Three.js viewer driving a Mixamo-rigged 3D avatar. 9/20 commits authored — a real, meaningful contribution to a hardware+software team effort.
- Must not appear as a project bubble in the normal Tier 1–3 hierarchy or any domain grouping. Recommend a distinct spatial/visual treatment in the eventual 3D site: e.g. a larger anchored node placed outside the project cluster, its own timeline/location marker, or another treatment that reads unambiguously as "experience," not "project."

**Tier 1 — Featured (hero-level, 3D-forward presentation)**
1. 3D-Visualization-of-Gaussian-Splats — direct thematic match, embeddable 3D exhibit
2. Astronaut_health_digital_twin — coupled sleep-fatigue/motion-sickness research model with a full Three.js Interstellar-themed 3D dashboard *(promoted from Secondary now that scope is confirmed)*
3. AEGIS — flagship systems/software-engineering piece, graph-visualization potential
4. CardioTriage — flagship graphics+AI/simulation piece
5. KiranaAI — flagship applied-AI/product piece

**Tier 2 — Featured (technical depth, standard case-study treatment)**
6. Message-Notification-Router — AI-engineering judgment showcase

**Tier 3 — Secondary (grid/list section, lighter treatment)**
- Mock-IPL-Auction (has a live demo — worth a link even here)
- MiniRAFT-DrawingBoard
- VRATA — frame as research in preparation (paper written, not yet published); disclose limited commit share
- Reality-Compiler — frame explicitly as an early-build presentation prototype (per its own README: backend stubbed, front-end orchestration is scripted, not yet wired to real logic) *(moved out of "pending" now that scope is confirmed)*
- Healthcare-Appointment-and-Patient-Record-Manager
- Medivault

**Excluded from portfolio (confirmed by user)**
- AbyudShetty (profile repo), Ludo, Shell-Green-AI-Smart-Irrigation, Basic-chat-application, neetcode-submissions, claude-code, system_prompts_leaks, IMU_Reconstruction, Cloth_Cutting_Mesh_Manipulation

**Open questions — all resolved.** Reality-Compiler and Astronaut_health_digital_twin now have full READMEs supplied by the user (descriptions above updated accordingly); VRATA's paper is confirmed written but not yet published, so it is presented as research-in-preparation rather than a completed publication. No open questions remain at this time.
