# 📅 CryptoTrace — Person-Wise & Day-Wise Implementation Plan

> **Smart India Hackathon 2026 — Problem Statement PS-182**  
> *Exam-Aware Build Plan | Target Prototype Presentation: 11 September 2026*

---

## 🎯 Executive Overview

This implementation plan breaks down the development of **CryptoTrace** into a person-wise (B1–B4 backend/QA, F1–F2 frontend/UI) and day-wise schedule. Designed around college hours (9 AM–5 PM) and exam dates (Sep 7 & Sep 9), this plan ensures a **100% reliable, demonstrable prototype** by **11 September 2026**.

---

## 👥 Team Roles & Responsibilities

| Role | Name / Focus | Primary Ownership | Concrete Outputs |
| :--- | :--- | :--- | :--- |
| **B1** | **Blockchain & Data Engine** | Etherscan API client, transaction normalization, GraphSense client, label fallback, local caching layer | `services/chain_adapter.py`, `services/normalizer.py`, `data/demo_cases.json`, caching layer |
| **B2** | **Graph & Attribution Engine** | NetworkX transaction graph construction, BFS traversal (≤3 hops), candidate VASP ranking, explainable confidence scoring | `services/graph_engine.py`, `services/attribution.py`, evidence/reasons generator |
| **B3** | **Backend & API Infrastructure** | Flask/FastAPI REST server, SQLite database, API routing, DEMO/LIVE mode switcher, frontend integration | `app.py`, `routes/`, database schemas, `/health`, `/api/trace`, `/api/cases`, `/api/report` |
| **B4** | **Integration, Ground Truth & QA** | Ground truth dataset validation, 3–5 prepared demo cases, unit/integration testing, GitHub workflow, release verification | 3–5 verified demo cases, test checklist, `docs/demo_addresses.md`, release gate verification |
| **F1** | **Frontend Lead** | React dashboard, D3.js interactive transaction graph, Result/Report screens, API integration | `Dashboard.jsx`, `Investigation.jsx`, `Report.jsx`, `TransactionGraph.jsx`, API integration |
| **F2** | **UI/UX & Presentation Lead** | Visual design system, PPT deck, architecture diagrams, UI polish, demo script, presenter notes, 3-minute timed demo | Polished UI styling, 8-slide PPT deck, screenshots, timed demo execution |

---

## 🗓️ Day-by-Day Implementation Schedule (Sep 4 – Sep 11)

### 📌 Day 1: September 4 (~3 Hours Available)
> **Goal**: Establish JSON contracts, build mock pipeline, and enable initial trace flow.

- **B1 (Blockchain/Data)**: Build Etherscan API client skeleton, transaction normalizer (`normalizer.py`), and baseline `demo_cases.json`.
- **B2 (Graph/Attribution)**: Build NetworkX graph builder (`graph_engine.py`) and BFS traversal algorithm capped at 3 hops.
- **B3 (Backend/API)**: Setup Flask/FastAPI application skeleton with `/health`, `/api/trace` (mock), and `/api/cases` endpoints.
- **B4 (QA/Integration)**: Select 3 core case types (Clean VASP Attribution, Risk/OFAC Flag, No Attribution); define ground truth.
- **F1 (Frontend)**: Build React dashboard screens (`Dashboard.jsx`, `Investigation.jsx`) rendered with mock JSON fixtures.
- **F2 (UI/PPT)**: Establish visual design tokens (colors, typography) and create the 8-slide PPT presentation deck skeleton.

🚩 **Day 1 Acceptance Gate**: One complete path from wallet input to attribution result using mock data.

---

### 📌 Day 2: September 5 (~3–4 Hours Available)
> **Goal**: End-to-end backend/frontend integration and scoring logic.

