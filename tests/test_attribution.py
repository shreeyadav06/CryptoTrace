import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from services.graph_engine import build_transaction_graph
from services.attribution import rank_vasp_candidates


def _make_graph(txs):
    return build_transaction_graph(txs)


def test_case_001_two_hop_binance():
    txs = [
        {"hash": "0x1", "from": "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a",
         "to": "0x765032347c528ec6769b8d4f1356e4aa48cde453", "value": 4.1, "timestamp": "2026-09-01T09:12:00", "block": 1},
        {"hash": "0x2", "from": "0x765032347c528ec6769b8d4f1356e4aa48cde453",
         "to": "0xf977814e90da44bfa03b6295a0616a897441acec", "value": 4.06, "timestamp": "2026-09-01T09:18:00", "block": 2},
    ]
    G = _make_graph(txs)
    result = rank_vasp_candidates(G, "0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a")

    assert result["selected_vasp"] == "Binance"
    assert result["hop_distance"] == 2
    assert result["confidence"] >= 75
    assert result["risk_flags"] == []
    assert len(result["path"]) == 3


def test_case_002_ofac_one_hop():
    txs = [
        {"hash": "0x3", "from": "0xc3bfbab68c680a962fb9c3193b6fd2736b7db275",
         "to": "0x098b716b8aaf21512996dc57eb0615e2383e2f96", "value": 12.75, "timestamp": "2026-09-02T03:40:00", "block": 3},
    ]
    G = _make_graph(txs)
    result = rank_vasp_candidates(G, "0xc3bfbab68c680a962fb9c3193b6fd2736b7db275")

    assert len(result["risk_flags"]) > 0
    assert "HIGH risk" in result["risk_flags"][0]
    assert result["hop_distance"] == 1
    assert result["confidence"] >= 90
    assert "Lazarus" in result["selected_vasp"]


def test_case_003_no_attribution():
    G = _make_graph([])
    result = rank_vasp_candidates(G, "0xf27eced4cde3b613ddbe5ea119969efe60151b20")

    assert result["selected_vasp"] == "No Confident Attribution"
    assert result["confidence"] == 0
    assert result["risk_flags"] == []
    assert result["path"] == []


def test_direct_match_seed_is_vasp():
    G = _make_graph([
        {"hash": "0x9", "from": "0xf977814e90da44bfa03b6295a0616a897441acec",
         "to": "0xsomeoneelse", "value": 1.0, "timestamp": "2026-09-01T00:00:00", "block": 9}
    ])
    result = rank_vasp_candidates(G, "0xf977814e90da44bfa03b6295a0616a897441acec")

    assert result["selected_vasp"] == "Binance"
    assert result["confidence"] == 100
    assert result["hop_distance"] == 0


def test_hop_distance_scoring_order():
    one_hop_txs = [
        {"hash": "0xa", "from": "0xseed10000000000000000000000000000000001",
         "to": "0xf977814e90da44bfa03b6295a0616a897441acec",
         "value": 1.0, "timestamp": "2026-09-01T00:00:00", "block": 1}
    ]
    two_hop_txs = [
        {"hash": "0xb", "from": "0xseed20000000000000000000000000000000002",
         "to": "0xmid0000000000000000000000000000000000000",
         "value": 1.0, "timestamp": "2026-09-01T00:00:00", "block": 1},
        {"hash": "0xc", "from": "0xmid0000000000000000000000000000000000000",
         "to": "0xf977814e90da44bfa03b6295a0616a897441acec",
         "value": 1.0, "timestamp": "2026-09-01T00:05:00", "block": 2},
    ]

    result_1hop = rank_vasp_candidates(_make_graph(one_hop_txs), "0xseed10000000000000000000000000000000001")
    result_2hop = rank_vasp_candidates(_make_graph(two_hop_txs), "0xseed20000000000000000000000000000000002")

    assert result_1hop["confidence"] > result_2hop["confidence"]

def test_unreachable_address_no_crash():
    G = _make_graph([
        {"hash": "0xd", "from": "0xaaa", "to": "0xbbb", "value": 1.0, "timestamp": "2026-09-01T00:00:00", "block": 1}
    ])
    result = rank_vasp_candidates(G, "0x0000000000000000000000000000000000dead")

    assert result["selected_vasp"] == "No Confident Attribution"
    assert result["risk_flags"] == []