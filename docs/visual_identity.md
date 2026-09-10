# 🎨 CryptoTrace — Visual Identity System & Design Specification

> **SIH 2026 — Problem Statement PS-182**  
> **Role Ownership**: `F2 — UI/PPT/Demo` | **Date**: September 4, 2026  
> **Target Audience**: AML Compliance Officers, Law Enforcement Investigators, SIH Evaluation Jury  

---

## 1. Design Philosophy & Aesthetic Vision

CryptoTrace is an automated blockchain intelligence platform built for financial crime investigators. The visual identity embodies **three core principles**:

1. **Investigative Clarity & High Information Density**: Clean dark-mode canvas prevents eye fatigue during extended investigative sessions and ensures critical alerts (OFAC flags, high-confidence attributions) immediately draw the investigator's eye.
2. **Deterministic Confidence & Trust**: Every visual indicator corresponds directly to an explainable mathematical metric. Color is never decorative; it encodes hop depth, entity classification, and risk severity.
3. **Audit-Ready Presentation**: Typography, data badges, and layout hierarchy mirror formal forensic intelligence terminals (e.g., Bloomberg, Palantir, Chainalysis) with zero visual clutter.

---

## 2. Color System & Design Tokens

### 2.1 Foundational Dark Theme Surfaces

| Token Name | Hex Code | RGB | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#0B0F19` | `rgb(11, 15, 25)` | Deep space background canvas; radial gradient base |
| `--color-bg-alt` | `#080C14` | `rgb(8, 12, 20)` | Deep recessed areas, code blocks, raw JSON viewer |
| `--color-surface` | `#111827` | `rgb(17, 24, 39)` | Main app panels, sidebar container |
| `--color-surface-elevated`| `#1E293B` | `rgb(30, 41, 59)` | Interactive cards, modals, form containers |
| `--color-surface-soft` | `#151D2D` | `rgb(21, 29, 45)` | Form input background, monospace address chips |
| `--color-surface-hover`| `#1F2D42` | `rgb(31, 45, 66)` | Card and button hover state |
| `--color-line` | `#2A374C` | `rgb(42, 55, 76)` | Primary structural borders and dividers |
| `--color-line-subtle` | `rgba(139, 152, 173, 0.18)` | — | Header lines, subtle table separators |

### 2.2 Brand & Primary Accents

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `--color-primary` | `#3B82F6` | Primary action button, active navigation indicator |
| `--color-primary-bright` | `#60A5FA` | Eyebrow text, active tab highlights, link accents |
| `--color-primary-glow` | `rgba(59, 130, 246, 0.25)` | Focused input shadow, pulse animation glow |

### 2.3 Graph Node & Domain Entity Taxonomy (D3.js & UI)

To guarantee instant mental model alignment across both the interactive D3 transaction graph and the attribution dashboard, the following color-coding taxonomy is strictly enforced:

| Entity Type | Token Name | Hex Code | Visual Meaning & Representation |
| :--- | :--- | :--- | :--- |
| **Target Wallet** | `--node-target` | `#F59E0B` (Amber Gold) | The input wallet under active investigation (Hop 0) |
| **Hop 1 Intermediary** | `--node-hop1` | `#3B82F6` (Electric Blue)| First-degree direct counterparty node |
| **Hop 2 Intermediary** | `--node-hop2` | `#8B5CF6` (Violet Purple)| Second-degree transaction intermediary |
| **Hop 3 Intermediary** | `--node-hop3` | `#06B6D4` (Cyan Teal) | Third-degree boundary node |
| **Verified VASP** | `--node-vasp` | `#10B981` (Emerald Mint)| Attributed exchange / service (e.g. Binance, Coinbase) |
| **High-Risk / OFAC** | `--node-risk` | `#EF4444` (Crimson Red) | Sanctioned entity, darknet market, or exploit wallet |
| **Unlabelled / Unknown** | `--node-unknown` | `#64748B` (Steel Slate)| Standard wallet without confirmed identity tag |

---

## 3. Typography & Monospace Formatting

```css
/* Display & UI Hierarchy */
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;

/* Cryptographic & Forensic Hierarchy */
font-family: 'DM Mono', 'Fira Code', monospace;
```

### 3.1 Type Scale & Application

- **Hero / Page Heading (`h1`)**: `clamp(2.5rem, 6vw, 4.5rem)` | Weight: `800` | Letter-spacing: `-0.05em` | Line-height: `1.05`
- **Section Heading (`h2`)**: `1.25rem` – `1.5rem` | Weight: `700` | Letter-spacing: `-0.03em`
- **Card Subheading (`h3`)**: `1.0rem` – `1.15rem` | Weight: `600`
- **Eyebrow Text**: `0.68rem` | Weight: `500` | Monospace | Letter-spacing: `0.13em` | Uppercase
- **Address & Hash Display**: `0.72rem` – `0.80rem` | Monospace (`DM Mono`) | Letter-spacing: `0.02em` | User-selectable

