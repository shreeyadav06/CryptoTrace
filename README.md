# CryptoTrace

### Automated Attribution of Unknown Cryptocurrency Wallets to Nearest Virtual Asset Service Providers (VASPs)

> **Smart India Hackathon 2026 --- Problem Statement PS-182**

CryptoTrace is a blockchain intelligence prototype designed to help
investigators analyze an unknown cryptocurrency wallet and identify the
**nearest likely Virtual Asset Service Provider (VASP)** using
transaction-graph analysis, publicly available blockchain intelligence,
wallet labels, risk lists, and explainable graph-based scoring.

The system takes an unknown Ethereum wallet address, traces its
surrounding transaction network, identifies known or labelled VASP
candidates, ranks those candidates using graph proximity and supporting
evidence, and presents the investigation through an interactive
dashboard.

CryptoTrace is designed as an **explainable investigation-assistance
prototype**. It does not attempt to identify the real-world individual
behind a wallet and does not claim legal or forensic certainty.

------------------------------------------------------------------------

# 📌 Table of Contents

-   [1. Problem Statement](#1-problem-statement)
-   [2. Why CryptoTrace](#2-why-cryptotrace)
-   [3. Objective](#3-objective)
-   [4. Core Workflow](#4-core-workflow)
-   [5. Key Features](#5-key-features)
-   [6. System Architecture](#6-system-architecture)
-   [7. Detailed Architecture
    Components](#7-detailed-architecture-components)
-   [8. End-to-End Data Flow](#8-end-to-end-data-flow)
-   [9. Attribution Methodology](#9-attribution-methodology)
-   [10. Confidence Scoring](#10-confidence-scoring)
-   [11. Evidence Trail](#11-evidence-trail)
-   [12. Risk and OFAC Flagging](#12-risk-and-ofac-flagging)
-   [13. DEMO Mode vs LIVE Mode](#13-demo-mode-vs-live-mode)
-   [14. Technology Stack](#14-technology-stack)
-   [15. Project Structure](#15-project-structure)
-   [16. API Design](#16-api-design)
-   [17. Data Model](#17-data-model)
-   [18. Frontend](#18-frontend)
-   [19. Graph Visualization](#19-graph-visualization)
-   [20. Data Sources](#20-data-sources)
-   [21. Demo Dataset](#21-demo-dataset)
-   [22. Testing Strategy](#22-testing-strategy)
-   [23. Evaluation Metrics](#23-evaluation-metrics)
-   [24. Prototype Scope](#24-prototype-scope)
-   [25. Limitations](#25-limitations)
-   [26. Security and Configuration](#26-security-and-configuration)
-   [27. Installation](#27-installation)
-   [28. Running CryptoTrace](#28-running-cryptotrace)
-   [29. Recommended SIH Demo](#29-recommended-sih-demo)
-   [30. Demo Script](#30-demo-script)
-   [31. Team Responsibilities](#31-team-responsibilities)
-   [32. Development Strategy](#32-development-strategy)
-   [33. Risk and Fallback Plan](#33-risk-and-fallback-plan)
-   [34. Future Roadmap](#34-future-roadmap)
-   [35. Responsible Use](#35-responsible-use)
-   [36. Judge Q&A](#36-judge-qa)
-   [37. Definition of Done](#37-definition-of-done)
-   [38. Disclaimer](#38-disclaimer)

------------------------------------------------------------------------

# 1. Problem Statement

Cryptocurrency transactions are publicly recorded on blockchains, but a
raw wallet address does not necessarily reveal the service or
organization associated with it.

For an investigator, the challenge is therefore not simply:

> "Can we see the transaction?"

but rather:

> "Can we determine which known VASP or cryptocurrency service is most
> closely connected to this unknown wallet, and can we explain why?"

A useful investigation system should be able to:

-   Accept an unknown wallet address.
-   Retrieve or load its transaction history.
-   Build a transaction relationship graph.
-   Traverse connected addresses.
-   Identify known or labelled entities.
-   Find VASP candidates.
-   Rank candidates using explainable evidence.
-   Show confidence rather than an unsupported binary answer.
-   Flag known-risk or sanctioned addresses where applicable.
-   Present the entire reasoning path to the investigator.

CryptoTrace demonstrates this workflow through a lightweight
graph-intelligence architecture.

------------------------------------------------------------------------

# 2. Why CryptoTrace

Commercial blockchain intelligence platforms can provide sophisticated
attribution and investigation capabilities, but they may be expensive,
proprietary, and unsuitable for a student-built prototype.

CryptoTrace focuses on a narrower and explainable problem:

``` text
UNKNOWN WALLET
      |
      v
TRANSACTION NEIGHBORHOOD
      |
      v
KNOWN / LABELLED ADDRESSES
      |
      v
VASP CANDIDATES
      |
      v
GRAPH-BASED RANKING
      |
      v
CONFIDENCE + EVIDENCE
      |
      v
INVESTIGATION REPORT
```

The prototype prioritizes:

-   Explainability
-   Deterministic behavior
-   Small-hop graph analysis
-   Public/open intelligence
-   Reliable demonstration
-   Modular architecture

------------------------------------------------------------------------

# 3. Objective

Given an unknown cryptocurrency wallet, CryptoTrace attempts to
determine the **nearest likely VASP** within a limited transaction
neighborhood.

The intended output is:

``` text
Input Wallet
     |
     +--> Blockchain
     |
     +--> Transaction Graph
     |
     +--> Hop Distance
     |
     +--> Candidate VASPs
     |
     +--> Selected VASP
     |
     +--> Confidence Score
     |
     +--> Evidence Trail
     |
     +--> Risk Flags
     |
     +--> Investigation Report
```

The prototype performs **service/VASP-level attribution**, not personal
de-anonymization.

------------------------------------------------------------------------

# 4. Core Workflow

``` text
┌──────────────────────┐
│ Investigator         │
│ enters wallet        │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Wallet Validation    │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Ethereum Data Source │
│ Live API / Cache     │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Transaction           │
│ Normalization         │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Graph Builder        │
│ NetworkX             │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ BFS Traversal        │
│ Maximum 3 Hops       │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Address Tagging      │
│ VASP / Risk / Unknown│
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Attribution Engine   │
│ Candidate Ranking    │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Confidence + Evidence│
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ React Dashboard      │
│ Graph + Results      │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Investigation Report │
└──────────────────────┘
```

------------------------------------------------------------------------

# 5. Key Features — Targeted for the 11 September 2026 Prototype

The following are the features that are **planned to be completed and demonstrated by 11 September 2026**.

## 5.1 Ethereum Wallet Investigation

The investigator enters an Ethereum wallet address and starts an investigation.

```text
Chain: Ethereum

Wallet:
0x............................................

Trace Depth:
3 hops

Mode:
Demo / Live

[ Trace Wallet ]
```

---

## 5.2 Transaction Retrieval and Normalization

The prototype will support:

- Ethereum transaction retrieval.
- Etherscan integration where available.
- Prepared/cached transaction data for reliable demonstration.
- Normalization into a common internal transaction format.
- Basic API error and rate-limit handling.

Example normalized transaction:

```json
{
  "hash": "0xtransactionhash",
  "from": "0xsender",
  "to": "0xreceiver",
  "value": 1.25,
  "timestamp": "2026-09-01T10:30:00",
  "block": 12345678
}
```

---

## 5.3 2–3 Hop Transaction Graph

CryptoTrace will construct a transaction graph around the target wallet using NetworkX.

The prototype target is a **maximum 3-hop traversal**.

```text
Hop 0
Unknown Wallet
      |
      v
Hop 1
Connected Wallet
      |
      v
Hop 2
Connected Wallet
      |
      v
Hop 3
Known / Labelled Entity
```

---

## 5.4 VASP Attribution

The prototype will identify labelled VASP candidates within the transaction graph and rank them using deterministic graph-based heuristics.

The result will contain:

- Selected VASP
- Hop distance
- Confidence score
- Supporting evidence
- Relevant transaction path

---

## 5.5 Explainable Confidence Score

By 11 September, the attribution result is planned to include an explainable confidence score based on signals such as:

- Hop distance
- Independent transaction paths
- Transaction value/volume
- Recency
- Label reliability

Example:

```text
VASP: Example Exchange

Confidence: 87%
Hop Distance: 2

Reasons:
✓ Known VASP label
✓ Multiple supporting paths
✓ Recent transaction activity
```

The score is an explainable heuristic score, not a guaranteed statistical probability.

---

## 5.6 Evidence Trail

Every successful attribution should show why the candidate was selected.

Example:

```text
Evidence

1. Target wallet interacted with Address B.
2. Address B connected to Address C.
3. Address C has a VASP label.
4. Candidate VASP is 2 hops from the target.
5. Multiple transaction paths support the relationship.
```

---

## 5.7 Risk / OFAC Flagging

The prototype is planned to demonstrate at least one risk/sanctions case using the available configured data.

Example:

```text
Risk Level: HIGH

⚠ Known sanctioned / risk-associated address detected
```

The exact coverage depends on the available dataset and configured source.

---

## 5.8 Interactive D3 Transaction Graph

The final prototype will include an interactive graph showing:

- Unknown wallet
- Connected addresses
- Hop levels
- Transaction relationships
- VASP candidate
- Selected attribution path
- Risk indicators where applicable

The main visual story will be:

```text
Unknown Wallet
      ↓
    Hop 1
      ↓
    Hop 2
      ↓
    VASP
```

---

## 5.9 Investigation Result Dashboard

The final UI is planned around three primary views:

### Investigation Screen

Wallet input, Ethereum selection, trace depth and Demo/Live mode.

### Trace Screen

Interactive graph and transaction path.

### Result / Report Screen

```text
VASP Attribution
Confidence
Hop Distance
Evidence
Risk Flags
Case Information
```

---

## 5.10 Investigation Report

By the prototype presentation, the team will provide an investigation-style report containing:

- Case ID
- Input wallet
- Blockchain
- Investigation timestamp
- Selected VASP
- Confidence
- Hop distance
- Transaction path
- Evidence
- Risk flags
- Data sources

A dedicated PDF generator is **optional**. If PDF generation becomes unstable, the in-app report and browser print/export will be used for the demonstration.

---

## 5.11 DEMO Mode

DEMO MODE is a required reliability feature for the presentation.

It will use **3–5 prepared, manually verified cases** and cached transaction data.

Minimum demonstration set:

1. Successful VASP attribution.
2. Risk / OFAC case.
3. No-confident-attribution case.

The same graph and attribution engine will process these cases.

---

## 5.12 LIVE Mode

The team plans to support an optional LIVE MODE using available Ethereum blockchain intelligence APIs.

LIVE MODE is an enhancement to the prototype, but it must **not become a dependency for the SIH presentation**.

If an external API fails:

```text
LIVE API
   ↓
Failure / Rate Limit
   ↓
DEMO / Cached Case
   ↓
Same Graph Engine
   ↓
Same Attribution Engine
```

---

## 5.13 Graceful "No Confident Attribution"

The prototype must not force an attribution when evidence is insufficient.

Expected behavior:

```text
No Confident Attribution

Reason:
No sufficiently reliable labelled VASP
was found within the configured graph depth.
```

---

# 6. System Architecture


``` text
                                      ┌──────────────────────────┐
                                      │ Investigator / User      │
                                      └────────────┬─────────────┘
                                                   │
                                                   v
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND — REACT.JS                                 │
│                                                                             │
│  Wallet Input  →  Investigation Dashboard  →  D3 Transaction Graph         │
│                                      │                                      │
│                                      v                                      │
│                    Attribution / Evidence / Risk / Report                  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ REST API
                                    v
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BACKEND — PYTHON / FLASK / FASTAPI                      │
│                                                                             │
│ ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────────────┐ │
│ │ REST API Layer   │   │ Demo/Live Router │   │ Validation              │ │
│ │ /trace           │   │                  │   │ Error Handling           │ │
│ │ /cases           │   │ DEMO             │   │ Rate-limit Handling      │ │
│ │ /report          │   │ LIVE             │   │                         │ │
│ │ /health          │   │                  │   │                         │ │
│ └────────┬─────────┘   └────────┬─────────┘   └─────────────────────────┘ │
│          │                      │                                           │
│          └──────────────────────┼───────────────────────────────────────────┘
│                                 v
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           CORE SERVICES                                  │ │
│ │                                                                         │ │
│ │  Chain Adapter → Normalizer → Graph Builder → Tagging Engine            │ │
│ │                                      │               │                   │ │
│ │                                      v               v                   │ │
│ │                                  BFS ≤3 Hops     Labels / Risk           │ │
│ │                                      │               │                   │ │
│ │                                      └───────┬───────┘                   │ │
│ │                                              v                           │ │
│ │                                   Attribution Engine                     │ │
│ │                                              │                           │ │
│ │                          ┌───────────────────┼─────────────────┐         │ │
│ │                          v                   v                 v         │ │
│ │                     VASP Result        Confidence         Evidence      │ │
│ │                                              │                           │ │
│ │                                              v                           │ │
│ │                                      Report Generator                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              v                     v                      v
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────────┐
│ Etherscan API      │   │ GraphSense /       │   │ OFAC / Local Labels    │
│ Transactions       │   │ Open Intelligence  │   │ Risk / VASP Labels     │
└────────────────────┘   └────────────────────┘   └────────────────────────┘
              │                     │                      │
              └─────────────────────┼──────────────────────┘
                                    v
                         ┌─────────────────────┐
                         │ SQLite / Cache      │
                         │ Cases               │
                         │ Transactions        │
                         │ Labels              │
                         │ Graph Data          │
                         │ Reports             │
                         └─────────────────────┘
```

------------------------------------------------------------------------

# 7. Detailed Architecture Components

## 7.1 Frontend Layer

Technology:

-   React.js
-   D3.js
-   Axios/fetch
-   CSS/Tailwind or equivalent

Responsibilities:

-   Wallet input
-   Address validation
-   Chain selection
-   Trace request
-   Loading/error states
-   Graph rendering
-   Attribution result
-   Confidence display
-   Evidence display
-   Risk indicators
-   Report view

------------------------------------------------------------------------

## 7.2 REST API Layer

The API layer separates the frontend from blockchain and
graph-processing logic.

Example endpoints:

``` text
GET  /health
GET  /api/cases
POST /api/trace
GET  /api/report/{case_id}
```

------------------------------------------------------------------------

## 7.3 Chain Adapter

The chain adapter isolates external blockchain APIs.

Responsibilities:

-   Fetch transactions
-   Handle pagination
-   Normalize API responses
-   Retry transient failures
-   Detect rate limits
-   Switch to cached data when appropriate

The graph engine should never directly depend on the Etherscan response
format.

------------------------------------------------------------------------

## 7.4 Graph Builder

The graph builder uses NetworkX.

Responsibilities:

-   Create nodes
-   Create edges
-   Track transaction metadata
-   Calculate hop distance
-   Perform BFS
-   Extract relevant paths
-   Limit traversal depth

------------------------------------------------------------------------

## 7.5 Tagging Engine

The tagging engine assigns available intelligence to discovered
addresses.

Possible labels:

``` text
VASP
Exchange
Known Service
OFAC / Sanctioned
Risk Address
Unknown
```

Labels can come from:

-   GraphSense/open datasets
-   Etherscan/local labels
-   Prepared demo labels
-   OFAC data

------------------------------------------------------------------------

## 7.6 Attribution Engine

The attribution engine receives:

``` text
Graph
+
Labels
+
Transaction metadata
+
Risk information
```

and returns:

``` text
Selected VASP
+
Confidence
+
Hop distance
+
Evidence
+
Risk flags
```

------------------------------------------------------------------------

## 7.7 Report Generator

The report generator converts investigation results into a structured
report.

Minimum output:

``` text
Case Summary
Transaction Trace
VASP Attribution
Confidence
Evidence
Risk Flags
Sources
```

------------------------------------------------------------------------

# 8. End-to-End Data Flow

## Step 1 --- Investigator Input

``` text
Wallet Address
       +
Blockchain
       +
Max Hops
       +
Mode
```

------------------------------------------------------------------------

## Step 2 --- Validation

Check:

-   Address format
-   Supported chain
-   Required parameters
-   Hop limit

Invalid input should return a controlled error.

------------------------------------------------------------------------

## Step 3 --- Data Acquisition

``` text
              ┌─────────────┐
              │ DEMO MODE   │
              └──────┬──────┘
                     │
                     v
               Cached Data

OR

              ┌─────────────┐
              │ LIVE MODE   │
              └──────┬──────┘
                     │
                     v
          Etherscan / GraphSense
```

------------------------------------------------------------------------

## Step 4 --- Normalization

Convert external transaction responses to internal objects.

------------------------------------------------------------------------

## Step 5 --- Graph Construction

``` text
Transaction:
A → B

becomes:

A ─────────► B
```

Multiple transactions create a network.

------------------------------------------------------------------------

## Step 6 --- BFS

Start from the target wallet.

``` text
distance(target) = 0

distance(neighbor) = 1

distance(next neighbor) = 2

distance(next neighbor) = 3
```

Stop at:

``` text
MAX_HOPS = 3
```

------------------------------------------------------------------------

## Step 7 --- Entity Tagging

Each discovered address is checked for known labels.

------------------------------------------------------------------------

## Step 8 --- Candidate Generation

All relevant VASP-labelled addresses become candidates.

------------------------------------------------------------------------

## Step 9 --- Candidate Scoring

The engine evaluates:

``` text
Hop Distance
Independent Paths
Transaction Value
Transaction Volume
Recency
Label Reliability
```

------------------------------------------------------------------------

## Step 10 --- Result

Example:

``` json
{
  "selected_vasp": "Example Exchange",
  "confidence": 87,
  "hop_distance": 2
}
```

------------------------------------------------------------------------

## Step 11 --- Evidence

Example:

``` json
{
  "evidence": [
    "Known VASP label found",
    "Candidate is 2 hops from target",
    "Three independent transaction paths",
    "Recent transaction activity"
  ]
}
```

------------------------------------------------------------------------

## Step 12 --- Frontend

The result is visualized as:

``` text
Graph
+
Attribution
+
Confidence
+
Evidence
+
Risk
+
Report
```

------------------------------------------------------------------------

# 9. Attribution Methodology

CryptoTrace uses deterministic graph-based heuristics rather than an
ML/GNN model for the prototype.

This choice is intentional because:

-   Labelled wallet datasets may be sparse.
-   Deterministic scoring is easier to validate.
-   Judges can understand the reasoning.
-   Results can be reproduced.
-   No model-training pipeline is required.
-   The prototype can be completed reliably within the available
    development window.

## Rule 1 --- Direct Match

If the target wallet itself has a trusted VASP label:

``` text
Target Wallet
     ↓
Known VASP
```

return the direct attribution with strong confidence.

------------------------------------------------------------------------

## Rule 2 --- BFS Search

If the target wallet is unknown, traverse outward.

``` text
Target
  |
  +-- Hop 1
        |
        +-- Hop 2
              |
              +-- Hop 3
```

------------------------------------------------------------------------

## Rule 3 --- Candidate Collection

Collect VASP-labelled addresses discovered within the traversal limit.

------------------------------------------------------------------------

## Rule 4 --- Shortest Path Preference

A VASP at a smaller graph distance is generally preferred.

``` text
1 hop > 2 hops > 3 hops
```

------------------------------------------------------------------------

## Rule 5 --- Independent Path Support

If multiple independent transaction paths connect the unknown wallet to
a candidate VASP, that candidate receives additional support.

------------------------------------------------------------------------

## Rule 6 --- Transaction Strength

Transaction value and volume can be used as supporting signals.

------------------------------------------------------------------------

## Rule 7 --- Recency

More recent activity can provide additional evidence.

------------------------------------------------------------------------

## Rule 8 --- Label Reliability

Labels with stronger provenance should carry more weight than weak or
uncertain labels.

------------------------------------------------------------------------

## Rule 9 --- No Forced Attribution

If evidence is insufficient:

``` text
NO CONFIDENT ATTRIBUTION
```

The system should not fabricate a VASP result.

------------------------------------------------------------------------

# 10. Confidence Scoring

The exact score implementation may be tuned during development, but the
conceptual model is:

``` text
Confidence =
    Graph Proximity
  + Path Support
  + Transaction Strength
  + Recency
  + Label Reliability
```

A conceptual weighting could be:

``` text
Factor                  Contribution
-------------------------------------
Hop proximity           High
Independent paths       High
Label reliability       High
Transaction activity    Medium
Recency                 Medium
```

The important requirement is **explainability**.

The UI should show both:

``` text
Confidence: 87%
```

and:

``` text
Why?

• VASP label verified
• Candidate found at 2 hops
• 3 independent paths
• Recent interaction
```

The prototype should not present the score as a mathematically proven
probability.

------------------------------------------------------------------------

# 11. Evidence Trail

Every attribution should produce an evidence trail.

Example:

``` text
Attribution Evidence

1. Target wallet interacted with Address B.
2. Address B connected to Address C.
3. Address C is labelled as a VASP wallet.
4. The VASP candidate is 2 hops from the target.
5. Multiple transaction paths support the relationship.
6. Recent transaction activity strengthens the signal.
```

This makes the system suitable for demonstration as an **explainable
intelligence tool** rather than a black-box classifier.

------------------------------------------------------------------------

# 12. Risk and OFAC Flagging

The prototype can include a known-risk/sanctions lookup layer.

Example:

``` text
Unknown Wallet
      |
      v
Connected Address
      |
      v
Known Risk / Sanctioned Address
      |
      v
Risk Flag
```

The UI can show:

``` text
Risk Level: HIGH

⚠ Known sanctioned address detected
```

The result should include the data source and should not imply that the
wallet owner is necessarily a sanctioned individual.

------------------------------------------------------------------------

# 13. DEMO Mode vs LIVE Mode

## DEMO MODE

``` text
Prepared Wallet
      ↓
Cached / Verified Transactions
      ↓
Transaction Normalizer
      ↓
Graph Builder
      ↓
Attribution Engine
      ↓
Frontend
```

Advantages:

-   Deterministic
-   Fast
-   Reliable
-   Works without external API availability
-   Suitable for judging

------------------------------------------------------------------------

## LIVE MODE

``` text
Wallet
  ↓
Etherscan / GraphSense
  ↓
Transaction Data
  ↓
Normalizer
  ↓
Graph Builder
  ↓
Attribution Engine
  ↓
Frontend
```

Advantages:

-   Demonstrates real API integration
-   Can investigate supported live addresses
-   Provides the foundation for future expansion

------------------------------------------------------------------------

## Critical Design Principle

Both modes must use the **same downstream graph and attribution
engine**.

``` text
               ┌── DEMO DATA ──┐
               │               │
Input ─────────┤               ├──► SAME GRAPH ENGINE
               │               │
               └── LIVE API ───┘
                                      │
                                      v
                              SAME ATTRIBUTION
                                      │
                                      v
                                  SAME UI
```

This prevents the demo implementation from becoming a completely
separate fake workflow.

------------------------------------------------------------------------

# 14. Technology Stack

  Layer             Technology
  ----------------- -------------------------------------
  Frontend          React.js
  Visualization     D3.js
  Backend           Python
  API               Flask / FastAPI
  Graph Analysis    NetworkX
  Database          SQLite
  Blockchain API    Etherscan
  Intelligence      GraphSense / open labels
  Risk Data         OFAC
  Data Exchange     JSON
  Version Control   Git + GitHub
  Report            HTML / browser print / optional PDF
  Deployment        Local prototype / optional cloud

------------------------------------------------------------------------

# 15. Project Structure

``` text
CryptoTrace/
│
├── backend/
│   ├── app.py
│   │
│   ├── routes/
│   │   ├── trace.py
│   │   ├── cases.py
│   │   ├── report.py
│   │   └── health.py
│   │
│   ├── services/
│   │   ├── chain_adapter.py
│   │   ├── normalizer.py
│   │   ├── graph_engine.py
│   │   ├── attribution.py
│   │   ├── labels.py
│   │   ├── risk.py
│   │   └── report_generator.py
│   │
│   ├── data/
│   │   ├── demo_cases.json
│   │   ├── labels.json
│   │   └── ofac.json
│   │
│   └── database/
│       └── cryptotrace.db
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Investigation.jsx
│   │   │   └── Report.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── WalletInput.jsx
│   │   │   ├── AttributionCard.jsx
│   │   │   ├── EvidencePanel.jsx
│   │   │   ├── RiskPanel.jsx
│   │   │   └── LoadingState.jsx
│   │   │
│   │   └── graph/
│   │       └── TransactionGraph.jsx
│   │
│   └── package.json
│
├── tests/
│   ├── test_graph.py
│   ├── test_attribution.py
│   ├── test_api.py
│   └── test_cases.py
│
├── docs/
│   ├── architecture.md
│   └── demo_addresses.md
│
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
└── LICENSE
```

------------------------------------------------------------------------

# 16. API Design

## GET /health

Checks backend availability.

``` http
GET /health
```

Response:

``` json
{
  "status": "ok"
}
```

------------------------------------------------------------------------

## GET /api/cases

Returns available prepared demonstration cases.

``` http
GET /api/cases
```

Example:

``` json
{
  "cases": [
    {
      "case_id": "CASE-001",
      "description": "VASP attribution"
    },
    {
      "case_id": "CASE-002",
      "description": "Risk/OFAC case"
    }
  ]
}
```

------------------------------------------------------------------------

## POST /api/trace

Main investigation endpoint.

``` http
POST /api/trace
```

Request:

``` json
{
  "chain": "ethereum",
  "address": "0x...",
  "max_hops": 3,
  "mode": "demo"
}
```

Response:

``` json
{
  "case_id": "CASE-001",
  "chain": "ethereum",
  "input_address": "0x...",
  "selected_vasp": "Example Exchange",
  "confidence": 87,
  "hop_distance": 2,
  "path": [
    "0xTarget",
    "0xHop1",
    "0xVASP"
  ],
  "evidence": [
    "Known VASP label",
    "2-hop relationship",
    "Multiple supporting paths"
  ],
  "risk_flags": [],
  "nodes": [],
  "edges": []
}
```

------------------------------------------------------------------------

## GET /api/report/{case_id}

Returns the structured investigation report.

``` http
GET /api/report/CASE-001
```

------------------------------------------------------------------------

# 17. Data Model

SQLite can store the investigation state.

## Cases

``` text
cases
-----
case_id
wallet
chain
timestamp
mode
selected_vasp
confidence
hop_distance
risk_level
```

## Transactions

``` text
transactions
------------
tx_hash
from_address
to_address
value
timestamp
block_number
```

## Address Tags

``` text
address_tags
------------
address
label
entity_type
source
confidence
risk_status
```

## Graph Data

``` text
graph_nodes
-----------
case_id
address
hop
label
risk_status
```

``` text
graph_edges
-----------
case_id
source
target
tx_hash
value
timestamp
```

## Reports

``` text
reports
-------
report_id
case_id
created_at
file_path
```

------------------------------------------------------------------------

# 18. Frontend

The frontend should have three primary views.

## View 1 --- Investigation

``` text
CryptoTrace

Wallet Address
[ 0x................................ ]

Blockchain
[ Ethereum ▼ ]

Trace Depth
[ 3 hops ]

Mode
[ Demo ▼ ]

[ TRACE WALLET ]
```

------------------------------------------------------------------------

## View 2 --- Trace / Graph

Display:

-   Unknown wallet
-   Connected wallets
-   Hop levels
-   Transaction relationships
-   Known VASP
-   Risk addresses

The graph should visually communicate the path from the unknown wallet
to the selected VASP.

------------------------------------------------------------------------

## View 3 --- Result / Report

Display:

``` text
VASP Attribution
-------------------------
VASP: Example Exchange

Confidence
87%

Hop Distance
2

Risk
LOW

Evidence
✓ VASP label
✓ Multiple paths
✓ Recent interaction
```

------------------------------------------------------------------------

# 19. Graph Visualization

D3.js is used to provide an interactive transaction graph.

The graph should support:

-   Node rendering
-   Edge rendering
-   Labels
-   Hop indicators
-   Hover information
-   Selected path highlighting
-   VASP highlighting
-   Risk highlighting
-   Basic zoom/pan
-   Loading animation

Conceptual graph:

``` text
                  ┌─────────────┐
                  │   Hop 1     │
                  └──────┬──────┘
                         │
                         v
┌──────────────┐   ┌─────────────┐
│ Unknown      │ → │   Hop 2     │
│ Wallet       │   └──────┬──────┘
└──────────────┘          │
                          v
                   ┌─────────────┐
                   │ VASP Wallet │
                   └─────────────┘
```

The graph is one of the most important visual deliverables of the
prototype.

------------------------------------------------------------------------

# 20. Data Sources

## Primary Prototype Sources

### Etherscan

Used for Ethereum transaction information when LIVE MODE is enabled.

### GraphSense / Open Intelligence

Used where available for address/entity labels and blockchain
intelligence.

### Local Label Dataset

A prepared JSON/CSV dataset can act as a reliable fallback for known
VASP labels.

### OFAC

Used for sanctions/risk flagging where supported by the configured
dataset.

------------------------------------------------------------------------

# 21. Demo Dataset

The prototype should contain **3--5 manually verified cases**.

Minimum recommended cases:

## Case 1 --- Successful VASP Attribution

``` text
Unknown Wallet
      ↓
Hop 1
      ↓
Hop 2
      ↓
Known VASP
```

Expected:

-   Correct VASP
-   Confidence generated
-   Evidence displayed
-   Graph rendered

------------------------------------------------------------------------

## Case 2 --- Risk / OFAC Case

Expected:

``` text
Risk flag
+
Evidence
+
Transaction graph
```

------------------------------------------------------------------------

## Case 3 --- No Confident Attribution

Expected:

``` text
No Confident Attribution
```

This proves that CryptoTrace does not force an answer when evidence is
insufficient.

------------------------------------------------------------------------

# 22. Testing Strategy

## Unit Tests

Test:

-   Address validation
-   Transaction normalization
-   Graph construction
-   BFS hop calculation
-   Candidate generation
-   Attribution scoring
-   Confidence calculation

------------------------------------------------------------------------

## Integration Tests

Test:

``` text
Frontend
   ↓
API
   ↓
Graph Engine
   ↓
Attribution Engine
   ↓
Response
   ↓
Frontend
```

------------------------------------------------------------------------

## Failure Tests

Test:

-   Invalid wallet
-   Empty address
-   API timeout
-   API rate limit
-   Missing labels
-   No VASP candidate
-   Empty graph
-   Malformed transaction data

The application must fail gracefully.

------------------------------------------------------------------------

# 23. Evaluation Metrics

The prototype can be evaluated using:

### Top-1 Accuracy

Percentage of cases where the correct VASP is ranked first.

### Top-3 Accuracy

Percentage where the correct VASP appears within the top three
candidates.

### Precision / Recall

Useful if a larger verified evaluation set is created.

### Average Hop Distance

Measures how far the attributed VASP is from the target wallet.

### Label Coverage

Percentage of relevant addresses for which usable labels are available.

### Response Time

Target for prepared 3-hop cases:

``` text
Approximately 5–10 seconds
```

### Demo Reliability

The most important SIH prototype metric:

``` text
3 / 3 prepared cases successfully demonstrated
```

------------------------------------------------------------------------

# 24. What Will Be Delivered by 11 September 2026

The **actual SIH prototype deliverable** is the following end-to-end working system:

```text
┌──────────────────────────────┐
│ 1. Wallet Input              │
│ Ethereum address validation  │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 2. Data Acquisition          │
│ Demo cache / optional API    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 3. Transaction Normalization │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 4. Graph Builder             │
│ NetworkX — maximum 3 hops    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 5. Address Tagging           │
│ VASP / Risk / Unknown        │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 6. Attribution Engine        │
│ Candidate ranking            │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 7. Confidence + Evidence     │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 8. Interactive D3 Graph      │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 9. Risk / OFAC Indicator     │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ 10. Investigation Report     │
└──────────────────────────────┘
```

### Mandatory presentation deliverables

By the presentation, the team should be able to show:

- **Working CryptoTrace dashboard**
- **Ethereum wallet input**
- **2–3 hop transaction graph**
- **Nearest likely VASP attribution**
- **Confidence score**
- **Explainable evidence/reasons**
- **Hop distance**
- **Risk/OFAC demonstration**
- **No-confident-attribution case**
- **Investigation report**
- **3–5 prepared demo cases**
- **DEMO MODE that works without external APIs**
- **Optional LIVE MODE when APIs are available**
- **Architecture and scalability roadmap**
- **Final GitHub repository with setup documentation**

### Reliability requirement

The final build should be fully integrated and rehearsed by **10 September night**.

**11 September is reserved for:**

- Presentation
- Demo execution
- Show-stopper fixes only
- Final verification

No new major features should be introduced on presentation day.

---

# 24. Prototype Scope — September 11 Release

## Included in the SIH Prototype

- Ethereum-first implementation
- Wallet input and validation
- Transaction retrieval / prepared transaction data
- Transaction normalization
- NetworkX graph construction
- BFS traversal up to 3 hops
- VASP label matching
- Nearest-VASP candidate ranking
- Explainable confidence score
- Evidence trail
- Risk / OFAC demonstration where supported
- Interactive D3 transaction graph
- Investigation dashboard
- Investigation result/report screen
- 3–5 prepared demo cases
- DEMO MODE with cached data
- Optional LIVE MODE
- API error handling and fallback
- SQLite/local persistence where required
- GitHub repository and setup documentation

## Optional If Stable Before Feature Freeze

These may be included only if the P0 prototype is already stable:

- Additional live API enrichment
- GraphSense enrichment
- Dedicated PDF generation
- Extra UI polish
- Case history

## Explicitly Not Part of the September 11 Build

- Full multi-chain implementation
- ML/GNN attribution
- Advanced mixer detection
- Complete DeFi behavioral analysis
- Production-scale real-time monitoring
- Real SAHYOG integration
- Commercial intelligence platform parity
- Identification of real-world individuals
- Court-admissible forensic conclusions

# 25. Limitations

The current prototype intentionally does not attempt:

-   Full multi-chain implementation
-   Production-scale monitoring
-   ML/GNN attribution
-   Advanced mixer analysis
-   Complete DeFi behavioral analysis
-   Real SAHYOG integration
-   Commercial intelligence platform parity
-   Identification of real-world individuals
-   Court-admissible forensic conclusions

These are future extensions rather than requirements for the prototype.

------------------------------------------------------------------------

# 26. Security and Configuration

API keys must never be committed to GitHub.

Use environment variables.

Example:

``` env
ETHERSCAN_API_KEY=your_api_key
GRAPHSENSE_API_URL=your_api_url
```

Add `.env` to `.gitignore`.

Example:

``` gitignore
.env
venv/
__pycache__/
node_modules/
*.db
```

For a public repository, use `.env.example`:

``` env
ETHERSCAN_API_KEY=
GRAPHSENSE_API_URL=
```

------------------------------------------------------------------------

# 27. Installation

## Clone Repository

``` bash
git clone <repository-url>
cd CryptoTrace
```

------------------------------------------------------------------------

## Backend Environment

``` bash
python -m venv venv
```

### Windows

``` bash
venv\Scripts\activate
```

### Linux / macOS

``` bash
source venv/bin/activate
```

------------------------------------------------------------------------

## Install Python Dependencies

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

## Frontend

``` bash
cd frontend
npm install
```

------------------------------------------------------------------------

# 28. Running CryptoTrace

## Start Backend

From the project root:

``` bash
python backend/app.py
```

or, depending on the implementation:

``` bash
uvicorn backend.app:app --reload
```

------------------------------------------------------------------------

## Start Frontend

``` bash
cd frontend
npm run dev
```

Open the local URL displayed by the development server.

------------------------------------------------------------------------

# 29. Recommended SIH Demo

The judging demo should use prepared, manually verified cases.

### Recommended sequence

``` text
1. Open CryptoTrace
        ↓
2. Enter Case 1 wallet
        ↓
3. Click Trace
        ↓
4. Show graph animation
        ↓
5. Reveal VASP
        ↓
6. Show confidence
        ↓
7. Explain evidence
        ↓
8. Show Case 2 risk/OFAC flag
        ↓
9. Open investigation report
        ↓
10. Explain architecture
        ↓
11. Explain roadmap
```

Do not use an unrehearsed live wallet during the main judging flow.

------------------------------------------------------------------------

# 30. Demo Script

## 0:00--0:20 --- Problem

"Blockchain transactions are transparent, but identifying the service
associated with an unknown wallet can require significant investigation.
CryptoTrace helps investigators move from an unknown wallet to an
explainable VASP attribution."

------------------------------------------------------------------------

## 0:20--0:40 --- Input

Enter the prepared Ethereum wallet.

``` text
[ Trace Wallet ]
```

------------------------------------------------------------------------

## 0:40--1:15 --- Graph

Show the graph being constructed.

Explain:

``` text
This is the unknown wallet.
We trace its transaction neighborhood up to three hops.
The graph shows the connected addresses and the eventual known VASP.
```

------------------------------------------------------------------------

## 1:15--1:35 --- Attribution

Show:

``` text
VASP: Example Exchange
Confidence: 87%
Hop Distance: 2
```

Then show the evidence.

------------------------------------------------------------------------

## 1:35--1:55 --- Risk Case

Run the prepared risk case.

Show:

``` text
Risk Flag Detected
```

Explain that the system surfaces known-list intelligence rather than
making an unsupported accusation.

------------------------------------------------------------------------

## 1:55--2:15 --- Report

Open the investigation report.

Show:

-   Case ID
-   Wallet
-   VASP
-   Confidence
-   Path
-   Evidence
-   Risk flags

------------------------------------------------------------------------

## 2:15--2:40 --- Architecture

Explain:

``` text
React
  ↓
Python API
  ↓
Chain Adapter
  ↓
NetworkX Graph
  ↓
Tagging
  ↓
Attribution
  ↓
Evidence
  ↓
Report
```

------------------------------------------------------------------------

## 2:40--3:00 --- Roadmap

Explain that the adapter-based architecture can be extended to:

-   More blockchains
-   Better label coverage
-   Commercial intelligence APIs
-   Advanced graph analytics
-   ML-assisted attribution
-   More sophisticated risk analysis
-   SAHYOG integration

------------------------------------------------------------------------

# 31. Team Responsibilities

  -----------------------------------------------------------------------
  Role                                Responsibility
  ----------------------------------- -----------------------------------
  **B1 --- Blockchain/Data**          Etherscan client, transaction
                                      normalization, GraphSense client,
                                      labels, caching

  **B2 --- Graph/Attribution**        NetworkX, BFS, hop distance, paths,
                                      candidate ranking, confidence

  **B3 --- Backend/API**              Flask/FastAPI, SQLite, REST
                                      endpoints, DEMO/LIVE modes,
                                      integration

  **B4 --- Integration/QA**           Demo cases, ground truth, testing,
                                      GitHub, release verification

  **F1 --- Frontend**                 React dashboard, D3 graph, result
                                      screens, API integration

  **F2 --- UI/PPT/Demo**              Visual design, presentation,
                                      architecture diagrams, demo script
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 32. Development Strategy

The prototype should be developed around a single critical path:

``` text
Wallet Input
      ↓
Trace
      ↓
Graph
      ↓
VASP
      ↓
Confidence
      ↓
Evidence
      ↓
Report
```

This path must work before optional features are added.

## Priority Order

### P0 --- Must Work

-   Wallet input
-   Trace API
-   Graph
-   2--3 hop BFS
-   VASP attribution
-   Confidence
-   Evidence
-   Working UI
-   3 prepared cases

### P1 --- Useful

-   Live Etherscan mode
-   GraphSense enrichment
-   OFAC enrichment
-   Advanced graph animations

### P2 --- Optional

-   Case history
-   Dedicated PDF generation
-   Additional UI features

### P3 --- Future

-   Multi-chain
-   ML/GNN
-   Advanced mixer detection
-   Production monitoring
-   SAHYOG integration

------------------------------------------------------------------------

# 32.5. Build Schedule to 11 September 2026

The prototype is being developed around college hours (9 AM–5 PM) and exam constraints.

| Date | Target |
|---|---|
| **4 Sep** | Core backend skeleton, transaction normalization, NetworkX/BFS, demo cases, React screens, PPT skeleton |
| **5 Sep** | API fallback/cache flow, attribution scoring, backend/frontend integration, first complete end-to-end case |
| **6 Sep** | Error handling, scoring tests, UI fixes, case verification, Version 0.1 |
| **7 Sep** | Exam day — smoke testing and stabilization only |
| **8 Sep** | Offline DEMO MODE, scoring freeze, README/run scripts, demo case documentation, graph/PPT refinement |
| **9 Sep** | Exam day — release-candidate testing and smoke testing only |
| **10 Sep** | Final integration, deterministic attribution, QA, D3 polish, PPT completion, timed demo rehearsal, feature freeze |
| **11 Sep** | Presentation, final demo verification, show-stopper fixes only |

### Final feature-freeze rule

**No major new features after 10 September night.**

The objective is to arrive on 11 September with a stable, repeatable prototype rather than an unfinished system with additional experimental features.

---

# 33. Risk and Fallback Plan

## API Rate Limits

### Risk

External API calls may fail or be rate limited.

### Solution

Use:

``` text
Cache
+
Retry / Backoff
+
DEMO MODE
```

------------------------------------------------------------------------

## GraphSense Availability

### Risk

GraphSense may be unavailable or difficult to configure.

### Solution

Use local verified labels and Etherscan-derived data as fallback.

------------------------------------------------------------------------

## Sparse Labels

### Risk

Many blockchain addresses are not labelled.

### Solution

Return:

``` text
No Confident Attribution
```

and maintain a manually verified demo dataset.

------------------------------------------------------------------------

## Team Availability

College and exams reduce development time.

### Solution

-   Freeze architecture early.
-   Freeze scoring before final integration.
-   Avoid new features on exam days.
-   Finish core prototype before the final day.
-   Keep September 11 for presentation and show-stopper fixes only.

------------------------------------------------------------------------

## Scope Creep

Do not add a feature unless:

``` text
Core Demo
      ↓
Already Stable
      ↓
Feature Adds Clear Judge Value
```

------------------------------------------------------------------------

# 34. Post-September 11 Roadmap

## Phase 1 --- Current Prototype

``` text
Ethereum
+
3-Hop Graph
+
VASP Labels
+
Explainable Attribution
+
Risk Flags
```

------------------------------------------------------------------------

## Phase 2 --- More Chains

Add adapters for:

``` text
Bitcoin
Other supported blockchains
```

The core graph/attribution engine should remain reusable.

------------------------------------------------------------------------

## Phase 3 --- Better Intelligence

Add:

-   More comprehensive wallet labels
-   More VASP datasets
-   Commercial blockchain intelligence APIs
-   Better entity resolution
-   Advanced clustering

------------------------------------------------------------------------

## Phase 4 --- Advanced Analytics

Potential future capabilities:

-   Mixer behavior analysis
-   DeFi interaction analysis
-   Cross-chain tracing
-   Temporal graph analysis
-   ML/GNN-assisted ranking
-   Automated anomaly detection

------------------------------------------------------------------------

## Phase 5 --- Production Integration

Potential integrations:

-   Enterprise AML systems
-   Real-time monitoring
-   Case management
-   SAHYOG integration
-   Scalable cloud architecture

------------------------------------------------------------------------

# 35. Responsible Use

CryptoTrace is designed as an AML/compliance investigation aid.

The system should:

-   Use public or legally accessible blockchain intelligence.
-   Focus on service/VASP-level attribution.
-   Avoid attempting to identify private individuals.
-   Present uncertainty explicitly.
-   Preserve an evidence trail.
-   Avoid unsupported conclusions.
-   Never treat heuristic attribution as definitive proof.

A high confidence score means that the available signals strongly
support the candidate VASP; it does not establish legal ownership.

------------------------------------------------------------------------

# 36. Judge Q&A

## Q1. Are you replacing Chainalysis?

**Answer:**

No. CryptoTrace is a prototype demonstrating an explainable graph-based
approach to VASP attribution using available blockchain intelligence. It
is not intended to replace commercial blockchain intelligence platforms.

------------------------------------------------------------------------

## Q2. How accurate is your system?

**Answer:**

Accuracy depends on the coverage and quality of available wallet labels
and transaction intelligence. For the prototype, our demonstration cases
are manually verified and the attribution methodology is deterministic
and explainable.

------------------------------------------------------------------------

## Q3. Why didn't you use ML?

**Answer:**

For this prototype, deterministic graph reasoning is easier to validate
and explain, especially because publicly available labelled wallet
datasets can be sparse. ML/GNN-based attribution is part of the future
roadmap once a sufficiently large verified dataset is available.

------------------------------------------------------------------------

## Q4. What happens if the API goes down?

**Answer:**

CryptoTrace has DEMO MODE with cached, verified transaction cases.
Importantly, the same graph and attribution engine processes the cached
data, so the presentation does not depend on external API availability.

------------------------------------------------------------------------

## Q5. What about mixers?

**Answer:**

Advanced mixer behavior analysis is outside the prototype scope.
Known-list risk indicators can be surfaced where supported, while deeper
mixer analytics are planned as future work.

------------------------------------------------------------------------

## Q6. Can you identify the person behind a wallet?

**Answer:**

No. CryptoTrace is designed for service/VASP-level attribution. It does
not attempt to de-anonymize or identify private individuals.

------------------------------------------------------------------------

## Q7. Can it work on Bitcoin?

**Answer:**

The architecture is adapter-based, so additional blockchains can be
added without redesigning the core attribution engine. Ethereum is the
primary implementation for the current prototype.

------------------------------------------------------------------------

## Q8. Is the result legally admissible evidence?

**Answer:**

No. The prototype is an investigation-assistance tool. Its outputs
depend on available data and heuristics and should not be treated as
standalone court-admissible forensic evidence.

------------------------------------------------------------------------

## Q9. How does the confidence score work?

**Answer:**

It combines explainable signals such as graph proximity, independent
transaction paths, transaction activity, recency, and label reliability.
We expose the underlying reasons rather than presenting the score as an
unexplained probability.

------------------------------------------------------------------------

# 37. Definition of Done

CryptoTrace is considered ready for the SIH prototype demonstration when
all of the following are true:

-   [ ] Wallet address can be entered.
-   [ ] Ethereum chain can be selected.
-   [ ] Trace request reaches the backend.
-   [ ] Demo cases work without external APIs.
-   [ ] Transaction graph is constructed.
-   [ ] BFS traversal works up to 3 hops.
-   [ ] VASP candidate is identified.
-   [ ] Attribution is deterministic for prepared cases.
-   [ ] Confidence score is displayed.
-   [ ] Evidence reasons are displayed.
-   [ ] Risk/OFAC case is demonstrated.
-   [ ] No-confident-attribution case works.
-   [ ] D3 graph renders correctly.
-   [ ] Investigation report works.
-   [ ] API errors are handled gracefully.
-   [ ] README/setup documentation is complete.
-   [ ] Demo addresses are documented.
-   [ ] Three consecutive rehearsed demos succeed.
-   [ ] No critical dependency on live API availability.
-   [ ] Final build is frozen before presentation.

------------------------------------------------------------------------

# 38. Disclaimer

CryptoTrace is an academic/prototype project developed for:

**Smart India Hackathon 2026 --- Problem Statement PS-182**

The attribution results generated by CryptoTrace are dependent on:

-   Available blockchain transaction data
-   Wallet/entity label coverage
-   External intelligence sources
-   Graph structure
-   Heuristic scoring

Therefore, results should not be interpreted as definitive proof of
ownership, identity, criminal activity, or legal responsibility.

CryptoTrace is intended to demonstrate a technically explainable
approach to blockchain investigation and VASP-level attribution.

------------------------------------------------------------------------

# CryptoTrace

### Trace. Attribute. Investigate.

**SIH 2026 • PS-182 • Blockchain Intelligence • VASP Attribution**
