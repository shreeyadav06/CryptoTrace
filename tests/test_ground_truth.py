"""
B4 -- Ground-truth contract tests for CryptoTrace.

These tests are written against the AGREED CONTRACTS (B1's fetch_transactions /
normalize_tx, B2's build_graph / bfs_trace, B3's /api/trace /api/cases), not
against whatever the code happens to currently output. If a test here fails,
the fix is in B1/B2/B3's code, not in this file or in demo_cases.json.

Run standalone (no backend needed) with:
    pytest tests/test_ground_truth.py -v

Some tests need B1 and B2's services on the path. They are skipped gracefully
(not failed) if a given person's module isn't importable yet, so B4 can start
running this before every branch is merged.
"""
import json
import os
import sys
import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(HERE, "..", "backend", "data", "demo_cases.json")


@pytest.fixture(scope="module")
def ground_truth():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Contract-level tests: don't need ANY teammate's code, just the JSON itself.
# Run these today, before B1/B2/B3 finish.
# ---------------------------------------------------------------------------

REQUIRED_FIELDS = {
    "title", "target_address", "transactions", "expected_vasp",
    "expected_confidence_min", "expected_hop_distance", "expected_risk",
}


class TestGroundTruthShape:
    def test_exactly_three_mandatory_case_types_present(self, ground_truth):
        assert set(ground_truth.keys()) == {"CASE-001", "CASE-002", "CASE-003"}

    def test_every_case_has_required_fields(self, ground_truth):
        for case_id, case in ground_truth.items():
            missing = REQUIRED_FIELDS - set(case.keys())
            assert not missing, f"{case_id} missing fields: {missing}"

    def test_every_address_is_well_formed(self, ground_truth):
        import re
        addr_re = re.compile(r"^0x[0-9a-f]{40}$")
        for case_id, case in ground_truth.items():
            assert addr_re.match(case["target_address"]), \
                f"{case_id} target_address is not a valid lowercase 0x+40hex address"
            for tx in case["transactions"]:
                assert addr_re.match(tx["from"]), f"{case_id} tx.from malformed"
                assert addr_re.match(tx["to"]), f"{case_id} tx.to malformed"

    def test_case_001_is_clean_low_risk_attribution(self, ground_truth):
        c = ground_truth["CASE-001"]
        assert c["expected_risk"] == "LOW"
        assert c["expected_vasp"] not in ("No Confident Attribution", "")
        assert len(c["transactions"]) > 0

    def test_case_002_is_high_risk_flag(self, ground_truth):
        c = ground_truth["CASE-002"]
        assert c["expected_risk"] == "HIGH"
        assert len(c["transactions"]) > 0, \
            "HIGH risk case must have real transaction data behind it, not an empty list"

    def test_case_003_is_no_confident_attribution(self, ground_truth):
        c = ground_truth["CASE-003"]
        assert c["expected_vasp"] == "No Confident Attribution"
        assert c["expected_risk"] == "NONE"


# ---------------------------------------------------------------------------
# Pipeline-level tests: need B1's chain_adapter + normalizer on sys.path.
# Skip (not fail) if B1's branch isn't merged/available yet.
# ---------------------------------------------------------------------------

def _try_import_b1():
    candidates = [
        os.path.join(HERE, "..", "backend", "services"),
    ]
    for c in candidates:
        if os.path.isdir(c) and c not in sys.path:
            sys.path.insert(0, c)
    try:
        from chain_adapter import fetch_transactions  # type: ignore
        from normalizer import normalize_tx  # type: ignore
        return fetch_transactions, normalize_tx
    except ImportError:
        return None, None


