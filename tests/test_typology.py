"""
tests/test_typology.py - B4 Day 1, Task 4.2
Unit tests for backend/services/typology.py (owned by B2, branch feature/B2-intelligence).

NOTE (zero-overlap branching): B4 does not own services/typology.py and must not create
or edit it. Until the Day-1 octopus merge lands B2's branch into main, these tests will
fail on collection with ModuleNotFoundError - that is expected, not a B4 bug. Re-run this
file after the merge to validate the real contract.
"""
import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.typology import detect_laundering_typologies  # noqa: E402


class TestPeelingChain:
    def test_monotonically_decreasing_values_trigger_peeling_chain(self):
        """Task 4.2: two sequential hops with decreasing value => 'Peeling Chain'."""
        transactions = [
            {"from": "TYG6...", "to": "T9yD...", "value": 50000.0, "timestamp": "2026-09-08T10:00:00"},
            {"from": "T9yD...", "to": "TMuA...", "value": 49950.0, "timestamp": "2026-09-08T10:07:00"},
        ]
        nodes = [{"label": "Intermediary Peeling Wallet", "entity_type": "unknown"}]

        result = detect_laundering_typologies(transactions, [], nodes)

        assert "Peeling Chain" in result

    def test_increasing_values_do_not_trigger_peeling_chain(self):
        transactions = [
            {"from": "0xaaa", "to": "0xbbb", "value": 100.0, "timestamp": "2026-09-08T10:00:00"},
            {"from": "0xbbb", "to": "0xccc", "value": 150.0, "timestamp": "2026-09-08T10:07:00"},
        ]
        result = detect_laundering_typologies(transactions, [], [])
        assert "Peeling Chain" not in result

    def test_single_transaction_cannot_be_a_peeling_chain(self):
        transactions = [
            {"from": "0xaaa", "to": "0xbbb", "value": 100.0, "timestamp": "2026-09-08T10:00:00"},
        ]
        result = detect_laundering_typologies(transactions, [], [])
        assert "Peeling Chain" not in result


class TestMixerObfuscation:
    def test_mixer_entity_type_flags_mixer_obfuscation(self):
        nodes = [{"label": "Tornado Cash: Router", "entity_type": "mixer"}]
        result = detect_laundering_typologies([], [], nodes)
        assert "Mixer Obfuscation" in result

    def test_no_mixer_node_does_not_flag_mixer_obfuscation(self):
        nodes = [{"label": "Binance: TRC20 Hot Wallet", "entity_type": "cex"}]
        result = detect_laundering_typologies([], [], nodes)
        assert "Mixer Obfuscation" not in result


class TestRapidPassThrough:
    def test_sub_15_minute_hop_gap_flags_rapid_pass_through(self):
        """7-minute interval from CASE-TRON-001 must trip the < 900s rule."""
        transactions = [
            {"from": "TYG6...", "to": "T9yD...", "value": 50000.0, "timestamp": "2026-09-08T10:00:00"},
            {"from": "T9yD...", "to": "TMuA...", "value": 49950.0, "timestamp": "2026-09-08T10:07:00"},
        ]
        result = detect_laundering_typologies(transactions, [], [])
        assert "Rapid Pass-Through" in result

    def test_slow_hop_gap_does_not_flag_rapid_pass_through(self):
        transactions = [
            {"from": "0xaaa", "to": "0xbbb", "value": 100.0, "timestamp": "2026-09-08T10:00:00"},
            {"from": "0xbbb", "to": "0xccc", "value": 90.0, "timestamp": "2026-09-08T11:00:00"},
        ]
        result = detect_laundering_typologies(transactions, [], [])
        assert "Rapid Pass-Through" not in result


class TestCaseTronGroundTruth:
    def test_case_tron_001_fixture_trips_expected_typology(self):
        """Cross-check against the CASE-TRON-001 fixture added in demo_cases.json (Task 4.1)."""
        import json

        data_file = os.path.join(BACKEND_DIR, "data", "demo_cases.json")
        with open(data_file, "r", encoding="utf-8") as f:
            cases = json.load(f)

        case = cases["CASE-TRON-001"]
        result = detect_laundering_typologies(case["transactions"], [], [])

        assert case["expected_typology"] in result
