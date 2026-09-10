"""
tests/test_cases.py - Day 4 Demo Case Acceptance & Gate Tests
Verifies 100% test pass rate across all ground truth cases in demo_cases.json:
CASE-001 (Clean Binance Attribution), CASE-002 (OFAC / Lazarus High Risk), CASE-003 (No Confident Attribution).
"""

import json
import os
import sys
import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(HERE, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
DATA_FILE = os.path.join(BACKEND_DIR, "data", "demo_cases.json")

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.app import create_app

FROZEN_TRACE_KEYS = {
    "case_id", "chain", "input_address", "selected_vasp", "confidence",
    "hop_distance", "path", "evidence", "risk_flags", "nodes", "edges", "typologies"
}
NODE_REQUIRED_KEYS = {"id", "label", "type", "hop", "risk"}
EDGE_REQUIRED_KEYS = {"source", "target", "tx_hash", "value", "timestamp"}


@pytest.fixture(scope="module")
def ground_truth():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


class TestDay4GroundTruthAcceptance:
    """Step 7.2: Verify that all 3 ground truth cases return expected VASP, confidence, and risk flags."""

    def test_demo_cases_file_structure(self, ground_truth):
        assert {"CASE-001", "CASE-002", "CASE-003", "CASE-TRON-001"}.issubset(ground_truth.keys())
        for case_id, case in ground_truth.items():
            assert "target_address" in case
            assert "expected_vasp" in case
            assert "expected_confidence_min" in case
            assert "expected_hop_distance" in case
            assert "expected_risk" in case

    def test_get_cases_endpoint_lists_all(self, client, ground_truth):
        resp = client.get("/api/cases")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("success") is True
        listed_ids = {c["case_id"] for c in data["cases"]}
        assert listed_ids == set(ground_truth.keys())

    @pytest.mark.parametrize("case_id", ["CASE-001", "CASE-002", "CASE-003"])
    def test_trace_frozen_contract_and_values(self, client, ground_truth, case_id):
        case = ground_truth[case_id]
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": case["target_address"],
            "max_hops": 3,
            "mode": "demo"
        })
        assert resp.status_code == 200
        data = resp.get_json()

        # 1. Assert all 11 frozen keys
        assert set(data.keys()) == FROZEN_TRACE_KEYS, f"Keys mismatch in {case_id}: {set(data.keys()) ^ FROZEN_TRACE_KEYS}"

        # 2. Assert ground truth attribution and metrics
        assert data["selected_vasp"] == case["expected_vasp"]
        assert data["confidence"] >= case["expected_confidence_min"]
        assert data["hop_distance"] == case["expected_hop_distance"]

        # 3. Assert risk flags
        if case["expected_risk"] in ("LOW", "NONE"):
            assert data["risk_flags"] == [], f"Expected empty risk_flags for {case_id}, got {data['risk_flags']}"
        else:
            assert len(data["risk_flags"]) > 0, f"Expected non-empty risk_flags for {case_id}"
            assert any("OFAC" in rf or "risk" in rf.lower() or "sanction" in rf.lower() for rf in data["risk_flags"])

        # 4. Assert nodes & edges schema compliance
        assert isinstance(data["nodes"], list)
        assert isinstance(data["edges"], list)
        for node in data["nodes"]:
            assert NODE_REQUIRED_KEYS.issubset(set(node.keys()))
            assert node["risk"] in ("NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL")
        for edge in data["edges"]:
            assert EDGE_REQUIRED_KEYS.issubset(set(edge.keys()))
            assert isinstance(edge["value"], float)

    def test_case_001_multi_hop_path(self, client, ground_truth):
        case = ground_truth["CASE-001"]
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": case["target_address"],
            "max_hops": 3,
            "mode": "demo"
        })
        data = resp.get_json()
        assert len(data["path"]) == 3
        assert data["hop_distance"] == 2
        assert len(data["edges"]) >= 2
        assert any(n["type"] == "vasp" for n in data["nodes"])

    def test_case_002_sanction_risk_panel_data(self, client, ground_truth):
        case = ground_truth["CASE-002"]
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": case["target_address"],
            "max_hops": 3,
            "mode": "demo"
        })
        data = resp.get_json()
        assert data["hop_distance"] == 1
        assert any(n.get("risk") == "HIGH" for n in data["nodes"])

    def test_case_003_isolated_empty_tx_history(self, client, ground_truth):
        case = ground_truth["CASE-003"]
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": case["target_address"],
            "max_hops": 3,
            "mode": "demo"
        })
        data = resp.get_json()
        assert data["selected_vasp"] == "No Confident Attribution"
        assert data["confidence"] == 0
        assert data["edges"] == []
        assert len(data["nodes"]) == 1

    @pytest.mark.parametrize("case_id", ["CASE-001", "CASE-002", "CASE-003"])
    def test_reports_for_all_demo_cases(self, client, case_id):
        resp = client.get(f"/api/report/{case_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("success") is True
        assert "report" in data
        rep = data["report"]
        assert rep["case_id"] == case_id
        assert "summary" in rep
        assert "evidence_trail" in rep
        assert "recommendation" in rep