class TestB1Pipeline:
    def test_demo_mode_returns_exact_ground_truth_transactions(self, ground_truth):
        fetch_transactions, normalize_tx = _try_import_b1()
        if fetch_transactions is None:
            pytest.skip("B1 chain_adapter/normalizer not importable yet")

        for case_id, case in ground_truth.items():
            addr = case["target_address"]
            raw = fetch_transactions(addr, mode="demo")
            assert len(raw) == len(case["transactions"]), (
                f"{case_id}: fetch_transactions returned {len(raw)} txs, "
                f"ground truth has {len(case['transactions'])}. "
                f"chain_adapter.py must read from the SAME demo_cases.json this test reads."
            )

    def test_normalize_tx_lowercases_addresses(self, ground_truth):
        _, normalize_tx = _try_import_b1()
        if normalize_tx is None:
            pytest.skip("B1 normalizer not importable yet")

        c1 = ground_truth["CASE-001"]
        raw_tx = c1["transactions"][0]
        norm = normalize_tx(raw_tx)
        assert norm["from"] == raw_tx["from"].lower()
        assert norm["to"] == raw_tx["to"].lower()
        assert isinstance(norm["value"], float)


# ---------------------------------------------------------------------------
# Graph-level tests: need B2's graph_engine on sys.path.
# ---------------------------------------------------------------------------

def _try_import_b2():
    candidates = [os.path.join(HERE, "..", "backend", "services")]
    for c in candidates:
        if os.path.isdir(c) and c not in sys.path:
            sys.path.insert(0, c)
    try:
        from graph_engine import build_graph, bfs_trace  # type: ignore
        return build_graph, bfs_trace
    except ImportError:
        return None, None


class TestB2GraphAgainstGroundTruth:
    def test_case_001_reaches_expected_hop_distance(self, ground_truth):
        build_graph, bfs_trace = _try_import_b2()
        fetch_transactions, normalize_tx = _try_import_b1()
        if build_graph is None or fetch_transactions is None:
            pytest.skip("B1 and/or B2 services not importable yet")

        c1 = ground_truth["CASE-001"]
        raw = fetch_transactions(c1["target_address"], mode="demo")
        normalized = [normalize_tx(tx) for tx in raw]
        G = build_graph(normalized)
        result = bfs_trace(G, c1["target_address"], max_hops=3)

        vasp_addr = c1["transactions"][-1]["to"]  # last hop = the labeled VASP
        assert vasp_addr in result["paths"], (
            f"BFS from seed did not reach the expected VASP address {vasp_addr} "
            f"within {c1['expected_hop_distance']} hops"
        )
        actual_hops = len(result["paths"][vasp_addr]) - 1
        assert actual_hops == c1["expected_hop_distance"], (
            f"CASE-001 expected hop_distance={c1['expected_hop_distance']}, "
            f"BFS measured {actual_hops}"
        )


# ---------------------------------------------------------------------------
# API-level tests: need B3's Flask app.
# ---------------------------------------------------------------------------

class TestB3ApiAgainstGroundTruth:
    @pytest.fixture
    def client(self):
        backend_dir = os.path.join(HERE, "..", "backend")
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        try:
            from app import create_app  # type: ignore
        except ImportError:
            pytest.skip("B3 app.py not importable yet")
        app = create_app()
        app.config["TESTING"] = True
        with app.test_client() as c:
            yield c

    def test_get_cases_lists_all_three(self, client, ground_truth):
        resp = client.get("/api/cases")
        assert resp.status_code == 200
        data = resp.get_json()
        ids = {c["case_id"] for c in data["cases"]}
        assert ids == set(ground_truth.keys())

    @pytest.mark.parametrize("case_id", ["CASE-001", "CASE-002", "CASE-003"])
    def test_trace_matches_ground_truth(self, client, ground_truth, case_id):
        case = ground_truth[case_id]
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": case["target_address"],
            "max_hops": 3,
            "mode": "demo",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["selected_vasp"] == case["expected_vasp"]
        assert data["confidence"] >= case["expected_confidence_min"]
        assert data["hop_distance"] == case["expected_hop_distance"]
        assert data["risk_flags"] == [] if case["expected_risk"] in ("LOW", "NONE") \
            else len(data["risk_flags"]) > 0

    def test_trace_missing_address_returns_400(self, client):
        resp = client.post("/api/trace", json={})
        assert resp.status_code == 400

    def test_trace_unknown_address_is_no_confident_attribution(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": "0x" + "ab" * 20,
            "max_hops": 3,
            "mode": "demo",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["selected_vasp"] == "No Confident Attribution"
