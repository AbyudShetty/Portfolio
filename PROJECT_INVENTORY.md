# Project & Experience Inventory

**GitHub:** [AbyudShetty](https://github.com/AbyudShetty)  
**Updated:** 2026-10-27 · 18 projects + one Experience entry

Projects are ranked by overall resume value: technical substance, personal contribution, implemented scope, evaluation evidence and usefulness across software/AI roles. The ordering is a starting point; select/reorder for the actual JD. CAVE Lab remains Experience and is not scored as a project.

Every entry uses the same core sections: what it does, technology, architecture, evidence, originality/contribution, portfolio value and wording limits. Smaller scope gets precise treatment rather than inflated architecture. Internal audit gates, repository-reported metrics and independently checked facts are kept distinct.

**Review provenance:** TyreTrace was newly reviewed against its published repository, local source, current results and selected file-level Git blame. AEGIS, KiranaAI, VRATA, MiniRAFT, MediVault, Reality Compiler and Gaussian Splat documentation were fetched on 2026-10-27; relevant local README/code checks supplemented other entries. Detailed older authorship checks for Quorum, AnchorMatch, HCRM and the internship are retained and labeled. Existing commit/test counts are snapshots, not live guarantees. No application/model test suite was rerun merely to rewrite this documentation. A README feature is system evidence, not automatic evidence that Abyud wrote it.

| Rank | Project | Strongest use | Repository |
|---|---|---|---|
| 01 | Quorum — Coordination Layer for AI Coding Agents | Agent infrastructure, backend, developer tools | [Repository](https://github.com/AbyudShetty/Quorum) |
| 02 | AnchorMatch — Multilingual Business Entity Resolution | ML, retrieval, multilingual entity resolution | [Repository](https://github.com/AbyudShetty/MLChallenge2026) |
| 03 | TyreTrace — Bayesian Tyre-Degradation Research | Bayesian ML, uncertainty, research engineering | [Repository](https://github.com/AbyudShetty/TyreTrace) |
| 04 | Buy or Wait? — Affordability Forecast Agent | Applied AI, Python, verified automation | [Repository](https://github.com/AbyudShetty/affordability-forecast-agent) |
| 05 | AEGIS — Financial Risk & Operations Control Plane | Java/Spring, transaction integrity, fintech | [Repository](https://github.com/AbyudShetty/AEGIS) |
| 06 | GhostAudit — Evidence-Backed Data Deletion Audits | Privacy, data engineering, evidence-driven audits | [Repository](https://github.com/AbyudShetty/GhostAudit) |
| 07 | Portfolio (abyudshetty.me) | Frontend, graphics, accessibility | [Repository](https://github.com/AbyudShetty/Portfolio) |
| 08 | IPL Mock Auction — Real-Time Multiplayer Simulator | Product builder, full-stack, real-time applications | [Repository](https://github.com/AbyudShetty/Mock-IPL-Auction) |
| 09 | KiranaAI | Applied AI, forecasting, retail automation | [Repository](https://github.com/AbyudShetty/KiranaAI) |
| 10 | Healthcare Appointment & Patient Record Manager | Full-stack, QA, enterprise applications | [Repository](https://github.com/AbyudShetty/Healthcare-Appointment-and-Patient-Record-Manager) |
| 11 | Message Notification Router | Multimodal pipelines, ranking, Python testing | [Repository](https://github.com/AbyudShetty/Message-Notification-Router) |
| 12 | Astronaut Health Digital Twin | Digital twins, simulation, scientific applications | [Repository](https://github.com/AbyudShetty/Astronaut_health_digital_twin) |
| 13 | VRATA | Secure computation, reliability research | [Repository](https://github.com/AbyudShetty/VRATA) |
| 14 | CardioTriage | Real-time simulation, healthcare visualization | [Repository](https://github.com/AbyudShetty/CardioTriage) |
| 15 | MiniRAFT Drawing Board | Distributed systems, consensus | [Repository](https://github.com/AbyudShetty/MiniRAFT-DrawingBoard) |
| 16 | Gaussian Splat Viewer | WebGL, AR/VR, 3D visualization | [Repository](https://github.com/AbyudShetty/3D-Visualization-of-Gaussian-Splats) |
| 17 | MediVault | Flask, MySQL, OCR | [Repository](https://github.com/AbyudShetty/Medivault) |
| 18 | Reality Compiler | UI prototyping, interaction design | [Repository](https://github.com/AbyudShetty/Reality-Compiler) |

| Experience | Organization / role | Repository |
|---|---|---|
| E01 · IMU Motion Capture Pipeline | CAVE Lab, PES University · Summer Intern · Jun–Jul 2026 | [Repository](https://github.com/AbyudShetty/IMU-Reconstruction-SlimeVR) |

---

## 01 · Quorum — Coordination Layer for AI Coding Agents

🔗 [github.com/AbyudShetty/Quorum](https://github.com/AbyudShetty/Quorum)

**Status at the earlier October review: work in progress** (Phase 1 done, Phase 1b cross-machine being tried on two laptops, Phase 2 approvals planned). README calls "Quorum" a working name. Resume date: "Oct 2026 -- Present".

#### What it does

A self-hosted workspace where AI coding agents from different vendors (Claude Code, Codex) message each other, whether they run in different folders on one machine or across machines, with a human approving consequential actions (approvals are Phase 2, not built yet). `quorum attach` in each folder starts a local server by itself; each agent window gets an addressable name; new mail reaches an agent mid-turn through its hooks and wakes an idle Claude Code or Codex session within a server-enforced wake budget. Two machines connect with `quorum invite` / `quorum join` through a relay.

#### Tech

TypeScript monorepo on Node 22/24 (11 packages: schemas, core, local, server, adapter-mcp, adapter-hooks, codex-bridge, relay, cli, web, fleet). Fastify `/v1` API over SQLite (`better-sqlite3`, WAL), OpenAPI contract with a contract test suite that the real and the fake server both pass, MCP server for agents, Claude Code and Codex hooks, Cloudflare Worker and Node relay, Vitest, ESLint, Prettier, GitHub Actions on Windows and Linux with Node 22 and 24, CodeQL, dependency audit and dependency review.

#### Architecture and engineering

- **Contracts first:** JSON Schema describes messages; OpenAPI fixes the HTTP contract; real and fake server targets run the same contract suite.
- **Separated core and adapters:** core handles event/message rules; Fastify and SQLite provide persistence/API access; hooks and the Codex bridge deliver messages during work and wake idle sessions.
- **Failure and security controls:** per-workspace hash-chained events, credential scanning, token rules and server-enforced wake budgets. A human message can reset an agent-only conversation loop.
- **Cross-machine transport:** Node and Cloudflare Worker relays forward bytes; TLS terminates at the home server using a pinned key. The relay is not the endpoint trusted with message plaintext.
- **Operational tooling:** CLI commands expose attach/join, inbox, send, export and chain verification; the teammate's web timeline and fleet harness provide complementary inspection/testing surfaces.

#### Evidence

- `git blame` by line on the final tree, source files only: **abyud** wrote 100% of `schemas` (about 2,950 lines), `core` (1,540), `local` (1,030), `server` (5,220), `adapter-hooks` (1,900), `codex-bridge` (385) and `relay` (790), plus most of `cli` (2,590 vs 450). About half of `adapter-mcp` (1,010 vs 1,200; abyud wrote `pairing-mcp.ts` and `remote.ts`, the teammate wrote most of `mcp-server.ts`, `client.ts`, `credentials.ts`, `heartbeat.ts`, `outbox.ts`). The teammate wrote most of `web` (382 vs 211) and `fleet` (554 vs 42). Commits: 39 abyud, 14 thorOdinson16, 6 dependabot.
- Hash chain: per-workspace append-only, `hash = SHA-256(canonical JSON of the event)`, genesis per workspace; `quorum verify` checks it; a server test confirms the database refuses to edit or delete history (INV-8).
- Secret scanning (INV-14): 11 high-confidence credential patterns (private keys, AWS, GitHub, Anthropic, OpenAI, Slack, Google, Stripe, npm, Hugging Face, Quorum tokens). Findings name the field and the kind, never the value.
- Wake governor (INV-29): per-agent wakes per hour and an agent-only-loop circuit breaker per thread; a human message resets it.
- Relay: forwards bytes only; a TLS 1.3 session runs from the other machine straight to the home server, whose key was pinned from the invite code (INV-24). Node (`ws`) and Cloudflare Worker with a Durable Object per home.
- Crash test (`packages/server/test/crash.test.ts`): kills a writer process mid-append; nothing committed is lost, no half-written event appears, and the chain still verifies.
- About 576 test declarations across `*.test.ts` (core 101, server 91, cli 77, adapter-mcp 72, schemas 71, tests/ 62, adapter-hooks 33, relay 15). Say "over 500 tests", not an exact number.
- Threat model with 34 numbered security invariants, a decision log, and "Security review fixes" in the history.
- Tried live on Windows (Phase 1 exit run, 2026-10-11): the Claude Code idle watcher and the Codex idle wake, both ways, per `packages/adapter-hooks/README.md`.

#### Originality

Original, two-person build (abyud plus a teammate working "Track B" while the user took over some Track B packages, per the repo's own READMEs). The repo also contains `AGENTS.md` and `.claude/CLAUDE.md`, so it was built with AI coding agents; be ready to explain any design choice in the code.

#### Portfolio value

**Overall rank: #01.** The strongest broad engineering signal: agent interoperability, API/protocol contracts, durable storage, security invariants, wake control and cross-machine networking in one substantial system. Best for developer tools, backend/platform and agent infrastructure roles. The teammate split and in-progress status must stay explicit; the historical 500+ tests are not a fresh test run.

#### Resume wording and limits

Use co-built for Quorum; built/wrote only for personal packages. It remains in progress as last verified. Do not claim release, external teams/users, built approval phases or real user interviews; docs/interviews are simulated. Prefer over 500 tests to a fragile exact total.

---

## 02 · AnchorMatch — Multilingual Business Entity Resolution

🔗 [github.com/AbyudShetty/MLChallenge2026](https://github.com/AbyudShetty/MLChallenge2026)

**Resume title:** "AnchorMatch - Multilingual Business Entity Resolution". The repo is named after the competition it was built for; AnchorMatch is the pipeline name from the user's own commit ("Name the pipeline AnchorMatch", 2026-09-26) and is what the repo's Summary.md and ARCHITECTURE.md call it. Keep the current repository URL when linking the project; use AnchorMatch as the resume title.

#### What it does

Entity resolution at scale. Source files S2 and S3 (noisy business records: typos, digit-for-letter swaps, token reorder, legal-suffix churn, DBA prefixes, URL-form names, house-number mutation, Indic-script names) must be matched to canonical S1 entities across the US, India and France, with France seen only at test time. Metric: macro F0.5. The pipeline is solved from the S2/S3 side so uniqueness (each record belongs to at most one entity, about 26% to none) becomes a hard constraint.

Stages: (A) normalisation and Indic-to-Latin transliteration, (B) candidate generation from a fine-tuned multilingual bi-encoder plus character n-gram LSA plus exact keys, trimmed by a LightGBM pruner to about 2.2 candidates per record, (C) two-stage LightGBM matcher over the full candidate graph, (D) decoder (one entity per record, source caps, expected-F0.5 prefix selection), then (E) the teammate's cross-encoders on the uncertain band, a stage-3 LightGBM stacker and France domain adaptation.

#### Tech

Python 3.10, PyTorch, Hugging Face Transformers (paraphrase-multilingual-MiniLM-L12-v2 bi-encoder; XLM-R and E5 cross-encoders), LightGBM, scikit-learn, RapidFuzz, Polars, `indic_transliteration`, Kaggle T4 notebooks for the larger cross-encoders. One 6 GB laptop GPU for the encoder (frozen 96M-parameter embedding matrix plus gradient checkpointing to fit).

#### Architecture and engineering

- **Normalize and retrieve:** normalize noisy names/addresses, learn Indic-to-Latin transliteration, fine-tune a multilingual bi-encoder and combine dense candidates with character n-gram/LSA and exact-key candidates.
- **Prune before scoring:** a LightGBM pruner reduces the candidate set; fuzzy, IDF and edit-pattern features feed the two-stage matcher.
- **Prevent training/evaluation contamination:** ENC/MATCH/HOLDOUT entity folds keep matching/evaluation records unseen by the encoder where required. The v2 matcher builds graph-context features over the complete candidate graph to address training/serving skew.
- **Decode globally:** each source record can map to at most one canonical entity; ranking/source caps and expected-F0.5 logic turn pair probabilities into final matches.
- **Team extension:** cross-encoders, a stage-3 stacker and France adaptation are later teammate-owned stages, not the user's implementation.

#### Evidence

- `git blame` by line, final tree: **abyud** wrote 100% of `normalize.py`, `translit.py`, `lexicon.py`, `blocking/encoder.py`, `blocking/lexical.py`, `blocking/dense.py`, `candidates.py`, `prune.py`, `features.py`, `matcher.py`, `matcher2.py`, `decode.py`, `v2.py`, `split.py`, `pipeline.py`. **thorOdinson16** wrote 100% of `crossenc.py`, `stage3.py`, `cotrain.py` and the France adaptation work (trust rule, rescue rules, pseudo-label rounds, Kaggle trainers). Commits: 9 abyud, 13 thorOdinson16 (22 total). README lists four team members ("Team Oura Oura"); only two committed.
- Results (README and Summary.md): v1 holdout 0.9856, public LB 0.975 (user's stage); v2 holdout 0.9889, LB 0.982614 (user's stage); with the teammate's cross-encoder and stage 3, LB 0.984809; final **LB 0.988318**, holdout 0.9914, rank about 221 (README). The denominator for the rank is not given.
- Bi-encoder (ARCHITECTURE.md experiment log): random in-batch negatives collapsed the loss to 0.005 by step 400, replaced with hard-negative batches (same city/state or same first name word); holdout R@1 .972 / R@10 .989 (US), .966 / .986 (India), a large jump over LSA. The encoder found 99.7% of its *training* pairs vs about 99% of holdout, which led to the ENC/MATCH/HOLDOUT fold split (`split.py`).
- Transliteration dictionary is learned from up to 3,000,000 labelled pairs (India only), with a rule-based fallback over nine scripts.
- Team experiment notes include a rejected zero-shot LLM judge (Qwen3-4B, AUC 0.53). Do not attribute that experiment to Abyud without verifying authorship.

#### Originality

Team project built for the Amazon ML Challenge 2026. Not a fork. The challenge data was removed from the repo, so the pipeline cannot be re-run without the original dataset; the final submission (`output/matching_results.tsv`) is described in the README but is not in the committed file list I checked.

#### Portfolio value

**Overall rank: #02.** The strongest ML/retrieval entry: transformer fine-tuning, hard-negative training, multilingual matching, disciplined holdouts and a measured public leaderboard result, with clear ownership of the core stages. First choice for ML/NLP/data roles. Keep personal-stage metrics separate from the final team score and note that reproduction needs the removed challenge dataset.

#### Resume wording and limits

Use co-built. Personal-stage scores are 0.9889 holdout F0.5 and 0.9826 leaderboard; the final 0.9883 leaderboard includes teammate stages. Do not claim the cross-encoders, France adaptation or stage-3 stacker personally. This is entity matching/retrieval, not proof of NER/RAG work.

---

## 03 · TyreTrace — Bayesian Tyre-Degradation Research

🔗 [github.com/AbyudShetty/TyreTrace](https://github.com/AbyudShetty/TyreTrace)

**Status:** active research workbench, Oct 2026–Present. Software delivery, experiment completion and scientific adoption are separate states.

#### What it does

Investigates what public Formula 1 lap-time data can actually reveal about tyre wear, fuel effects, track evolution and forecast uncertainty. These effects are confounded: within a stint, fuel burn and tyre age both track lap number. The project uses qualifying anchors, pit-stop resets, hierarchical models, synthetic recovery and competing predictors to test which quantities can be separated and which remain assumption-dependent.

The resulting workbench combines a sourced data lake, reproducible audit/task runner, rolling forecasts, model/baseline comparisons, uncertainty calibration, a practice-run planner and a nine-page React dashboard. It also implements game UDP capture/replay for a future controlled validation path; live game proof remains pending.

#### Tech

**Scientific Python:** NumPy, SciPy, Pandas, Polars, PyArrow, scikit-learn, JAX, NumPyro and ArviZ. **Data:** FastF1/OpenF1 timing, canonical lap schema and sourced physical-compound nominations. **Models/evaluation:** mixed effects, hierarchical Bayesian/NUTS models, gradient boosting, HMM candidates, Student-t predictive calibration, CRPS, coverage and weekend-level resampling. **Product:** React, TypeScript, Vite, browser-side planner, static JSON/artifact exports; Streamlit remains a legacy interface. **Verification:** pytest, web tests, synthetic fixtures, immutable capture/replay and packet-layout checks.

#### Architecture and engineering

- **Shared data contract:** real ingest and the synthetic twin emit the same 37-column lap schema. Qualifying, practice and race are kept distinct; source adapters and physical-compound mappings make assumptions visible.
- **Identification and model ladder:** qualifying anchors track evolution; race pit-stop age resets inform wear contrasts; mixed/hierarchical models test pooling and scale assumptions. Model candidates add dirty-air terms, heavy tails, robust practice or descriptive HMM regimes only where experiments support them.
- **Rolling evaluation:** compare identified, conventional linear/quadratic, naive, gradient-boosted and source-form published tyre-curve predictors using common targets. Fit predictive calibrators on at least eight strictly earlier weekends with equal weekend weight.
- **Uncertainty layer:** preserve point forecasts and learn Student-t dispersion from earlier forecast errors. Marginal lap-time intervals are explicitly separate from latent fuel/wear posteriors and joint race trajectories.
- **Experimental design:** choose practice programmes by expected information gain. The TypeScript planner matches the Python implementation against exported numeric fixtures and marginalizes run intercepts for efficient browser calculation.
- **Product/artifact boundary:** the runner fits/scores and exports results; nine React pages read saved artifacts rather than refitting on page load. The game-rig path validates packet layouts and records/replays controlled captures without claiming hidden-state recovery from a live game.

#### Evidence

- [Current repository](https://github.com/AbyudShetty/TyreTrace) was retrieved on 2026-10-27 and compared with the local `C:/ABYUD/HACKATHONS/TRACKSHIFT` checkout. Both identify HEAD **f85e028**. The current docs/RESULTS.md and docs/HANDOFF.md supersede optimistic historical README paragraphs.
- Git history has **six commits, all attributed to AbyudShetty**. Fresh blame checks attribute ladder.py, mixed.py, backtest/competitors.py and planner/eig.py entirely to that account. This supersedes the earlier unverified thin/team-authorship note for those implementations; the README's planned three-person architecture is not proof of teammate code in the current tree.
- The available lake contains **84 cached race weekends**; nomination coverage is recorded for all 84. Dry/scored/forecast subsets have smaller denominators and must not be conflated with the full lake.
- On the documented **14-weekend, 11,560-lap filtered 2026 population**, Student-t calibration raises identified 90% coverage from **82.2% to 93.6%**, with CRPS **0.51940 → 0.51749** under the 70 kg assumption. The CRPS improvement's paired-weekend interval includes zero; the block had already been inspected, so it is retrospective, not a fresh prospective test.
- Latest sensitivity removes whole-stint pace trimming: identified 90% coverage falls to **81.4% on 11,947 laps** and none of the five reported methods passes the coverage band. This prevents claiming operational calibration from the filtered result.
- An isolated Austin weekend was downloaded after freezing predictor/protocol/input hashes. The selected ML candidate is **HOLD**, with CRPS **0.77160** and coverage **99.1%**; this is one unseen offline weekend, not a pre-event forecast or a generalization guarantee.
- docs/HANDOFF.md reports **203 Python tests, 17 web tests**, a production build, 36 browser views and 48 palette checks passing on 2026-10-27. Source/test inspection here confirms real implementations and temporal-isolation/CRPS checks; those suites and model runs were not repeated during this resume edit.

#### Originality

Original scientific-software implementation in the current Git/blame evidence, built using existing statistical methods, public timing sources and scientific libraries. The inspected current model/planner code is attributable to Abyud; do not retain the old blanket claim that these are thin personal contributions. A commit history establishes code attribution, not unaided authorship or independent scientific novelty.

Use built/developed for verified personal modules. Credit FastF1/OpenF1, the published baseline and external statistical methods. No F1 team partnership, proprietary telemetry, real fuel logs, published paper or live-game validation is established.

#### Portfolio value

**Overall rank: #03.** The clearest probabilistic-modeling/research-engineering counterpart to AnchorMatch's retrieval pipeline and Quorum's infrastructure. It adds Bayesian inference, uncertainty diagnostics, time-aware evaluation, experimental design, real-data engineering and an inspectable product surface. Promote it for ML research engineering, time series, simulation, uncertainty or scientific-computing roles.

Its value comes from building and evaluating a substantial system, including failed hypotheses. It ranks below the first two because key scientific conclusions are conditional, later-population performance weakens headline calibration, and live/prospective evidence is unfinished. Those boundaries should sharpen the interview story, not be hidden.

#### Resume wording and limits

Use TyreTrace as the project name. Do not claim true observed fuel/tyre wear, calibrated latent parameters, prospective race prediction, universal baseline superiority or deployed F1 strategy. State dataset/evaluation populations when giving numbers. A completed audit marked PASS can coexist with a candidate model marked HOLD; SHIP is an internal experimental gate, not a production release. The 203/17 test figures are reported verification from the source repository, not a new run here.

---

## 04 · Buy or Wait? — Affordability Forecast Agent

🔗 [github.com/AbyudShetty/affordability-forecast-agent](https://github.com/AbyudShetty/affordability-forecast-agent)

#### What it does

Answers "can I actually afford this right now?" for 250 purchase requests. For each one it rebuilds the user's financial timeline (historical, pending and confirmed transactions; recurring vs one-off; duplicates, failed and cancelled records removed; income counted only on its settlement date), fills blank transaction amounts from linked images (payroll letters, bills, receipts, statements), forecasts the balance 90 days forward against the user's minimum-balance floor and protected expenses, and outputs a complete, ranked recommendation: `full_payment`, a two-payment `partial_payment`, an `installments` plan that must exactly match a supplied option, `wait` until a computed date, or `not_recommended` — plus up to three stop/reduce changes to flexible recurring expenses when nothing is safe without them.

#### Tech

Python 3.10+, standard library only for the pipeline (`Decimal` money, dataclasses); pytest. Modular engine — `engine/ledger.py` (past/future/excluded), `recurrence.py` (structure-only pattern detection: day-step chains and monthly runs), `forecast.py` (90-day balance), `capacity.py` (safe amount, earliest date), `decide.py` (eligibility, installments, partial, spending-change search, spec-ordered ranking), `explain.py`; a `verify.py` hard gate replays every plan through the forecast. The evidence layer calls Claude through the Claude Code CLI in headless mode with schema-constrained JSON — Haiku 4.5 for messages and explanation rewrites, Sonnet 5 for images — and `evidence/validate.py` rejects any fact whose quote isn't verbatim or whose amounts, currencies or dates don't literally appear in the source. Multi-currency (INR, ZAR, IDR, USD, EUR) via exact dated FX rates only.

#### Architecture and engineering

- **Evidence layer:** extract structured facts from messages and scanned documents through the headless Claude CLI, validate the facts and cache extraction outputs with usage accounting.
- **Ledger and forecast:** reconstruct settled/pending/excluded transactions, detect recurrence from structure, apply exact dated exchange rates and use Decimal arithmetic to project the 90-day balance.
- **Decision search:** compare full payment, supplied installment options, partial payment, delayed purchase and permitted spending changes against protected expenses and a minimum-balance floor.
- **Independent output gate:** replay each proposed plan through the forecast, collect contract violations and refuse to write a failing row. Extraction and final decision logic remain separate.
- **Reproduction:** cached evidence permits deterministic reruns without fresh model calls; explanations do not determine the underlying financial figures.

#### Evidence

Two READMEs (a top-level project overview, and a detailed `code/README.md` with a Mermaid architecture diagram, a "how the traps are handled" table and a candid "Known limitations" section) both match the file tree. 103 test functions across 5 files, including prompt-injection cases. A committed `code/evaluation/usage_report.md` for the final run: 40 model calls, ~1.97M tokens, **$2.68 total / ~$0.011 per request**; `output.csv` reproduces from the evidence cache with zero model calls. Self-reported scores on the 25 public samples: 22–23/25 exact on status, method, plan, earliest date and spending changes; `amount_safe_to_pay` 5/25 exact with 0.66% mean error. Full run: 250 rows, every row passing the verifier. No hidden ground-truth score is published in the repo.

#### Originality

Original solution by the user (not a fork). The repo is built on a challenge/competition scaffold: organizer accounts `shlokashah` (31 commits) and `pawanajjark` (2) authored the problem statement, dataset and blank template between 2026-09-08 and 09-12; the user's 13 commits on 2026-09-13/14 add the entire solution — the first alone is +8,509 lines across 41 files. The challenge's required deliverables include a chat transcript of how the system was developed, and the organizer-supplied `CLAUDE.md`/`AGENTS.md` indicate AI-assisted development was expected.

#### Portfolio value

**Overall rank: #04.** A clear end-to-end Python system with deterministic financial decisions, grounded model extraction, verification, tests and measured run cost. Strong for applied AI, automation and Python backend roles. Its engineering is easier to explain and attribute than many larger team projects; public-sample limitations remain material.

#### Resume wording and limits

Use built for the personal solution and credit organizer problem/data. State that LLMs extract evidence while deterministic code decides and a verifier replays plans. Cost is the recorded final run, not total development cost. Do not describe public-sample agreement as hidden-set accuracy or real financial advice.

---

## 05 · AEGIS — Financial Risk & Operations Control Plane

🔗 [github.com/AbyudShetty/AEGIS](https://github.com/AbyudShetty/AEGIS)

#### What it does

A deterministic financial-operations simulation and investigation platform. It generates transactions, evaluates explainable risk, compares behavioral patterns, analyzes account relationships and correlates the resulting evidence into incidents. The React control room lets an analyst follow a transaction from its decision through network context to an investigation timeline.

The project demonstrates the engineering behind a stateful business system: correct transfer processing, durable asynchronous work, explainable decisions and operator-facing workflows. Its thresholds and scenarios are deliberately transparent simulation controls, not validated bank fraud policies.

#### Tech

**Backend:** Java 21, Spring Boot 3.5, Spring Web/Validation, Spring Data JPA/Hibernate. **Persistence:** PostgreSQL 16, transactional outbox, database constraints and row locking. **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, React Flow. **Verification/delivery:** JUnit 5, Spring Boot Test, MockMvc, H2 PostgreSQL compatibility mode, Docker and Docker Compose.

#### Architecture and engineering

- **Persisted transaction core:** account balances and transfers live in PostgreSQL; Java BigDecimal arithmetic, transactional updates, pessimistic row locking and a database idempotency constraint prevent repeat movement of funds.
- **Explainable decision path:** synchronous risk and temporal checks produce APPROVE, REVIEW or BLOCK. APPROVE/REVIEW move funds; blocked/rejected attempts retain evidence but do not become executed financial-flow edges.
- **Behavioral context:** compare an account's observed transfer window with its historical baseline, retaining the baseline, observed value, threshold and explanation for each signal. These are explicit simulation policies.
- **Durable after-commit work:** the business fact and outbox event commit together; handler receipts, bounded retries/backoff and startup recovery support graph analysis and incident correlation without rolling back an already committed balance movement.
- **Graph and incident analysis:** build directed in-memory graphs from persisted executed transfers; use BFS neighborhoods, DFS cycles, fan-in/fan-out and connectivity signals. Stable correlation keys deduplicate incidents and their evidence.
- **Analyst workflow:** a typed React/TypeScript API client powers transaction exploration, network views, simulation, incident investigation and acknowledge/resolve actions. Operational summaries derive backlog/retry/decision-pressure signals from persisted records.

#### Evidence

- [Current README](https://github.com/AbyudShetty/AEGIS/blob/main/README.md) was retrieved on 2026-10-27. It describes the transaction semantics, synchronous risk decisions, after-commit event pipeline, graph algorithms, temporal baseline and operational summaries in detail; these agree with the earlier repository/code review recorded in this workspace.
- The published history has two commits under Abyud, including the control-room/temporal/event-pipeline addition. Earlier review attributed the implementation to him.
- The repository documents **60 integration tests**, covering idempotent replay, transactional invariants, persisted risk/audit evidence, temporal boundaries, graph/simulation behavior, incident lifecycle and durable event processing. This is a documented suite count, not a new test run during this inventory edit.
- Four committed screenshots show control-room, incident, network and simulation workflows. The documented demo runs a circular-flow scenario through the real API/PostgreSQL path; screenshots are not evidence of production use or measured scale.
- Operational metrics come from persisted data. A fresh API summary does not establish a separate production observability platform. Current limitations include Hibernate schema updates rather than versioned migrations, per-request in-memory graph rebuilding and missing dedicated lifecycle audit events for incident transitions.

#### Originality

Original project with single-author implementation in the recorded Git history. Resume date: Aug 2026. Use built/wrote for the implemented Java/backend, transaction integrity and control-room work. The technical choices are substantial even though the repository history is short; commit count is not a complexity metric.

#### Portfolio value

**Overall rank: #05.** Strong conventional backend proof: transaction correctness under failure, database constraints, risk rules, graph analysis and integration testing, with a frontend to demonstrate it. A first-choice entry for Java/Spring, backend and fintech engineering roles. Keep the simulation scope explicit.

#### Resume wording and limits

Call it a financial-operations simulation/showcase. Claim implemented controls, risk evidence and tested transaction behavior; do not call it a deployed banking fraud engine or a model trained on real bank fraud. Do not claim production authentication, schema migrations or a graph database.

---

## 06 · GhostAudit — Evidence-Backed Data Deletion Audits

🔗 [github.com/AbyudShetty/GhostAudit](https://github.com/AbyudShetty/GhostAudit)

**Status:** participant implementation for the October 2026 Ghost Data Still Exists challenge. Treat it as a normal project on the resume; challenge attribution belongs in project context when useful.

#### What it does

Checks whether a deletion request was fulfilled across databases, replicas, logs, support records, exports, analytics, search indexes and backups. It reconstructs historical identities and resource state at an audit cutoff, distinguishes deletion from access/correction/export/opt-out requests, and produces cited findings, dependency-ordered remediation and verification steps. It generates an audit plan; it does not delete data from live systems.

#### Tech

Python 3.10+, dataclasses, SQLite-compatible SQL snapshot parsing, JSON/CSV/text/log parsers, pdfplumber, unittest, Windows.Media.Ocr for development-time screenshot extraction, and a shipped checksum-matched OCR cache. The runtime uses Python's standard library plus pdfplumber. It makes no language-model or network calls and requires no API keys.

#### Architecture and engineering

- **Parse and link:** parsers normalize SQL snapshots, JSON, logs, text, PDF and cached screenshot text; identifier graphs link current/historical emails, phones, hashes and stable user references to resources.
- **Reconstruct before classifying:** resource state, ownership and relevance are distinct computations. Deletion-worker success messages are not accepted as proof that every resource was removed.
- **Apply category policy:** distinguish deletion requests from access/correction/export/opt-out and evaluate deletion, redaction, anonymization, retention and account requirements.
- **Emit a constrained plan:** findings cite evidence; future remediation/verification use the allowed operation vocabulary and dependency ordering. Stop flows/block restoration before dependent record changes.
- **Validate and publish atomically:** check row/step schemas, ordering and citation conventions before replacing the output file; retain the reason for withheld proof steps.

#### Evidence

Reviewed on 2026-10-26 from the local repository at `C:/ABYUD/HACKATHONS/ORCHESTRATE/October26-clean`, whose Git remote is the supplied GhostAudit URL. Local HEAD was `fa5974e`; direct GitHub access failed, so published-remote parity is unverified.

- README, docs/architecture.md, evaluation/evaluation_report.md and code agree on a parse → identity/resource linking → audit-time state reconstruction → policy classification → plan/schema-validation pipeline. Checked reconstruction.py, cli.py and runtime-purity tests directly. The CLI validates rows before writing a temporary file and atomically replacing the destination.
- Evidence fixtures independently enumerate 94 input files, 4,187 input units and 3,220 observations; parsers handle seven log dialects. Screenshots use a checksum-matched cache for 11 supplied images, not a general online OCR service.
- The committed local evaluation report, dated 2026-10-25, reports **32/32 sample status decisions correct**, **step precision 1.0000 / recall 0.9067 / F1 0.9511**, and **17/32 exact ordered step sequences**. All 41 sample findings and 41 remediation steps match, but 18 verification steps are withheld. These are public-sample/local-scorer results, not an official challenge score or unseen-data accuracy.
- The report records 518 evaluation rows with zero schema violations and no future-dated citations; reference answers for those rows are unavailable. Six synthetic scenarios cover seven request results. Final audit-run model calls/tokens/API cost are zero; that says nothing about development-time AI usage or total compute cost.
- Source includes parser, identity, reconstruction, classification, planning, temporal, runtime-purity and regression tests. Their presence was inspected; the suite and reported metrics were not rerun for this inventory edit.

#### Originality

Local Git history contains ten commits, all attributed to AbyudShetty. The source is the participant implementation; the challenge specification and fictional dataset originate from HackerRank. Use built for the personal engine implementation, with organizer attribution for the supplied problem/data. Single-author Git history establishes repository authorship, not unaided development.

#### Portfolio value

**Overall rank: #06.** Strong evidence of Python backend/data engineering, identity resolution, temporal reasoning, traceable decisions and careful evaluation. It is especially useful for privacy, security, risk, data-quality and compliance-oriented engineering roles. Its position reflects the small public-sample evaluation and the audit policy's consequential limitations; move it higher for roles centered on evidence and deletion auditing.

#### Resume wording and limits

No live deletion, legal-compliance certification or LLM runtime. On 32 public samples: status 32/32, step F1 0.9511, exact sequence 17/32. S3k can use later evidence for ownership, and COMPLETE may rest on partial proof. Never claim strict temporal identity isolation or proven deletion for every COMPLETE case.

---

## 07 · Portfolio (abyudshetty.me)

🔗 [github.com/AbyudShetty/Portfolio](https://github.com/AbyudShetty/Portfolio) · live: [portfolio-dun-six-74.vercel.app](https://portfolio-dun-six-74.vercel.app)

#### What it does

A cinematic, scroll-driven 3D portfolio site. Scrolling flies a camera through a space-themed field (astronaut, the Endurance ship, a black hole, a tesseract, constellations), and your projects appear as 3D objects with engraved labels, alongside DOM sections (about, lab plates), a console and specimen panels. It includes a live, playable Gaussian Splat demo and was iterated for mobile.

#### Tech

Next.js 16 (App Router, `next/dynamic`, `next/font`), React 19, TypeScript 5, Tailwind CSS 4, Three.js, React Three Fiber, drei (`useGLTF`, `Environment`, `Lightformer`, `Html`), `@react-three/postprocessing` (Bloom, Vignette), GLB models, Three `DecalGeometry` for engraved labels, a custom semi-implicit spring integrator for per-frame motion, design tokens and CSS custom properties, deployed on Vercel. Written against a `design/DESIGN.md` specification (type, glass-material tiers, lighting rules, a "mass principle" for motion). Framer Motion (`motion`) is a listed dependency, but I found no import of it in the live source (only in the `design/references` folder), so verify before leaning on it in an interview.

#### Architecture and engineering

- **Scene and page composition:** Next.js loads the browser-side Three.js/R3F scene alongside DOM content and project/detail panels, avoiding a canvas-only information architecture.
- **Camera and motion:** scroll progress is read inside the animation loop; a semi-implicit spring integrator supplies motion to scene objects without routing every frame through React state.
- **Asset and rendering pipeline:** GLB models, environment lighting, decals/engraved labels and post-processing establish the space-themed scene and project exhibits.
- **Accessibility/performance:** reduced motion selects an alternate composition; performance tiers shed expensive effects and can fall back to a no-WebGL view. Glass tokens have opaque alternatives.
- **Content and interaction:** console, specimen/plate panels, lab material and a Gaussian Splat exhibit connect the visual scene to actual work rather than only decorative objects.

#### Evidence

- 16 commits, all by the user, 2026-09-08 to 2026-09-23, with visible iteration: version 2, mobile optimized, zoom fix, star glitch fix, live Gaussian splat demo, and three "improv" passes.
- Live structure verified: `scene/` (ScrollCameraRig, cameraChoreography, PostChain, Starfield, Constellations, Lighting), `experience/`, `projects/`, `hooks/` (useScrollProgress, usePerformanceTier, useReducedMotion, useViewport, useFieldState), `lib/` (design-tokens, spring), `ui/` (Console, PlateViewer, SpecimenPanel, FieldFallback).
- Engineering decisions recorded in the code comments: scroll progress is read every frame outside React state so the camera never forces a re-render; performance tiers T0 to T3 degrade one way (bloom, depth of field and transmission drop first) down to a static, no-WebGL fallback; reduced motion is built as a different composition, not a disabled one; every glass token has an opaque fallback.
- The repo contains `CLAUDE.md` and `AGENTS.md`, so Claude Code was part of the build workflow.

#### Originality

Original portfolio application, with the earlier review recording 16 user-authored commits across September 2026. Personal engineering includes scene/camera composition, custom spring behavior, performance/accessibility hooks and integration of project content. Credit Three.js/R3F and imported assets for their foundations; a single-author application does not imply authorship of its libraries or 3D models.

#### Portfolio value

**Overall rank: #07.** The strongest frontend/creative-development entry: a complete deployed experience with deliberate camera/motion design, performance degradation and accessibility behavior. Move it near the top for frontend, graphics or product-craft roles. Its focused frontend scope gives it less broad backend/ML coverage than the systems and modeling projects ranked above it.

#### Resume wording and limits

Describe a cinematic portfolio with performance/accessibility decisions, not a custom game/rendering engine. Framer Motion is not proven by the dependency alone; inspected live source did not show an import in the earlier review. Credit imported models and rendering libraries. Live availability/performance was not benchmarked here.

---

## 08 · IPL Mock Auction — Real-Time Multiplayer Simulator

🔗 [github.com/AbyudShetty/Mock-IPL-Auction](https://github.com/AbyudShetty/Mock-IPL-Auction)

#### What it does

A multiplayer cricket-auction application used by the user and friends. Participants join a shared room, bid on IPL players and assemble squads while the auctioneer controls the sale flow. Purses, player availability and squads stay synchronized so a group can run an auction together.

It also supports the practical details that make repeated play work: undo/refunds, unsold-player rounds, official player statistics, presence, idle-room cleanup and squad/auction analytics. This is the clearest user-confirmed product-use example in the inventory.

#### Tech

**Application:** React, JavaScript, Vite and Zustand. **Shared state/storage:** Firebase Realtime Database. **Hosting:** Firebase Hosting; server-side Firebase functions exist where independently verified. **Data workflow:** official-player-stat refresh scripts. The current local package.json declares React 18.3, Firebase 10.8 and Zustand 4.5; version numbers are inventory context, not resume requirements.

#### Architecture and engineering

- **Shared-room model:** room codes identify a Firebase-backed auction; a designated auctioneer controls bidding, purses, player outcomes and squad composition.
- **State migration:** the original vanilla-JavaScript implementation kept state in the DOM. The React revision moves it into Zustand with derived selectors while retaining the database schema.
- **Recovery/iteration features:** undo refunds the relevant purse, unsold players can enter another round, and presence/idle-room cleanup support repeated use by friends.
- **Domain data:** refresh scripts and imported official statistics enrich a 200+ player catalog; analytics explain resulting squads and auction outcomes.
- **Delivery:** Vite builds the browser app and Firebase hosts it. A deployed demo and user-confirmed play are separate evidence from load, transaction-safety or automated-test claims.

#### Evidence

- The earlier code review identified room-code joining, auctioneer-controlled updates, purses/squads, presence and idle-room cleanup. The later React revision replaced DOM-held state with Zustand/derived selectors without changing the database schema.
- The current local package.json at `C:/ABYUD/SIDE PROJ/Auction/ONLINE/FINAL` confirms the React/Vite/Zustand/Firebase stack and build/deploy/stat-refresh commands. No test script is declared there; the earlier QA review also found no relevant automated suite.
- Earlier repository review recorded a Firebase-hosted demo and official data for **200+ players**. User-confirmed group play establishes actual use, but not a measured user population, load capacity or paid adoption.
- Undo refunds purses and an unsold-player queue supports later rounds, giving concrete examples of state transitions worth explaining in an interview.
- Live demo availability and multiplayer contention behavior were not re-tested in this documentation task. Hosting a database-backed app is not evidence of independently verified transaction safety.

#### Originality

Original, single-author application in the recorded review, iterated Apr–Sep 2026. Use the formal title IPL Mock Auction. Discuss the React state migration and auction mechanics personally implemented; credit Firebase for realtime synchronization infrastructure.

#### Portfolio value

**Overall rank: #08.** A working product with direct user-confirmed use, visible iteration and real-time state management. Strong for product-builder, full-stack and frontend roles; can outrank more complex projects when the JD values shipped work and users. Automated-testing evidence was absent at the earlier QA review.

#### Resume wording and limits

Use IPL Mock Auction. Friends playing it supports used by friends, not commercial adoption or scale. Do not select it as QA evidence unless new tests exist, or promise safe concurrent writes without a focused check.

---

## 09 · KiranaAI

🔗 [github.com/AbyudShetty/KiranaAI](https://github.com/AbyudShetty/KiranaAI)

#### What it does

A team-built grocery-store automation platform connecting WhatsApp orders, multilingual extraction, inventory, credit ledgers, payment reminders and demand forecasting. It turns voice, image or text input into orders and exposes operational data through a web dashboard.

For the user's own resume, the most distinctive part is the ML/data pipeline: synthetic store/product histories, feature engineering, sales regression and stockout classification. This provides a business-facing ML example alongside the portfolio's agent infrastructure and retrieval work.

#### Tech

**Services:** Python, FastAPI, MongoDB/MongoDB Atlas, Twilio webhooks. **Language/media:** Gemini/Groq, Sarvam STT, Google Vision OCR, RapidFuzz and ElevenLabs TTS. **Personal ML work:** Pandas, NumPy, scikit-learn, XGBoost and model serialization. **Frontend:** React, TypeScript, Vite, Tailwind CSS and Recharts. A Google Vision integration does not establish general GCP infrastructure experience.

#### Architecture and engineering

- **Team ingestion workflow:** a Twilio webhook forwards WhatsApp text/audio/images to an ingestion service. Sarvam transcription, image OCR, normalization and Gemini/Groq parsing produce structured orders; fuzzy SKU matching maps noisy product names and aliases.
- **Store operations:** the persistence/alerts service maintains MongoDB orders, customer credit and inventory records; the Khata and Vasooli flows provide balances, aging and payment reminders. React/TypeScript dashboards consume API results.
- **Personal ML work:** the user implemented synthetic retail-data generation, calendar/festival/weather features, grouped lag/rolling features and most of the XGBoost regression/classification training code.
- **Forecast evaluation:** use the first 150 synthetic days for training and the last 30 for testing; shift sales before rolling calculations. Report regression and classification metrics separately rather than treating the business demo as evidence of real-store forecasting accuracy.
- **Integration boundary:** serving forecasts and wiring all ingestion/frontend features were shared team work; the training/data pipeline is the clearest personally attributable ML evidence.

#### Evidence

- [Public README](https://github.com/AbyudShetty/KiranaAI/blob/main/README.md) was read on 2026-10-27. It documents three FastAPI services, service ports, collections, endpoint contracts and integration boundaries.
- Inspected the local source checkout at `C:/ABYUD/HACKATHONS/HACKPRIX` on the same date. Its remote points to the upstream Kirana-orchestrator team repository; this is contribution evidence, not a claim that every local file is byte-identical to the public fork.
- Git blame attributes **all 331 lines of ML/src/generator.py, 142 lines of features.py, 294 lines of config.py and 81 lines of generate_data.py** to Abyud. The training script has **221 lines attributed to Abyud and 63 to a teammate**. These are inspection-time counts, useful for ownership, not resume size metrics.
- The inspected training code implements sales regression and stockout classification with a **150-day/30-day chronological split**. Feature code shifts sales before computing grouped rolling features. Data generation covers **180 days, 20 store clusters and 25 products** in the current local documentation/configuration.
- In contrast, the ingestion orchestrator is teammate-authored; the SKU matcher contains only a small personal contribution. Do not claim the whole voice-to-order stack as personal work.
- README processing-time, concurrency, SKU-accuracy and language-support claims have not been independently benchmarked here. Documentation lists full support for Hindi/Kannada/English and fallback behavior for several other languages. Forecast metrics are synthetic-data results, not proof of retail demand performance.

#### Originality

Team project, forked from AKPranav1/Kirana-orchestrator; the earlier review recorded 16 of 66 commits by Abyud. The fresh file-level check is more informative: say co-built the platform, implemented the synthetic-data/feature pipeline and co-developed the XGBoost training code. The team owns the broader ingestion, service, reminder and dashboard integration story. Personal ML work began in Jun 2026 per the inspected history.

#### Portfolio value

**Overall rank: #09.** Broad applied-AI and full-stack scope around a concrete business problem: multilingual ingestion, product matching, credit workflows and forecasting. Move it higher for business automation and speech/AI integration roles. Narrow personal-ownership claims before using the team-wide architecture as individual evidence.

#### Resume wording and limits

Co-built the platform; implemented synthetic generation/features and most training code. Do not claim sole authorship of speech/OCR ingestion, all frontend pages, Twilio reminders or deployment. Synthetic-data forecasts do not establish real-store accuracy. Do not claim all ten languages are equally validated.

---

## 10 · Healthcare Appointment & Patient Record Manager

🔗 [github.com/AbyudShetty/Healthcare-Appointment-and-Patient-Record-Manager](https://github.com/AbyudShetty/Healthcare-Appointment-and-Patient-Record-Manager)

#### What it does

A full-stack healthcare records and appointment platform with patient, clinician and administrator workflows. It connects registration, appointment scheduling, clinical notes/history, document handling, reminders, reporting and audit records behind role-based access.

The user's personal contribution spans the web application shell, auth/session integration, frontend data state, patient-ID concurrency handling and performance/load tests. That makes it useful as concrete full-stack/QA evidence even though other teammates implemented major platform features.

#### Tech

**Backend/data:** Python, Django, Django REST Framework, PostgreSQL and transactional locking. **Frontend:** React, Redux, Material-UI and Axios. **Platform features:** JWT, MFA, RBAC, AES-256 records/documents and audit logging. **Background/testing:** Celery/Redis, Locust, database-volume tests and CI. Platform feature names describe the system, not automatic personal authorship.

#### Architecture and engineering

- **Backend domain modules:** DRF separates authentication, patients, appointments, electronic records, notifications, reporting and audit logging over PostgreSQL.
- **Role-based frontend:** React/Redux holds auth, appointments and records state; guarded routes restrict module access; an Axios client attaches and refreshes JWTs.
- **Concurrent data handling:** patient ID allocation uses select_for_update rather than relying on unchecked application-side increments.
- **Background and sensitive-data workflows:** Celery/Redis support reminders; encrypted records/documents and audit events are platform-level features with distinct implementation owners.
- **Traceable delivery:** features/tests use shared HCRM requirement identifiers; Locust and database-volume tests complement unit/integration/system testing across the team.

#### Evidence

The later resume-session authorship check supersedes the older assessment that this was a single scaffold push: approximately 130 commits across about eight contributors, with 46 commits under Abyud's account. The system includes requirement-linked features, authentication/authorization and multiple testing layers.

**Abyud's verified parts:** React app shell, routing and role guards, shared layout/theme, Redux auth/appointments/records slices, Axios JWT attach/refresh, login and clinician dashboard; thread-safe patient ID generation using select_for_update; Locust load tests, 10,000-record database performance tests, document-upload tests, and parts of appointments/patients/EPR views.

**Teammates' parts:** admin pages, patient pages, most other clinician pages, encryption.py, concurrent-booking tests and system tests. There is no React document-upload screen. Do not turn platform-wide AES-256 or MFA features into a claim that Abyud implemented them.

The local README was re-read on 2026-10-27 and explicitly maps functions to HCRM-F requirement IDs and backend/frontend modules. Its architecture supports the contribution-focused interpretation above. Performance scenarios include a 500-user Locust workload and 10,000-record database tests from the earlier authorship review; do not invent response-time/throughput results without checking the reports.

#### Originality

A substantive full-stack team project. Say co-built for the system and built/wrote for the specific personal components above. Coursework context does not erase the implemented frontend, backend and testing contributions.

#### Portfolio value

**Overall rank: #10.** Useful full-stack and QA evidence with an unusually clear personal contribution: app structure, auth state, API integration, database concurrency and load/performance tests. Move it higher for React/DRF, testing or enterprise-app roles. Keep system-wide capabilities separate from personally implemented work.

#### Resume wording and limits

Co-built at system level. Personal work includes app shell, Redux/Axios auth, clinician dashboard, thread-safe patient IDs, Locust and volume/upload tests. Do not claim admin pages, encryption.py, most other clinician pages, concurrent-booking tests or system tests; there is no React document-upload screen.

---

## 11 · Message Notification Router

🔗 [github.com/AbyudShetty/Message-Notification-Router](https://github.com/AbyudShetty/Message-Notification-Router)

#### What it does

A notification-routing system that decides whether a WhatsApp-style message should interrupt the user, wait in a digest or be muted. It combines message semantics with relationship/sender/business history, urgency and risk, including image and voice content rather than text alone.

The main design decision is keeping final routing deterministic: models can extract useful features, but a weighted scorecard produces the action and an explainable contribution breakdown. It is a normal applied-AI project on resumes, not a separate hackathon section by default.

#### Tech

**Core:** Python 3.11, Pydantic/settings, Pandas and RapidFuzz. **Perception:** text experts, NVIDIA-hosted vision models, Sarvam speech-to-text for Hindi/English/code-mixed audio and optional LLM feature extraction. **Evaluation:** pytest, modular offline test fixtures, cached media outputs and routing evaluation modules. Provider dependencies are not proof of training a custom vision or speech model.

#### Architecture and engineering

- **Perception stage:** text, image and voice experts produce a shared semantic representation. Vision outputs are cached; Sarvam speech recognition handles Hindi, English and code-mixed voice inputs.
- **Context stage:** sender/entity knowledge and message history contribute relationship, business, interaction and safety signals rather than scoring only the current text.
- **Decision stage:** a transparent 15-contributor weighted scorecard chooses Notify, Digest or Mute. Models extract features upstream; they do not control the final routing action by default.
- **Evaluated alternatives:** optional LLM override/tiebreaker/classifier paths remain in the project; documentation records why their safety, latency or cost tradeoffs did not justify making them the default.
- **Evaluation surface:** offline tests and evaluation modules exercise the modular pipeline and routing rules. Runtime configuration determines whether media/optional model calls occur.

#### Evidence

- Re-read the local README on 2026-10-27 at `C:/ABYUD/HACKATHONS/ORCHESTRATE/August26`; its architecture maps perception → semantic object → history/context → deterministic engine.
- The project documents **15 weighted contributors** and **244 offline tests**, consistent with the earlier file-tree review. The suite was not rerun during this inventory edit.
- Documentation compares LLM override, tiebreaker and full-classifier alternatives; it records a safety regression for override and weak benefit/cost tradeoffs elsewhere. Treat those as recorded experiment conclusions rather than a benchmark against every possible model.
- The repository separates perception, history, context, decision, models and evaluation modules. Optional LLM paths do not mean the default routing action is generated by an LLM.
- README statements such as zero safety violations are limited to its own tested scenarios. They do not establish universal safety, production deployment or a measured public-user population. Runtime media understanding can require provider keys and network calls.

#### Originality

Original implementation attributed to Abyud in the earlier review. Built from an organizer-supplied challenge context, but present it as a normal project unless an application specifically asks about competitions. Credit external vision/STT services instead of implying personal model training.

#### Portfolio value

**Overall rank: #11.** Good Python/applied-AI evidence: multimodal inputs, modular perception, a deterministic final scorecard and a documented 244-test suite. It overlaps with Buy or Wait? in a broad resume, so use it when notification ranking, speech, multimodal processing or test design adds something distinct. Test totals are from the earlier review.

#### Resume wording and limits

Normal project, not a hackathon section by default. Say deterministic final routing with model-assisted perception. Tests/own evaluation do not establish universal safety, no hallucinations or production deployment. Distinguish provider model integration from custom model training.

---

## 12 · Astronaut Health Digital Twin

🔗 [github.com/AbyudShetty/Astronaut_health_digital_twin](https://github.com/AbyudShetty/Astronaut_health_digital_twin)

#### What it does

A physiological digital-twin research prototype exploring how sleep pressure/fatigue and vestibular adaptation interact during simulated spaceflight. It couples a sleep-homeostasis model with a vestibular-mismatch model and compares coupled versus independent runs to examine the effect of the proposed feedback mechanism.

Monte Carlo variation, scheduled events and selected BioGears responses support scenario exploration. The application includes a **2D dashboard with a 3D viewing area**, run comparisons, charts, natural-language explanations and a report export. It is a scientific software prototype, not an operational astronaut-health decision system.

#### Tech

**Simulation:** Python, coupled ODE models, Monte Carlo sampling and an event scheduler. **Services:** FastAPI and BioGears CLI integration for selected physiological events. **UI:** Jinja2/JavaScript, Three.js, Chart.js and browser PDF export. **Explanations:** Groq/Llama and Anthropic Claude APIs. The underlying Borbely/Oman models and BioGears are external scientific/software foundations.

#### Architecture and engineering

- **Scientific core:** compose Borbely sleep homeostasis, Oman vestibular mismatch and fatigue models in a defined timestep order; the proposed coupling gates vestibular adaptation using sleep pressure.
- **Discrete events:** an event scheduler controls sickness, sleep disruption and EVA/exercise; BioGears is integrated for selected acute cardiovascular responses rather than replacing the entire ODE core.
- **Uncertainty and comparisons:** Monte Carlo runs vary physiological parameters; coupled/uncoupled runs and sensitivity endpoints expose how assumptions change simulated risk.
- **Application layers:** FastAPI exposes simulation/data/configuration APIs; a 2D dashboard contains an Interstellar-themed Three.js viewing area, charts and run comparisons.
- **Explanation/reporting:** LLMs explain simulated risk in natural language; browser-side PDF export summarizes the run. Neither an LLM explanation nor a flight-surgeon-style signature block establishes clinical review.

#### Evidence

- The local V2 README at `C:/ABYUD/COLLEGE/6th sem/Digital Twins/Astronaut/V2` was re-read on 2026-10-27. It documents the model equations, timestep dependency order, event scheduling, API endpoints, Monte Carlo layer and frontend components.
- The earlier repository review recorded concrete scene assets, risk-driven visualization and run/report surfaces, alongside **5 of 16 commits** attributed to Abyud. The user's later dashboard correction takes precedence over the README's broad 3D-dashboard wording.
- The README cites scientific literature for components and lists limitations: uncited nonlinear exponents, an unconstrained coupling parameter, counterfactual approximation and missing validation against real astronaut actigraphy.
- README novelty claims such as first coupled implementation have not been independently established. Describe a proposed coupling and implementation, not a peer-reviewed discovery.
- The project is separate from CardioTriage despite shared collaborators and BioGears integration. No clinical validation, published-paper status or measured patient outcome is established here.

#### Originality

Team research project forked from thorOdinson16. The earlier review records partial authorship; establish which scientific, API or visualization modules are personal before using built for them. Use co-built/contributed to at system level and credit the underlying scientific models and BioGears.

#### Portfolio value

**Overall rank: #12.** Technically distinctive physiological modeling, coupled ODEs, stochastic simulation and a 2D dashboard with a 3D viewing area. Stronger for digital-twin, simulation and research roles than for general software openings. Confirm personal modeling contributions and avoid clinical-validation or publication claims.

#### Resume wording and limits

Use 2D dashboard with a 3D viewing area. Call the coupling proposed and the project a simulation/research prototype. No verified first-in-literature, peer-reviewed publication, ISS deployment or clinical validity. Establish personal scientific-module ownership before claiming it.

---

## 13 · VRATA

🔗 [github.com/AbyudShetty/VRATA](https://github.com/AbyudShetty/VRATA)

#### What it does

A privacy-preserving reliability-estimation research project for mutually distrustful wind-farm operators. It estimates fleet-wide Weibull shape and scale from censored failure data while keeping individual operators' raw records local.

The scientific/computational task combines survival-data preparation, sufficient-statistic aggregation, numerical maximum-likelihood estimation and malicious-secure multiparty computation. It is MPC-based collaborative estimation, not conventional federated neural-network training.

#### Tech

**Statistics/numerics:** Python 3.10+, NumPy, SciPy, Pandas/PyArrow, censored-Weibull MLE and Newton-Raphson. **Secure computation:** MP-SPDZ, MASCOT, serializers/runners and fixed-point/approximation support. **Execution:** Python drivers, single-host processes and Docker-isolated parties. MASCOT is an upstream protocol implemented by MP-SPDZ, not an original cryptographic invention.

#### Architecture and engineering

- **Canonical survival data:** load/validate CARE-style failure/censoring data and partition it by operator before estimation.
- **Local statistics:** each operator computes four sufficient-statistic contributions for the current iteration; raw failure/maintenance records do not need to be sent to the aggregator.
- **Secure aggregation:** Python serializers/runners bridge to MP-SPDZ's MASCOT implementation. The project uses an existing malicious-secure MPC framework; it does not invent the cryptographic protocol.
- **Numerical estimation:** aggregate the contributions, evaluate the censored-Weibull score and iterate Newton-Raphson to estimate shape and scale.
- **Evaluation/deployment:** compare plaintext and MPC estimates with local-only, federated-average, differential-privacy and moments baselines; single-host subprocess and container-isolated three-party drivers are documented.

#### Evidence

- [Public README](https://github.com/AbyudShetty/VRATA/blob/main/README.md), retrieved 2026-10-27, describes four local contributions, three operator partitions, the solver loop, baseline implementations and separate single-host/container execution paths.
- It reports agreement with centralized estimates within **0.0022% for shape beta and 0.00001% for scale eta**, with comparisons against local-only, federated-average, DP and method-of-moments alternatives. These are repository-reported experiments, not results reproduced for this inventory.
- The documented tree contains data preparation, numerical approximation/solver, MPC bridge, orchestration/evaluation and tests, plus a paper.tex manuscript.
- Earlier history recorded **1 of 36 commits** under Abyud. That does not measure non-code research effort, but does make unqualified claims of personally implementing MASCOT or the full solver inappropriate.
- The user confirmed that the paper is written but unpublished. A README publication heading is not publication evidence, and submission/review status remains unconfirmed.

#### Originality

Team research project, forked from thorOdinson16. The user confirmed that the paper was written but not published. Say unpublished manuscript; do not say under review or submitted unless the user confirms that status.

#### Portfolio value

**Overall rank: #13.** Cryptographic MPC and reliability estimation offer specialist research/distributed-systems depth. Move it higher for privacy-preserving computation, scientific computing or research roles. General resume value is limited by the need to establish the personal protocol/solver contribution; the manuscript is unpublished.

#### Resume wording and limits

Co-built/contributed to; do not claim personal invention of MASCOT or the full team protocol/solver. The manuscript is unpublished; under review/submitted is unconfirmed. MPC over sufficient statistics is not homomorphic encryption or federated neural-network training.

---

## 14 · CardioTriage

🔗 [github.com/AbyudShetty/CardioTriage](https://github.com/AbyudShetty/CardioTriage)

#### What it does

A real-time mass-casualty triage game where the player manages patient treatment under time, budget and trust constraints. Five cardiovascular/respiratory conditions produce changing vitals, intervention tradeoffs and penalties; decisions are reflected in a command-center interface with ECG and a 3D heart.

The BioGears-backed path generates scenarios and reads physiological outputs. A fallback model keeps the game running without the binary, so the value lies in the implemented simulation/integration and interactive application, not a claim that every run uses clinical simulation or that game penalties are medically validated.

#### Tech

**Backend:** Python, FastAPI, asyncio, WebSockets/REST, NumPy and Pandas. **Physiology integration:** BioGears C++ CLI, generated XML scenarios and CSV output parsing. **Frontend:** React, TypeScript, Vite, Zustand, Tailwind CSS, Three.js/R3F/Drei, canvas ECG and documented Framer Motion transitions.

#### Architecture and engineering

- **Concurrent simulation:** a FastAPI/asyncio engine spawns patients and updates condition, budget, trust and intervention state on ticks; WebSocket broadcasts and REST actions synchronize the browser.
- **BioGears adapter:** per-patient work directories isolate generated XML scenarios and CSV outputs. A C++ CLI run supplies physiology outputs that the adapter post-processes into game state.
- **Fallback path:** if the BioGears binary is unavailable, a hardcoded model preserves game mechanics. Do not assume every demonstration actually ran the physiology engine.
- **Visualization:** React/Zustand holds simulation state; Three.js/R3F renders a heart whose animation responds to vitals, while canvas ECG and alert overlays show changing conditions.
- **Gameplay constraints:** five condition types, treatment penalties, noisy/partly hidden vitals and the 120-second session create the triage/resource-management problem.

#### Evidence

- Local README at `C:/ABYUD/HACKATHONS/DIGITAL TWINS/CardioTriage` was re-read on 2026-10-27; it specifies async per-patient updates, isolated working directories, BioGears invocation/parsing and the fallback path.
- Named frontend components include PatientQueue, HeartViewport, ECGOverlay, intervention controls and metrics. The earlier repository review also found the actual textured heart GLB asset.
- Documented behavior includes a **120-second** session, five condition types, noisy/partly hidden vitals and an intervention penalty model. These are application mechanics, not independently validated clinical treatment rules.
- Earlier history recorded **3 of 13 commits** attributed to Abyud. Exact feature ownership needs a fresh blame check before personal claims.
- No independent patient study, formal medical validation, throughput benchmark or current passing-test result was established during this review. Running with hardcoded fallback physiology must not be described as a live BioGears demonstration.

#### Originality

Team-built simulation project, forked from thorOdinson16, with partial personal authorship. Co-built is appropriate at system level. Credit BioGears for the external physiology engine and collaborators for their modules; keep competition origin as context rather than the resume headline.

#### Portfolio value

**Overall rank: #14.** A memorable real-time physiology/graphics demonstration with a 3D heart, live vitals and interactive interventions. Strong for simulation, healthcare visualization or graphics roles. The team split needs checking, and a BioGears-backed game is not evidence of a clinically validated triage system.

#### Resume wording and limits

Credit BioGears and acknowledge the fallback when discussing a demo. Do not call game penalties clinically accurate without validation or imply measured real-time BioGears throughput from architecture alone. Co-built at system level.

---

## 15 · MiniRAFT Drawing Board

🔗 [github.com/AbyudShetty/MiniRAFT-DrawingBoard](https://github.com/AbyudShetty/MiniRAFT-DrawingBoard)

#### What it does

A real-time collaborative drawing board that makes distributed consensus visible. Users draw on a shared canvas while a live dashboard exposes the leader/follower/candidate roles, terms, log lengths and commit indices of a three-node cluster.

The drawing actions are the application workload for a team-implemented RAFT demonstration. Late clients replay committed state, and stopping a replica demonstrates leader re-election and catch-up. The project's educational value is the connection between replicated state and visible application behavior.

#### Tech

**Server/runtime:** Node.js 20/ES modules, HTTP, Express and ws. **Client:** vanilla HTML/CSS/JavaScript and HTML5 Canvas. **Deployment:** Docker Compose, nginx and per-replica services. Express is verified as a project dependency; that alone does not establish the user's personal Express experience.

#### Architecture and engineering

- **Client/gateway separation:** browser drawing operations reach a WebSocket gateway, which discovers the leader and forwards writes over HTTP; committed strokes are broadcast back to clients.
- **Replicated log:** three Node.js replicas maintain roles, terms, logs and commit indices; randomized elections and vote checks select the leader.
- **Synchronization:** append-entries logic reconciles follower logs, heartbeats maintain leadership, and non-leader stroke endpoints redirect the gateway toward the leader.
- **Replay semantics:** new clients rebuild the canvas from the committed log; clear commands delimit the visible history.
- **Failure demonstration:** stop one replica, observe a new election, then restart it to inspect catch-up. A three-node majority tolerates one failed node; the documented demo is not a proof of complete RAFT correctness.

#### Evidence

- [Public README](https://github.com/AbyudShetty/MiniRAFT-DrawingBoard/blob/main/README.md), retrieved 2026-10-27, documents the browser → gateway → leader/replica topology, API endpoints and service ports.
- Endpoints cover request-vote, append-entries, heartbeat, stroke submission, status and log synchronization; follower writes return a redirect and the gateway can reroute.
- The failure walkthrough stops and restarts one node; majority is **two of three**. A documented successful failure demo does not prove safety/liveness for arbitrary partitions, timer races, process restarts or crash persistence.
- Earlier history recorded **2 of 15 commits** under Abyud. Personal ownership of consensus internals is not established by the README's from-scratch claim.
- Current tests were not run and no exhaustive RAFT conformance result is claimed. Use concrete implemented/demoed behaviors rather than claiming production-grade consensus.

#### Originality

Team project, forked from thorOdinson16. Earlier review recorded 2 of 15 commits by Abyud. Use contributed to and establish which consensus, dashboard or integration work is his before claiming it personally.

#### Portfolio value

**Overall rank: #15.** A focused demonstration of leader election, replication, observability and node-failure behavior. Useful for distributed-systems roles and can move above visually stronger work for that JD. Establish which parts Abyud wrote before claiming the from-scratch RAFT implementation.

#### Resume wording and limits

Contributed to the team project; establish personal module ownership. Describe a RAFT demonstration and observed behavior. Do not claim formal verification, production-grade consensus, persistent crash safety or exhaustive partition testing from a Docker failure walkthrough.

---

## 16 · Gaussian Splat Viewer

🔗 [github.com/AbyudShetty/3D-Visualization-of-Gaussian-Splats](https://github.com/AbyudShetty/3D-Visualization-of-Gaussian-Splats)

#### What it does

A browser-based first-person viewer for captured 3D Gaussian Splat scenes, including campus environments. Users explore with mouse look and keyboard movement, adjust sensitivity and inspect camera coordinates while staying within configurable spatial limits.

An adjustable version helps determine useful movement bounds; a configured version removes those editing controls for a cleaner exhibit. This is an application of existing splat rendering and loading libraries to an explorable scene, not a new reconstruction or rendering algorithm.

#### Tech

**Rendering/loading:** Three.js 0.178/WebGL and @sparkjsdev/spark for .spz/Gaussian Splat assets. **Interaction:** PointerLockControls, browser JavaScript/ES modules, keyboard/mouse controls and HTML inputs. **Delivery:** static hosting/local web server, with CDN-loaded dependencies. Match exact filenames to the chosen revision when discussing code.

#### Architecture and engineering

- **Renderer integration:** load .spz Gaussian Splat scenes with the existing Spark loader on top of Three.js/WebGL; credit those libraries for rendering and loading.
- **Camera controls:** Pointer Lock mouse look and keyboard translation provide first-person exploration; sensitivity, current coordinates, velocity and damping are exposed in the app.
- **Spatial constraints:** adjustable bounds support exploration/testing; a configured-bounds variant offers a simpler final viewing surface.
- **Delivery:** browser ES modules/CDN dependencies avoid a mandatory npm build; a local/static web server serves scene assets.
- **Personal boundary:** the previously reviewed Adjustable.html/Configured.html work is the user's; later renderer fixes and Vercel changes include teammates. README example filenames are not an authorship map.

#### Evidence

- [Public README](https://github.com/AbyudShetty/3D-Visualization-of-Gaussian-Splats/blob/main/README.md), retrieved 2026-10-27, documents WASD plus vertical movement, sensitivity, damping, live position and configurable bounds.
- README example filenames are index-adjustable.html/index-hardcoded.html; the earlier actual-code authorship review identified Adjustable.html and Configured.html. This naming difference should not be treated as evidence of two unrelated implementations.
- Earlier review found a screenshot and real .spz scene files; the README's template file tree says its sample a1.spz is not included. Inspect the current tree before promising bundled assets or reproducing the demo.
- Later authorship review attributes the viewer variants to Abyud and renderer fixes/Vercel work to teammates. The application is not wholly single-author in the broad sense previously claimed.
- The README lists large-file loading and manual bounds as limitations. Browser compatibility and smoothness are documentation claims, not performance measurements reproduced here.

#### Originality

Original viewer/application work with team contributions. Earlier single-author wording was too broad. Credit collaborators where describing their renderer and deployment changes.

#### Portfolio value

**Overall rank: #16.** A compact, relevant graphics/browser project with actual captured scene assets and first-person navigation. Raise it for WebGL, AR/VR or 3D visualization openings. Its narrower scope and team renderer contributions make it a supporting general-resume entry.

#### Resume wording and limits

Describe integration of existing Three.js/Spark rendering, navigation and bounds. Do not claim to invent Gaussian Splatting, train a renderer or own all teammate deployment/renderer fixes. Inspect bundled assets/current filenames before promising exact reproduction.

---

## 17 · MediVault

🔗 [github.com/AbyudShetty/Medivault](https://github.com/AbyudShetty/Medivault)

#### What it does

A prescription-management application that digitizes image prescriptions and makes the resulting records searchable and editable. It combines OCR outputs with LLM parsing to extract doctor/medicine/dosage information, then supports record CRUD and basic prescription/medicine analytics.

The distinguishing engineering work is connecting uncertain document extraction to a normalized relational schema and a usable web workflow. It is a focused database/web project; the word AI describes extraction integration, not a personally trained medical model.

#### Tech

**Backend/data:** Python, Flask, MySQL 8 and a SQL schema with triggers/procedures. **Extraction:** Tesseract/pytesseract, EasyOCR, Google Vision and Groq/Llama 3.3. **Frontend:** HTML/CSS, Bootstrap and JavaScript/Jinja templates. The README mentions password hashing; the exact library/security behavior requires code verification before a specific bcrypt claim.

#### Architecture and engineering

- **Upload-to-record pipeline:** Flask accepts a prescription image, gathers OCR text from Tesseract/EasyOCR/Google Vision and uses Groq/Llama parsing to turn it into structured prescription/medication fields.
- **Relational persistence:** MySQL separates users, prescriptions, medications and logs, using foreign keys and cascade behavior; triggers support logging/count updates and stored procedures/aggregates support queries.
- **User workflow:** template-based login, dashboard, detail/edit and analytics screens expose upload, search and CRUD operations through a Bootstrap/JavaScript interface.
- **Search/reporting:** query by medicine, doctor or issue and aggregate medication/prescription trends; retrieval here is relational search, not evidence of a vector database or RAG system.
- **Scope:** a compact application centered on app.py and medivault.sql; multiple OCR services do not by themselves establish robust medical extraction or model accuracy.

#### Evidence

- [Public README](https://github.com/AbyudShetty/Medivault/blob/main/README.md), retrieved 2026-10-27, lists upload, search, CRUD and analytics screens and a schema of User, Prescription, Prescription_Medication and Prescription_Log.
- It documents 3NF normalization, foreign keys/cascade deletion, search indexes, logging/count triggers and stored procedures. These are concrete database-design discussion points; database constraints do not by themselves validate OCR correctness.
- The earlier file-tree review found a compact Flask app.py implementation, templates and medivault.sql rather than a large service architecture.
- The user can discuss comparing/combining OCR text and parsing structured medicine fields, but no held-out extraction accuracy, reliability comparison between the three OCR engines or clinical-safety assessment was established here.
- Authentication/deployment hardening and passing automated tests were not independently reviewed for this rewrite. Describe the implemented application without production-healthcare or privacy-certification claims.

#### Originality

Original focused web/database project in the earlier review; coursework context is likely but not independently confirmed. Use built for personally verified Flask/SQL/extraction work. Credit OCR engines and external LLM APIs, and avoid implying personal clinical-data collection or model training.

#### Portfolio value

**Overall rank: #17.** Useful Flask/MySQL/OCR evidence with a clear end-user workflow, but a smaller architecture and less distinctive engineering proof than the stronger entries. A practical fallback for database/OCR roles; do not equate multi-engine OCR with measured extraction accuracy.

#### Resume wording and limits

Describe OCR/LLM-assisted extraction and relational CRUD. No invented OCR accuracy or medical validation. Password hashing/library, data privacy and deployment security need direct checks before detailed security claims.

---

## 18 · Reality Compiler

🔗 [github.com/AbyudShetty/Reality-Compiler](https://github.com/AbyudShetty/Reality-Compiler)

#### What it does

A frontend prototype for exploring a business idea as an operating workspace. A user describes an idea, watches a staged compilation animation and opens a dashboard of business-domain panels and their relationships.

The implemented work is the interaction flow, visual orchestration, modular UI/state boundaries and pipeline graph. The claimed domain engines are presentation modules with stubbed services, so the prototype does not actually compile business plans or simulate an operating company.

#### Tech

**Application:** Next.js 15 App Router, React 19, TypeScript and Tailwind CSS. **State/data boundaries:** Zustand and TanStack Query. **Visualization/motion:** React Flow, Recharts and documented Framer Motion use. **UI:** Radix primitives, Lucide and shared style utilities. Presence in a README/dependency list is not enough to infer individual mastery of every library.

#### Architecture and engineering

- **Application flow:** Next.js routes connect idea input, a compiling screen and a workspace; the compilation orchestration hook advances staged messages using a local clock.
- **Engine modules:** domain folders contain a panel component, Zustand state, service boundary and types, with a central registry controlling composition.
- **Workspace UI:** React Flow visualizes the pipeline; grouped Foundation/Operations/Validation modules, charts and status cards present an operating-model concept.
- **Presentation stack:** Framer Motion, Tailwind and Radix components support animated transitions and shared interface primitives; TanStack Query is available for data fetching.
- **Unimplemented boundary:** services remain stubs, persistence is scaffolded and progress is simulated. There is no evidence of thirteen independently running AI services or a functioning financial/business simulator.

#### Evidence

- [Public README](https://github.com/AbyudShetty/Reality-Compiler/blob/main/README.md), retrieved 2026-10-27, explicitly labels it an early presentation prototype with a frontend-only timing clock and stubbed engine services.
- The documented routes and files support an idea → compiling → workspace flow, per-engine state/types/service modules and a central registry. The compiling screen visually represents 13 engines; this is not a count of running backend services.
- React Flow provides a navigable relationship graph; the workspace groups domain panels into Foundation, Operations and Validation. Charts/cards include placeholder outputs.
- The roadmap lists real backend/LLM wiring, simulation persistence and event-driven progress as future work. Do not describe any of those as complete based only on scaffolding.
- No backend evaluation, operating-model correctness metric or verified end-user adoption is established. Its value is in UI prototyping and module boundaries.

#### Originality

Original single-author frontend prototype in the recorded review, dated Jul 2026. Describe built a prototype/interaction flow. The current state is not evidence of personally building thirteen autonomous agents, market-analysis services or financial forecasting engines.

#### Portfolio value

**Overall rank: #18.** A frontend interaction prototype with a strong idea-to-workspace flow and graph visualization. Useful for UI prototyping, but currently the weakest broad engineering entry because its engine services and business simulations are stubbed. Present it explicitly as a prototype, not a functioning multi-engine platform.

#### Resume wording and limits

Always label it a frontend/presentation prototype. Do not call the timed animation live backend orchestration, stubbed services working agents, or placeholder charts real simulation results. Keep its value focused on interaction design and frontend modularity.

---

## E01 · CAVE Lab — Summer Intern, IMU Motion Capture Pipeline

🔗 [github.com/AbyudShetty/IMU-Reconstruction-SlimeVR](https://github.com/AbyudShetty/IMU-Reconstruction-SlimeVR)

**Classification:** Experience → Summer Internship. Centre for Augmented and Virtual Environments (CAVE) Lab, PES University · Jun–Jul 2026. Include under Experience on resumes; do not count it among the selected projects.

#### What it does

A full-body motion-capture pipeline connecting 10 MPU6050 IMUs on distributed ESP32 nodes through ESP-NOW hubs and UDP to the open-source SlimeVR server, then via WebSocket to a Three.js skeletal viewer. Work covered sensor integration, quaternion orientation, calibration, inverse-kinematics integration and reproducible experiments. The user confirmed that the team tested it by wearing the system and that it worked; no numerical tracking-accuracy benchmark is recorded.

#### Tech

ESP32, MPU6050, Arduino/embedded firmware, ESP-NOW, UDP, WebSockets, HTTP, quaternion processing, calibration, inverse kinematics, the open-source SlimeVR server (Kotlin/JVM), Three.js, Vite and Docker Compose. Identify the components personally changed when discussing implementation; SlimeVR's server and IK foundation are upstream work.

#### Architecture and engineering

- Distributed ESP32/MPU6050 nodes acquire orientation data; ESP-NOW hubs and UDP transport it to the server side.
- The open-source SlimeVR server supplies the skeletal/IK foundation; WebSocket/HTTP connect control and visualization surfaces.
- Calibration, recording and debugging workflows support repeatable physical experiments; Docker Compose brings up the backend/viewer environment.
- The team tested the system by wearing the sensors. Preserve the user-supplied wording below; commit counts do not override personal knowledge of hardware/integration work.

#### Evidence

The earlier review found a matching repository architecture and documented Dockerized setup. Git history recorded 9 of 20 commits under the user's account, but the user's hardware, integration and team work extends beyond that count. The three resume bullets below were supplied directly by the user and are authoritative for wording. Preserve them verbatim unless the user asks for a change; do not rewrite them from commit evidence. Wear testing is user-confirmed, not an independently measured validation result.

#### Originality

Team internship work based on the open-source SlimeVR ecosystem, with a repository fork from thorOdinson16 / BioMechanicalTwin. Credit SlimeVR explicitly. Describe developing/debugging/integrating the motion-capture pipeline, not building the SlimeVR server or entire motion-capture stack from scratch.

#### Portfolio value

Very high as professional experience: hands-on work spans embedded sensing, network transport, backend integration and real-time visualization, with physical testing in a lab. Keep it visible across general resumes and emphasize it for embedded, robotics, AR/VR, systems and digital-twin roles. It is intentionally outside the project ranking because internship experience has a different role on the resume.

#### Resume wording and limits

Keep this under Experience, not among selected projects. Name SlimeVR, preserve the three user-supplied bullets verbatim unless asked, and avoid from-scratch-server or numerical accuracy/latency claims without measurements.

#### Fixed resume bullets — user wording

1. Developed and debugged a real-time motion-capture system using 10 MPU6050 IMUs across distributed ESP32 nodes, processing quaternion orientation data and integrating calibration and inverse kinematics for full-body motion reconstruction.
2. Integrated the end-to-end sensor pipeline across ESP-NOW, UDP, WebSocket, and HTTP, connecting embedded sensor nodes to the SlimeVR server and Three.js visualization layer for real-time skeletal tracking.
3. Containerized the backend and visualization stack with Docker Compose and implemented recording, calibration, and debugging workflows to support reproducible motion-capture experiments and system validation.

---

## Master Skills List

Copy-ready LaTeX block. Rows hold **tool and technology names and standard terms only**. Descriptive phrases live in the project table below and belong in the bullet of the project that used them. Trim per JD; this is a master, not a one-page list.

```latex
%-----------TECHNICAL SKILLS-----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in,label={}]
\small\item{
\textbf{Languages:} Java, Python, JavaScript, TypeScript, Kotlin, C++, SQL, Bash \\
\textbf{Backend \& APIs:} Spring Boot, Spring Data JPA/Hibernate, Django, Django REST Framework, FastAPI, Flask, Node.js, Fastify, Firebase Cloud Functions, Celery, Redis, REST APIs, OpenAPI, JSON Schema, Webhooks, WebSockets, JWT, RBAC, Microservices \\
\textbf{Databases:} PostgreSQL, MySQL, MongoDB, SQLite, H2, JPQL, Firebase Realtime Database, Redis, Query Optimization, Schema Design \\
\textbf{Frontend \& 3D:} HTML, CSS, JavaScript, TypeScript, React, Next.js, Redux, Zustand, Vite, Tailwind CSS, Three.js, React Three Fiber, Drei, WebGL, OpenGL, Gaussian Splatting, Mixamo, Chart.js, React Flow, Streamlit, Unity, Blender \\
\textbf{AI/ML \& NLP:} PyTorch, NumPy, Pandas, SciPy, OpenCV, scikit-learn, XGBoost, LightGBM, Hugging Face Transformers, Polars, DuckDB, NumPyro, JAX, ArviZ, OCR, Speech-to-Text, LLM APIs, MCP, Claude Code, Codex, Prompt Engineering \\
\textbf{Security:} AES-256, TLS, Threat Modeling, CodeQL \\
\textbf{Testing \& DevOps:} Vitest, JUnit 5, MockMvc, PyTest, unittest, Locust, Git, GitHub, GitLab, CI/CD, Docker, Vercel, Cloudflare Workers, Firebase Hosting, Linux, Code Review \\
\textbf{Systems \& Embedded:} Distributed Systems, RAFT, MP-SPDZ, Digital Twins, Monte Carlo Simulation, ESP32, Arduino, IMU Sensors, ESP-NOW, UDP, Quaternions, Inverse Kinematics \\
\textbf{Certifications:}
  \href{https://drive.google.com/file/d/1Un9urAB1e5umKnBkSQSQxqiQ5GlB3ug6/view?usp=sharing}
  {Introduction to Large Language Models,}
  \href{https://drive.google.com/file/d/1DZba15M0GHbCLaPMhxXTMYfmFMcig7IB/view?usp=sharing}
  {Deep Learning - IIT Ropar}
}
\end{itemize}
```

### Project-level skills: say these in the project bullet, never in the skills row

| Phrase | Use it in |
|---|---|
| Schema-constrained extraction, grounding and verification, task-based model routing, token-cost tracking, multimodal pipelines | Buy or Wait?, Message Notification Router |
| Prompt-injection defense and tests, confusion matrices, precision/recall, confidence calibration | Buy or Wait?, Message Notification Router |
| Transactional outbox, idempotency, pessimistic locking, BFS/DFS graph analysis | AEGIS |
| Immutable audit logging, secure coding, multi-factor login, regression, load and performance testing | Healthcare |
| Secrets management, structured error responses | IPL Mock Auction (`functions/index.js`) |
| Reduced-motion accessibility, scroll-driven camera animation, spring-physics animation, adaptive performance tiering, design tokens, decal geometry, post-processing (Bloom, Vignette) | Portfolio |
| Bayesian and mixed-effects modeling, causal identification, CRPS and coverage, synthetic-data simulation, pre-registered evaluation, ablation studies, UDP packet decoding | TyreTrace — newly reviewed; see the ranked entry |
| Adaptive signal filtering, foot-lock root motion, sensor calibration, coordinate transforms | CAVE Lab internship |
| Isolated Docker networking, one container per party | VRATA |
| Contrastive bi-encoder fine-tuning, hard-negative batching, learned Indic-to-Latin transliteration, collective inference over a candidate graph, out-of-fold validation, expected-F0.5 decoding | AnchorMatch |
| Append-only hash-chained event log, canonical JSON, secret scanning, wake budgets and loop breakers, pinned-key TLS through a relay, crash testing, threat model with numbered invariants, idle-wake hooks for Claude Code and Codex | Quorum |
| Historical identity resolution, evidence provenance, audit-time state reconstruction, category-specific deletion policy, ordered remediation, checksum-matched OCR cache, atomic output writes | GhostAudit |

### Honest-use notes

- **Coursework/personal-use confirmation:** OpenCV, OpenGL, Unity, Blender and GitLab were explicitly backed by the user's coursework or own use; do not infer new skills from that exception. PyTorch now has direct AnchorMatch code evidence, and Streamlit has direct TyreTrace implementation evidence as its legacy interface. Be ready to explain a concrete use of any listed skill.
- **Framer Motion:** previously found as a Portfolio dependency without a live-source import. It is excluded from the copy-ready master block pending confirmation of actual use. The Portfolio animation uses custom springs and scroll-driven camera work.
- **Bandit and Safety:** earlier resume review found they were not run by the claimed CI. They are excluded from the copy-ready block pending direct evidence of use; do not describe them as CI checks.
- **GhostAudit:** supports Python, unittest, pdfplumber and SQLite snapshot handling; it does not establish experience with an LLM framework, a vector database or live compliance operations.
- **Gaussian Splat Viewer:** later authorship findings show team renderer/deployment contributions; do not repeat the old single-author claim.
- **Astronaut Health Digital Twin:** use 2D dashboard with a 3D viewing area.
- **VRATA:** unpublished manuscript; submission/review status is unconfirmed.
- **Do not claim without new evidence or user confirmation:** AWS, GCP, Azure, Kubernetes, Express.js, NestJS, TensorFlow, Webflow, functional languages (Haskell, Scala).
- **Team authorship, word carefully:** MiniRAFT, VRATA, Healthcare and KiranaAI require co-built/contributed-to wording at system level. For Healthcare, the personal frontend and performance/concurrency work is documented above. TyreTrace now has a fresh entry and single-author Git/blame evidence for the inspected models/planner; the old blanket thin-authorship note is superseded for those files.
- **TyreTrace:** distinguish the 84-weekend lake, filtered 14-weekend comparison, expanded flag-only population and isolated Austin holdout. No operational calibration, latent-fuel truth or live-game validation claim.
- **KiranaAI:** synthetic-data generation/features and most XGBoost training are personally attributable; the larger ingestion/reminder/platform system is team work. Forecast evaluation uses synthetic data.
- **Express:** MiniRAFT documentation confirms it as a project dependency, but that does not establish the user personally wrote Express code. Keep it out of personal skills until contribution/use is checked.
- **Quorum is in progress and shared:** the MCP client, web timeline and fleet harness are the teammate's; the server, core, hooks, idle wake and relay are yours. Do not claim a release or users.
- **Team stages (AnchorMatch):** the cross-encoders, stage-3 stacker and France adaptation behind the final 0.9883 are a teammate's. Your stage (retrieval, matcher, decoder) is 0.9889 holdout / 0.9826 leaderboard.

### Standing rules for skills lists

1. Never omit PyTorch, Pandas or NumPy.
2. List MySQL on its own, with no parenthetical sub-skills.
3. Write CI/CD without naming a tool, and Docker on its own (it implies Compose).
4. Frontend skills must include what the Portfolio site is built with (see the Portfolio entry).
5. No descriptive phrases in skills rows. Tool names and standard terms only; anything phrase-like goes in the bullet of the project that used it.
6. Coursework subjects (Data Structures and Algorithms, Object-Oriented Programming, Operating Systems and the rest) belong only in the Education coursework line, never in a skills row.

### Education reference — all 12 courses

Reorder for each JD, putting the most relevant courses first. Never remove a course to tailor or shorten the resume, and never move coursework into the skills rows.

Data Structures and Algorithms, Object-Oriented Programming, Operating Systems, Computer Networks, Database Systems, Software Engineering, Compiler Design, Cloud Computing, Machine Learning, Image Processing, Digital Twins, Augmented and Virtual Reality.
