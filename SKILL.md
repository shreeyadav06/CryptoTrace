---
name: cryptotrace-b1-blockchain-data-engine
description: Use this skill when working on CryptoTrace (SIH 2026, PS-182) in the B1 — Blockchain & Data Engine role — chain_adapter.py, normalizer.py, labels.py, demo_cases.json, labels.json, ofac.json, and the Live→Fallback→Cache pipeline. Trigger for any task involving fetching or normalizing Ethereum transaction data, VASP/OFAC label lookups, building demo datasets, or wiring the data layer that feeds graph_engine.py (owned by B2).
---

# CryptoTrace — B1: Blockchain & Data Engine

## Scope boundary
Own: `backend/services/chain_adapter.py`, `normalizer.py`, `labels.py`, and `backend/data/{demo_cases.json, labels.json, ofac.json}`.
Do not touch: `graph_engine.py`, `attribution.py`, `risk.py` (B2) · `app.py`, `routes/*` (B3) · anything in `frontend/` (F1/F2).
Your only downstream consumer is B2's `graph_engine.py` — every function you write must produce output that plugs into it without B2 needing to reshape it.

## Function contracts (exact signatures — do not deviate)

```python
# normalizer.py
def normalize_tx(raw_tx: dict) -> dict:
    """Returns: {"hash": str, "from": str, "to": str, "value": float, "timestamp": str (ISO 8601), "block": int}"""

# chain_adapter.py
def fetch_transactions(address: str, mode: str) -> list[dict]:
    """
    mode="demo": load matching case from demo_cases.json, zero network calls.
    mode="live": call Etherscan API; on timeout/error/rate-limit, fall back to
                 cached local data WITHOUT raising — the caller must never see
                 an exception from a live-mode failure.
    Returns list of RAW tx dicts (pre-normalization), ready to pass to normalize_tx().
    """

# labels.py
def get_address_label(address: str) -> str | None:
    """Case-insensitive lookup against labels.json. Returns VASP name or None."""
```

## Data file schemas (agent must match exactly when generating/editing)

**`demo_cases.json`** — keyed by case ID, each value has raw (pre-normalized) tx list:
```json
{
  "CASE-001": {
    "title": "Clean VASP Attribution Case",
    "target_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "transactions": [ { "hash": "0x...", "from": "0x...", "to": "0x...", "value": 2.5, "timestamp": "2026-08-28T14:20:00", "block": 20500000 } ],
    "expected_vasp": "Binance",
    "expected_confidence_min": 80,
    "expected_hop_distance": 2,
    "expected_risk": "LOW"
  }
}
```
Required 3 cases: CASE-001 (clean 2-hop → Binance, ≥80% conf), CASE-002 (OFAC-flagged path, HIGH risk), CASE-003 (isolated wallet → 0 conf, no risk).

**`labels.json`**: `{ "0xaddress_lowercase": "VASP Name" }` — flat map, addresses lowercase, no checksums.

**`ofac.json`**: `{ "0xaddress_lowercase": true }` or a flat array of lowercase addresses — pick one and use it consistently across `risk.py` (B2) expects this, so confirm the shape with B2 before changing it.

## Non-negotiable rules
1. **Never let live-mode failures propagate.** Any Etherscan timeout/error/429 must be caught inside `chain_adapter.py` and silently resolved via fallback to cached data — not surfaced as an exception to `app.py`.
2. **`normalize_tx` must be pure** — no I/O, no side effects, deterministic output for the same input. B2's BFS depends on stable field names (`from`/`to`, not `sender`/`receiver` or similar variants).
3. **All addresses lowercase** in every JSON file and in every function's internal comparisons — Ethereum addresses are case-insensitive for lookups but checksum-cased on input; normalize before storing/comparing.
4. **`mode="demo"` must have zero network dependency** — no import-time or call-time network calls of any kind, since Day 5's offline gate disconnects the network entirely.
5. Coordinate any change to `demo_cases.json`'s raw-tx shape with B4 (`tests/test_cases.py` depends on it) before committing.

## Implementation order (with target dates — Sep 4 → Sep 11 build window)
1. `normalize_tx` + `fetch_transactions(mode="demo")` + seed CASE-001 raw data — unblocks B2 immediately (Sep 4)
2. `get_address_label` + labels.json seed data + Live→Fallback→Cache logic in `chain_adapter.py` (Sep 5)
3. `ofac.json` + exponential backoff/error handlers in `chain_adapter.py` (Sep 6)
4. Backend freeze — bugfixes/schema-consistency only, no new features (Sep 7)
5. Offline verification: disconnect network, confirm `mode="demo"` runs end-to-end (Sep 8)
6. Tag `v1.0-demo`, verify fresh-clone install has no missing deps (Sep 9)
7. Final integration check, hard feature freeze 10:00 PM (Sep 10)

## Verification commands
```bash
# Import + wiring sanity check (must pass from Day 1)
python -c "from services.graph_engine import build_transaction_graph; print('Graph engine import OK')"

# Offline demo-mode check (must pass with network disabled, Day 5+)
python -c "from services.chain_adapter import fetch_transactions; print(len(fetch_transactions('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', mode='demo')))"

# Full backend suite
pytest tests/
```