- **B1 (Blockchain/Data)**: Implement `Live → Fallback → Cache` data flow logic.
- **B2 (Graph/Attribution)**: Implement candidate VASP scoring engine (`attribution.py`) covering direct matches and 1/2/3-hop distances.
- **B3 (Backend/API)**: Connect Flask/FastAPI REST endpoints with real backend graph engine and frontend fetch calls.
- **B4 (QA/Integration)**: Run verification tests on the 3 ground-truth cases + test invalid wallet addresses and edge cases.
- **F1 (Frontend)**: Integrate real API calls into React state, replacing mock JSON with live backend responses.
- **F2 (UI/PPT)**: Design Attribution Card, Evidence Panel, Graph Legend, and Loading/Error state components.

🚩 **Day 2 Acceptance Gate**: At least one end-to-end test case works through the actual React frontend connected to the Python backend.

---

### 📌 Day 3: September 6 (~2 Hours Available)
> **Goal**: Error handling, edge case coverage, and stability.

- **B1 (Blockchain/Data)**: Implement API error handling, rate-limit retries, and network outage fallbacks.
- **B2 (Graph/Attribution)**: Write unit tests for attribution scoring, hop proximity weights, and path multiplicity.
- **B3 (Backend/API)**: Fix API endpoint bugs and freeze JSON response field definitions.
- **B4 (QA/Integration)**: Verify all 3–5 demo cases end-to-end against expected ground truth.
- **F1 (Frontend)**: Fix UI bugs, polish responsiveness, and refine graph hover/highlight interactions.
- **F2 (UI/PPT)**: Update PPT slide deck with architecture diagrams and tag `VERSION 0.1` release.

🚩 **Day 3 Acceptance Gate**: Error cases and invalid wallet inputs fail gracefully without crashing the app.

---

### 📌 Day 4: September 7 (~1–2 Hours Available — EXAM DAY 1)
> **Goal**: Stabilization and smoke testing only (NO NEW FEATURES).

- **B1, B2, B3**: Conduct smoke testing and system stabilization; fix critical blockers only.
- **B4**: Conduct release gate verification and update test checklists.
- **F1**: Code freeze on new features; fix high-priority visual/interaction bugs.
- **F2**: Clean up PPT presentation deck and align presenter notes.

🚩 **Day 4 Acceptance Gate**: Zero regressions; full system remains stable.

---

### 📌 Day 5: September 8 (~2 Hours Available)
> **Goal**: Offline DEMO MODE guarantee & documentation freeze.

- **B1 (Blockchain/Data)**: Ensure offline **DEMO MODE** functions 100% reliably with external network APIs completely disabled.
- **B2 (Graph/Attribution)**: Freeze attribution scoring formulas and weights.
- **B3 (Backend/API)**: Write `README.md`, setup scripts, and single-command launch scripts (`run.sh` / `run.bat`).
- **B4 (QA/Integration)**: Finalize `docs/demo_addresses.md` and execute full automated/manual test suite.
- **F1 (Frontend)**: Perform final D3.js graph visual polish (node colors, hop distance indicators, animated transaction paths).
- **F2 (UI/PPT)**: Finalize PPT presentation deck and write 3-minute timed demo script.

🚩 **Day 5 Acceptance Gate**: Demo operates flawlessly offline with network connections disabled.

---

### 📌 Day 6: September 9 (~1–2 Hours Available — EXAM DAY 2)
> **Goal**: Release candidate preparation & presentation practice.

- **B1, B3**: Package release candidate (`v1.0-demo`).
- **B2, F1**: Zero feature modifications; run end-to-end smoke tests.
- **B4**: Perform clean environment installation & test run.
- **F2**: Conduct first review pass of presentation deck with the full team.

🚩 **Day 6 Acceptance Gate**: Release candidate runs smoothly from a fresh environment checkout.

---

### 📌 Day 7: September 10 (~3–4 Hours Available — FEATURE FREEZE DAY)
> **Goal**: Final QA, feature freeze, and timed presentation rehearsals.

