import pytest
import sys
import os

# Add project root and backend directory to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.join(root_dir, 'backend')
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test GET /health returns 200 OK and status ok."""
    response = client.get('/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data == {"status": "ok"}

def test_get_cases(client):
    """Test GET /api/cases returns list of demo cases."""
    response = client.get('/api/cases')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data.get("success") is True
    assert "cases" in json_data
    assert len(json_data["cases"]) >= 1
    case_ids = [c["case_id"] for c in json_data["cases"]]
    assert "CASE-001" in case_ids

def test_post_trace_demo_case_1(client):
    """Test POST /api/trace with CASE-001 address."""
    payload = {
        "chain": "ethereum",
        "address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
        "max_hops": 3,
        "mode": "demo"
    }
    response = client.post('/api/trace', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data.get("case_id") == "CASE-001"
    assert data.get("selected_vasp") == "Binance"
    assert data.get("confidence") >= 80
    assert "nodes" in data
    assert "edges" in data

def test_post_trace_missing_address(client):
    """Test POST /api/trace with missing address returns 400."""
    response = client.post('/api/trace', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_get_report_case_1(client):
    """Test GET /api/report/CASE-001 returns investigation report."""
    response = client.get('/api/report/CASE-001')
    assert response.status_code == 200
    data = response.get_json()
    assert data.get("success") is True
    assert "report" in data
    report = data["report"]
    assert report.get("case_id") == "CASE-001"
    assert "summary" in report
    assert report["summary"]["selected_vasp"] == "Binance"

def test_get_report_not_found(client):
    """Test GET /api/report/CASE-NONEXISTENT returns 404."""
    response = client.get('/api/report/CASE-NONEXISTENT')
    assert response.status_code == 404
    data = response.get_json()
    assert data.get("success") is False

# --- Day 3 B3 Frozen Contract Tests (Step 3.7 & Step 3.8) ---

FROZEN_TRACE_KEYS = {
    "case_id", "chain", "input_address", "selected_vasp", "confidence",
    "hop_distance", "path", "evidence", "risk_flags", "nodes", "edges"
}

NODE_REQUIRED_KEYS = {"id", "label", "type", "hop", "risk"}
EDGE_REQUIRED_KEYS = {"source", "target", "tx_hash", "value", "timestamp"}

@pytest.mark.parametrize("payload,expected_vasp,expect_risk", [
    (
        {"chain": "ethereum", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a", "max_hops": 3, "mode": "demo"},
        "Binance",
        False
    ),
    (
        {"chain": "ethereum", "address": "0xc3bfbab68c680a962fb9c3193b6fd2736b7db275", "max_hops": 3, "mode": "demo"},
        "OFAC SDN: Lazarus Group (DPRK) - Ronin Bridge Exploiter",
        True
    ),
    (
        {"chain": "ethereum", "address": "0xf27eced4cde3b613ddbe5ea119969efe60151b20", "max_hops": 3, "mode": "demo"},
        "No Confident Attribution",
        False
    ),
])
def test_post_trace_frozen_contract_all_cases(client, payload, expected_vasp, expect_risk):
    """Step 3.8: Freeze backend API JSON response contract across all ground-truth cases."""
    response = client.post('/api/trace', json=payload)
    assert response.status_code == 200
    data = response.get_json()

    # 1. Assert all 11 required keys are present
    assert set(data.keys()) == FROZEN_TRACE_KEYS, f"Missing or extra keys: {set(data.keys()) ^ FROZEN_TRACE_KEYS}"

    # 2. Assert data types
    assert isinstance(data["case_id"], str)
    assert isinstance(data["chain"], str)
    assert isinstance(data["input_address"], str)
    assert isinstance(data["selected_vasp"], str)
    assert isinstance(data["confidence"], int)
    assert isinstance(data["hop_distance"], int)
    assert isinstance(data["path"], list)
    assert isinstance(data["evidence"], list)
    assert isinstance(data["risk_flags"], list)
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)

    # 3. Assert VASP attribution and risk_flags contract
    assert data["selected_vasp"] == expected_vasp
    if expect_risk:
        assert len(data["risk_flags"]) > 0, "Expected non-empty risk_flags for high-risk case"
        assert any("OFAC" in f or "risk" in f.lower() for f in data["risk_flags"])
    else:
        assert data["risk_flags"] == [], "Expected empty risk_flags for low/zero-risk case"

    # 4. Assert node schema compliance
    for node in data["nodes"]:
        assert NODE_REQUIRED_KEYS.issubset(set(node.keys()))
        assert isinstance(node["id"], str)
        assert isinstance(node["label"], str)
        assert isinstance(node["type"], str)
        assert isinstance(node["hop"], int)
        assert isinstance(node["risk"], str)
        assert node["risk"] in ("NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL")

    # 5. Assert edge schema compliance
    for edge in data["edges"]:
        assert EDGE_REQUIRED_KEYS.issubset(set(edge.keys()))
        assert isinstance(edge["source"], str)
        assert isinstance(edge["target"], str)
        assert isinstance(edge["tx_hash"], str)
        assert isinstance(edge["value"], float)
        assert isinstance(edge["timestamp"], str)

def test_post_trace_invalid_max_hops(client):
    """Ensure malformed max_hops returns structured 400 error."""
    response = client.post('/api/trace', json={
        "address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
        "max_hops": "invalid_number"
    })
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

