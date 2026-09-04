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