- **B1 (Blockchain/Data)**: Final reliability verification on cached demo dataset.
- **B2 (Graph/Attribution)**: Verify deterministic attribution results across all demo cases.
- **B3 (Backend/API)**: Complete full system integration pass and ensure zero backend warnings.
- **B4 (QA/Integration)**: Perform final QA check and supervise 3 consecutive timed demo runs.
- **F1 (Frontend)**: Final D3 visual polish, layout adjustments, and browser compatibility verification.
- **F2 (UI/PPT)**: Finalize PPT presentation deck, print/export presenter notes, and lead 3 timed demo rehearsals.

🔒 **FEATURE FREEZE POINT**: 10:00 PM on September 10. No new features permitted after this point.

🚩 **Day 7 Acceptance Gate**: 3 consecutive successful timed 3-minute demo runs with zero critical errors.

---

### 📌 Day 8: September 11 (PRESENTATION DAY)
> **Goal**: Deliver a winning SIH 2026 presentation!

- **All Roles**: Presentation delivery, live demo execution, and emergency show-stopper fixes only (if any).

---

## 🚦 Feature Priority & Cut Hierarchy

If development falls behind schedule, features must be cut strictly in this order:

| Priority | Feature Description | Action if Behind |
| :--- | :--- | :--- |
| **P0 (MUST HAVE)** | Wallet input, 2–3 hop graph, VASP attribution, Confidence + evidence, React UI, 3 demo cases, DEMO MODE | 🛑 **NEVER CUT** |
| **P1 (NICE TO HAVE)**| Live Etherscan mode, GraphSense enrichment, OFAC enrichment | ✂️ Cut if behind |
| **P2 (OPTIONAL)** | Case history list, Dedicated PDF report export | ✂️ First major cut |
| **P3 (FUTURE)** | Multi-chain support, ML/GNN attribution, Real SAHYOG integration | 🚫 **DO NOT BUILD** |

---

## 🎬 3-Minute Presentation Demo Script

| Time | Segment | Presenter Action & Script Focus |
| :--- | :--- | :--- |
| **0:00–0:20** | **Problem Statement** | Highlight the attribution gap: Raw blockchain transactions reveal wallet addresses, but fail to identify the controlling VASP/service. |
| **0:20–0:40** | **Wallet Input** | Enter a prepared Ethereum wallet address into CryptoTrace and click **Trace Wallet**. |
| **0:40–1:15** | **Transaction Graph** | Showcase the interactive D3 transaction graph, displaying 2–3 hop fund flows and node relationships. |
| **1:15–1:35** | **VASP Attribution** | Reveal nearest VASP candidate (e.g. Binance), confidence score (e.g. 87%), hop distance, and supporting evidence trail. |
| **1:35–1:55** | **Risk / OFAC Case** | Switch to Case 2 demonstrating high-risk / OFAC sanctioned address detection along a transaction path. |
| **1:55–2:15** | **Investigation Report** | Open exportable investigation report detailing Case ID, target wallet, VASP details, confidence, and risk flags. |
| **2:15–2:40** | **System Architecture** | Explain the dual **DEMO / LIVE Mode** architecture ensuring zero external API dependency during judging. |
| **2:40–3:00** | **Future Roadmap** | Outline scalability: Adding Bitcoin/multi-chain adapters, commercial intelligence feeds, and GNN attribution. |

---

## 🛡️ Judge Q&A Cheat Sheet

| Question | Recommended Answer |
| :--- | :--- |
| **Are you replacing Chainalysis?** | No. CryptoTrace is an explainable investigation prototype demonstrating nearest-VASP attribution using open intelligence and graph proximity heuristics. |
| **How accurate is the system?** | Accuracy is bounded by available label coverage. For the prototype, our demonstration cases are manually verified ground-truth targets. |
| **Why not use Machine Learning / GNNs?** | Deterministic graph heuristics are fully explainable, audit-ready, and easier to validate on sparse labelled wallet datasets than black-box ML models. |
| **What if live APIs fail during judging?** | CryptoTrace features a guaranteed **DEMO MODE** powered by cached verified data using the exact same downstream graph and attribution engine. |
| **Can you identify the individual controlling the wallet?** | No. CryptoTrace focuses strictly on service/VASP-level attribution and does not attempt personal de-anonymization. |