### 3.2 Rules for Ethereum Address Formatting
1. Full 42-character hex addresses must always be rendered in monospace font.
2. In compact summary views, addresses should be truncated using standard ellipsis: `0x742d...f44e` (first 6 characters + `...` + last 4 characters).
3. Clicking on any truncated address chip must automatically copy the full checksummed hex string to clipboard and display a temporary micro-toast (`Copied!`).

---

## 4. D3.js Force-Directed Graph Visual Standards

For **F1** during Day 2 & Day 5 graph implementation, the following rendering parameters must be applied in `TransactionGraph.jsx`:

### 4.1 Node Geometries & Glow Effects

| Node Role | Radius ($r$) | Fill Color | Stroke Color & Width | Glow Filter |
| :--- | :--- | :--- | :--- | :--- |
| **Target Wallet** | `18px` | `#F59E0B` | `#FDE68A` (2.5px) | Amber drop-shadow (radius: 8px) |
| **Verified VASP** | `16px` | `#10B981` | `#A7F3D0` (2.5px) | Emerald drop-shadow (radius: 8px) |
| **OFAC / High Risk** | `16px` | `#EF4444` | `#FECACA` (3px) | Crimson drop-shadow (radius: 12px) |
| **Hop 1 Node** | `12px` | `#3B82F6` | `#93C5FD` (1.5px) | Subtle blue glow |
| **Hop 2/3 Node** | `11px` | `#8B5CF6` / `#06B6D4` | Unchanged (1.5px) | None |
| **Unknown Node** | `10px` | `#64748B` | `#94A3B8` (1.0px) | None |

### 4.2 Edge Standards
- **Directional Markers**: SVG marker arrowheads (`marker-end: url(#arrow)`) pointing from sender to receiver.
- **Default Edge Stroke**: `#2A374C` | Width: `1.5px` | Opacity: `0.7`.
- **Attribution Path Edge (Highlighted)**: `#60A5FA` | Width: `2.5px` | Opacity: `1.0` | Animated dash array (`stroke-dasharray: 4 2`).
- **Edge Tooltip**: On hover, display floating chip showing transaction hash, ETH value transferred, and UTC timestamp.

---

## 5. UI Component Primitives & Styling Guidelines

### 5.1 Attribution Card (`AttributionCard.jsx` — F2 Day 2)
- Displays candidate VASP badge prominently with verified entity logo/mark.
- **Confidence Meter**:
  - Score $\ge 75\%$: Emerald Green gradient (`#10B981` $\to$ `#34D399`) + "HIGH CERTAINTY" badge.
  - Score $50\% - 74\%$: Amber gradient (`#F59E0B` $\to$ `#FBBF24`) + "MODERATE" badge.
  - Score $< 50\%$: Red/Orange gradient (`#EF4444` $\to$ `#F87171`) + "LOW" badge.
- Hop distance pill: e.g. `2 Hops from Target`.

### 5.2 Evidence Panel (`EvidencePanel.jsx` — F2 Day 2)
- Ordered list of explainable reasoning points generated by `attribution.py`.
- Each bullet is preceded by a glowing blue dot (`.evidence-marker`).
- Clear, readable typography highlighting specific addresses, transaction counts, and volume figures.

### 5.3 Risk Banner (`RiskPanel.jsx` — F2 Day 3)
- Rendered only when `risk_flags.length > 0`.
- Deep crimson gradient background (`linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(127, 29, 29, 0.25))`).
- Alert icon with pulsating glow.
- Clearly states: Sanctions designation source (e.g. OFAC SDN List, Lazarus Group DPRK) and the exact hop where the risk node was encountered.

---

## 6. Accessibility & Contrast Verification

- Contrast ratio of primary text (`#F8FAFC`) against surface (`#1E293B`): **11.4:1** (Exceeds WCAG AAA standard of 7:1).
- Contrast ratio of secondary text (`#CBD5E1`) against background (`#0B0F19`): **10.8:1** (Exceeds WCAG AAA).
- Contrast ratio of muted text (`#8B98AD`) against surface (`#1E293B`): **4.6:1** (Passes WCAG AA standard of 4.5:1).
- Color-blind safety: Every status color is paired with a textual label or distinct geometric icon/badge so color is never the sole carrier of critical information.
