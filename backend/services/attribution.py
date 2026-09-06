"""
B2 — Attribution + Risk Engine
CryptoTrace, PS-182

B3's route calls: rank_vasp_candidates(graph, address)
Must return: selected_vasp, confidence, hop_distance, path, evidence, risk_flags

Note: labels.py's get_address_label() returns a dict {"name","type","risk"} or None
      (not a plain string, despite what SKILL.md originally said).
"""

from services.graph_engine import _bfs_trace
from services.labels import get_address_label

HOP_WEIGHTS = {0: 100, 1: 90, 2: 75, 3: 60}
MIN_CONFIDENCE_THRESHOLD = 30
MAX_HOPS_DEFAULT = 3


def rank_vasp_candidates(G, address: str) -> dict:
    address = address.lower()
    trace_result = _bfs_trace(G, address, max_hops=MAX_HOPS_DEFAULT)

    risk_flags = []

    # Rule 1: direct match - is the seed wallet itself a known/labelled address?
    direct_info = get_address_label(address)
    if direct_info:
        if direct_info.get("risk") == "HIGH":
            risk_flags.append(f"{direct_info['name']} flagged HIGH risk")
        return {
            "selected_vasp": direct_info["name"],
            "confidence": 100,
            "hop_distance": 0,
            "path": [address],
            "evidence": [f"Target wallet is itself a directly labelled {direct_info['name']} address ({direct_info.get('type', 'Unknown type')})."],
            "risk_flags": risk_flags,
        }

    if not trace_result["reached"] or not trace_result["nodes"]:
        return _no_attribution("No transaction path found within hop limit.", risk_flags)

    # Rule 2/3: BFS candidates, collect labelled addresses + check risk along the way
    candidates = []
    for node in trace_result["nodes"]:
        if node["hop_distance"] == 0:
            continue
        info = get_address_label(node["address"])
        if info:
            candidates.append({"address": node["address"], "info": info, "hop": node["hop_distance"]})
            if info.get("risk") == "HIGH":
                flag = f"{info['name']} flagged HIGH risk"
                if flag not in risk_flags:
                    risk_flags.append(flag)

    if not candidates:
        return _no_attribution("No labelled VASP found within hop limit.", risk_flags)

    candidates.sort(key=lambda c: c["hop"])
    best = candidates[0]
    best_info = best["info"]

    path_count = sum(1 for e in trace_result["edges"] if e["to"] == best["address"])
    base_score = HOP_WEIGHTS.get(best["hop"], 50)
    path_bonus = min(path_count * 5, 15)
    confidence = min(base_score + path_bonus, 100)

    if confidence < MIN_CONFIDENCE_THRESHOLD:
        return _no_attribution("Attribution confidence below threshold.", risk_flags)

    path = trace_result["paths"].get(best["address"], [])
    evidence = [
        f"{best['hop']}-hop relationship to verified {best_info['name']} address ({best_info.get('type', 'Unknown type')})."
    ]
    if path_count > 1:
        evidence.append(f"{path_count} independent transaction paths support this connection.")

    return {
        "selected_vasp": best_info["name"],
        "confidence": confidence,
        "hop_distance": best["hop"],
        "path": path,
        "evidence": evidence,
        "risk_flags": risk_flags,
    }


def _no_attribution(reason: str, risk_flags: list) -> dict:
    return {
        "selected_vasp": "No Confident Attribution",
        "confidence": 0,
        "hop_distance": 0,
        "path": [],
        "evidence": [reason],
        "risk_flags": risk_flags,
    }