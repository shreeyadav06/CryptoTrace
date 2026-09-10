"""
tests/test_sahyog.py - B4 Day 1, Task 4.2
API contract tests for routes/sahyog.py (owned by B3, branch feature/B3-api):
    POST /api/sahyog/case-ingest
    GET  /api/sahyog/disclosure-notice/<case_id>

NOTE (zero-overlap branching): B4 does not own routes/sahyog.py or app.py. Until the
Day-1 octopus merge lands B3's branch (which registers sahyog_bp in app.py), these
tests will 404 or fail on collection - that is expected, not a B4 bug. Re-run after
the merge to validate the real contract.
"""
import os
import sys

import pytest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.app import create_app  # noqa: E402


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


TRON_WALLET = "TYG6n3s2K9mXkRt8UvWz3yBc1DeFa45678"


class TestSahyogCaseIngest:
    def test_case_ingest_returns_analyzed_status(self, client):
        payload = {
            "fir_number": "FIR-2026-CYBER-104",
            "police_station": "Cyber Crime Police Station, Special Cell, New Delhi",
            "complainant_loss": "50,000 USDT",
            "wallet_address": TRON_WALLET,
            "chain": "tron",
        }
        response = client.post("/api/sahyog/case-ingest", json=payload)
        assert response.status_code == 200

        data = response.get_json()
        assert data.get("status") == "ANALYZED"
        assert data.get("target_address") == TRON_WALLET
        assert data.get("chain") == "tron"
        assert data.get("attributed_vasp") == "Binance"
        assert data.get("confidence") == 85
        assert data.get("hop_distance") == 2
        assert "Peeling Chain" in data.get("typologies_detected", [])
        assert data.get("recommended_action") == "ISSUE_SECTION_91_FREEZE_NOTICE"
        assert "notice_url" in data

    def test_case_ingest_missing_wallet_returns_400(self, client):
        response = client.post("/api/sahyog/case-ingest", json={"fir_number": "FIR-2026-CYBER-104"})
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data


class TestSahyogDisclosureNotice:
    def test_disclosure_notice_ready_to_serve(self, client):
        response = client.get("/api/sahyog/disclosure-notice/CASE-TRON-001")
        assert response.status_code == 200

        data = response.get_json()
        assert data.get("case_id") == "CASE-TRON-001"
        assert data.get("status") == "READY_TO_SERVE"
        assert "legal_mandate" in data
        assert "notice_text" in data
        assert "SECTION 91" in data["notice_text"].upper()
