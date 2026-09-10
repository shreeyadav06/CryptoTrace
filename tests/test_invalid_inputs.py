
import os
import sys
import pytest

HERE = os.path.dirname(os.path.abspath(__file__))


@pytest.fixture
def client():
    backend_dir = os.path.join(HERE, "..", "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    try:
        from app import create_app  # type: ignore
    except ImportError:
        pytest.skip("backend/app.py not importable yet")
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


class TestMissingOrEmptyFields:
    def test_empty_json_body(self, client):
        resp = client.post("/api/trace", json={})
        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_no_body_at_all(self, client):
        resp = client.post("/api/trace")
        # Flask returns 400 either from our own check or from a bad content-type;
        # the important thing is it never 500s / never crashes the process.
        assert resp.status_code in (400, 415)

    def test_address_is_empty_string(self, client):
        resp = client.post("/api/trace", json={"address": "", "mode": "demo"})
        assert resp.status_code == 400

    def test_address_is_whitespace_only(self, client):
        resp = client.post("/api/trace", json={"address": "   ", "mode": "demo"})
        assert resp.status_code == 400

    def test_address_field_missing_but_other_fields_present(self, client):
        resp = client.post("/api/trace", json={"chain": "ethereum", "max_hops": 3, "mode": "demo"})
        assert resp.status_code == 400


class TestMalformedAddress:
    """
    None of these should ever 500. A malformed address is a 'no confident
    attribution' / graceful-failure case, not a server error.
    """

    @pytest.mark.parametrize("bad_address", [
        "not_an_address",
        "0x123",                                   # too short
        "0x" + "a" * 39,                            # one hex char short
        "0x" + "a" * 41,                            # one hex char long
        "0x" + "zz" * 20,                           # invalid hex characters
        "1234567890abcdef1234567890abcdef12345678", # missing 0x prefix
        "'; DROP TABLE cases; --",                  # injection attempt
        "<script>alert(1)</script>",                # XSS attempt
        "0x" + "0" * 40,                            # the zero address
        " 0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a ",  # valid but padded with whitespace
    ])
    def test_malformed_address_never_crashes(self, client, bad_address):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": bad_address, "max_hops": 3, "mode": "demo",
        })
        assert resp.status_code in (200, 400), (
            f"address={bad_address!r} returned {resp.status_code}, expected a clean "
            f"200 (no-confident-attribution) or 400 (validation error), never a 500"
        )
        if resp.status_code == 200:
            data = resp.get_json()
            assert "selected_vasp" in data

    def test_mixed_case_checksum_address_is_treated_case_insensitively(self, client):
        """Etherscan/wallets commonly display addresses with EIP-55 checksum casing."""
        mixed_case = "0x85053B6941c4A71B820f4bBD4bAFA3D34f943E3A"
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": mixed_case, "max_hops": 3, "mode": "demo",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["selected_vasp"] == "Binance", (
            "Mixed-case CASE-001 address did not resolve to the same result as the "
            "lowercase version -- normalization is not fully case-insensitive somewhere "
            "in the chain_adapter -> normalizer -> graph_engine -> labels pipeline."
        )


class TestMalformedOtherFields:
    def test_unsupported_chain(self, client):
        resp = client.post("/api/trace", json={
            "chain": "dogecoin", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
            "max_hops": 3, "mode": "demo",
        })

        assert resp.status_code in (200, 400)

    def test_negative_max_hops(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
            "max_hops": -1, "mode": "demo",
        })
        assert resp.status_code in (200, 400)

    def test_absurdly_large_max_hops(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
            "max_hops": 999999, "mode": "demo",
        })
        assert resp.status_code in (200, 400)

    def test_max_hops_as_string(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
            "max_hops": "three", "mode": "demo",
        })
        assert resp.status_code in (200, 400)

    def test_unknown_mode_falls_back_safely(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
            "max_hops": 3, "mode": "turbo",
        })
        assert resp.status_code in (200, 400)


class TestNoConfidentAttributionPath:
    def test_never_seen_random_address_is_no_confident_attribution(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum",
            "address": "0x" + "c7" * 20,
            "max_hops": 3,
            "mode": "demo",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["selected_vasp"] == "No Confident Attribution"
        assert data["confidence"] == 0
        assert data["risk_flags"] == []

    def test_no_confident_attribution_never_fabricates_a_vasp_name(self, client):
        resp = client.post("/api/trace", json={
            "chain": "ethereum", "address": "0x" + "d8" * 20, "max_hops": 3, "mode": "demo",
        })
        data = resp.get_json()
        assert data["selected_vasp"] in ("No Confident Attribution",)


class TestHealthAndCasesEndpointsUnderStress:
    def test_health_check_always_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_cases_endpoint_survives_repeated_calls(self, client):
        for _ in range(5):
            resp = client.get("/api/cases")
            assert resp.status_code == 200

    def test_trace_get_method_not_allowed(self, client):
        """/api/trace is POST-only; a GET should 405, not 500."""
        resp = client.get("/api/trace")
        assert resp.status_code == 405
