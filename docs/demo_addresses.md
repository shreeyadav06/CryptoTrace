# CryptoTrace — Ground Truth Demo Addresses (B4)

Owner: B4 (Integration/QA) · Sep 4 build day
Source of truth for: `backend/data/demo_cases.json`

This replaces the placeholder ground truth (`0x742d35Cc...`, `0x1111...1111`,
`0x9999...9999`) that was independently invented in the B1/B2/B3 branches.
Those addresses were synthetic and did not match a real VASP-tagged or
OFAC-listed wallet, so the "expected_vasp" / "expected_risk" fields were not
actually defensible if a judge checked them live. This file is.

## CASE-001 — Clean VASP Attribution

| Field | Value |
|---|---|
| Seed wallet | `0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a` *(synthetic, DEMO MODE fixture)* |
| Hop 1 intermediary | `0x765032347c528ec6769b8d4f1356e4aa48cde453` *(synthetic)* |
| Hop 2 — **VASP** | `0xf977814e90da44bfa03b6295a0616a897441acec` — **REAL, Etherscan-tagged "Binance: Hot Wallet 20"** |
| Expected VASP | Binance |
| Expected hop distance | 2 |
| Expected risk | LOW |
| Evidence source | Etherscan address tag, verified live via web search 2026-09-04 |

Only the final destination needs to be real for this case type — it's what
"expected_vasp" is graded against. The seed and hop-1 addresses are synthetic
DEMO MODE fixtures, which the plan (Sec. 1) explicitly allows.

## CASE-002 — OFAC / High Risk

| Field | Value |
|---|---|
| Sending wallet | `0xc3bfbab68c680a962fb9c3193b6fd2736b7db275` *(synthetic)* |
| Hop 1 — **flagged address** | `0x098b716b8aaf21512996dc57eb0615e2383e2f96` — **REAL, OFAC SDN-listed** |
| Expected VASP / label | OFAC SDN: Lazarus Group (DPRK) — Ronin Bridge Exploiter |
| Expected hop distance | 1 |
| Expected risk | HIGH |
| Evidence source | OFAC SDN List, Cyber-related Designation, 2022-04-14 (ofac.treasury.gov/recent-actions/20220414) |

**Why not Tornado Cash (used in the earlier draft)?** Tornado Cash's OFAC
status flip-flopped — sanctioned Aug 2022, delisted Mar 21 2025 — so as of
today (2026-09-04) it is **no longer on the SDN list** and is not a
defensible "currently sanctioned" example. The Lazarus Group / Ronin Bridge
exploiter address above was checked and remains actively designated today.
If a judge looks this address up live, it will still show as sanctioned.

## CASE-003 — No Confident Attribution

| Field | Value |
|---|---|
| Address | `0xf27eced4cde3b613ddbe5ea119969efe60151b20` *(synthetic, zero history — intentional)* |
| Expected VASP | "No Confident Attribution" |
| Expected hop distance | 0 |
| Expected risk | NONE |

An empty transaction list is *correct* for this case, not a gap to fill —
the point of the case is testing the "give up gracefully" path. Do not swap
this for a real low-activity address later: a real address risks acquiring a
tag or a transaction between now and the demo, which would silently break
this test case. Keep it synthetic.

## QA note for the team (as of this pass)

Running `tests/test_ground_truth.py` against the current B1 + B2 + B3
branches together: **all 15 tests pass**, but with one caveat worth flagging
before Sep 5 integration —

- B2's `graph_engine.py` (BFS + graph building) is real and independently
  verified: it correctly walks from CASE-001's seed wallet to the real
  Binance address in exactly 2 hops.
- B2's `attribution.py` / `labels.py` (VASP ranking + confidence scoring)
  **do not exist yet**. Right now `/api/trace` in DEMO mode works because
  B3's route falls back to echoing `expected_vasp` / `expected_confidence_min`
  straight out of `demo_cases.json` rather than computing them. That's fine
  as a Sep 4 placeholder, but it means the API-level tests are currently
  validating "does the demo response match the answer key I gave it,"
  not "did the attribution engine independently arrive at the right answer."
  Once B2 lands `attribution.py`, re-run this suite — that's the point at
  which CASE-002 and CASE-003 become real tests of the scoring logic instead
  of pass-through.
