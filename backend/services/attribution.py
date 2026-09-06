"""
B2 — Attribution + Risk Engine
CryptoTrace, PS-182

B3's route calls: rank_vasp_candidates(graph, address)
Must return: selected_vasp, confidence, hop_distance, path, evidence, risk_flags

labels.json schema (current): {"label", "name", "category", "type"}
High-risk entries use "type": "high_risk" or "category": "sanctioned" — NOT a "risk" field.
ofac.json is a flat address list, kept as a secondary safety net.
"""

import json
import os
from services.graph_engine import _bfs_trace
from services.labels import get_address_label

HOP_WEIGHTS = {0: 100, 1: 90, 2: 75, 3: 60}
MIN_CONFIDENCE_THRESHOLD = 30
MAX_HOPS_DEFAULT = 3


def _load_ofac_list() -> set:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    ofac_path = os.path.join(current_dir, "..", "data", "ofac.json")
    try:
        with open(ofac_path, "r", encoding="utf-8") as f:
            return set(a.lower() for a in json.load(f))
    except Exception:
        return set()


_OFAC_ADDRESSES = _load_ofac_list()


def _is_high_risk(info: dict, address: str) -> bool:
    if info and (info.get("type") == "high_risk" or info.get("category") == "sanctioned"):
        return True
    return address.lower() in _OFAC_ADDRESSES


def _display_name(info: dict) -> str:
    return info.get("label") or info.get("name") or "Unknown Entity"


def rank_vasp_candidates(G, address: str) -> dict:
    address = address.lower()
    trace_result = _bfs_trace(G, address, max_hops=MAX_HOPS_DEFAULT)

    risk_flags = []

    # Rule 1: direct match
    direct_info = get_address_label(address)
    if direct_info:
        if _is_high_risk(direct_info, address):
            risk_flags.append(f"{_display_name(direct_info)} flagged HIGH risk")
        return {
            "selected_vasp": _display_name(direct_info),
            "confidence": 100,
            "hop_distance": 0,
            "path": [address],
            "evidence": [f"Target wallet is itself a directly labelled {_display_name(direct_info)} address ({direct_info.get('type', 'Unknown type')})."],
            "risk_flags": risk_flags,
        }

    if address in _OFAC_ADDRESSES:
        risk_flags.append("OFAC Sanctioned Entity")
        return {
            "selected_vasp": "OFAC Sanctioned Address (Direct Match)",
            "confidence": 90,
            "hop_distance": 0,
            "path": [address],
            "evidence": ["Target wallet address is directly listed on the OFAC SDN sanctions list."],
            "risk_flags": risk_flags,
        }

    if not trace_result["reached"] or not trace_result["nodes"]:
        return _no_attribution("No transaction path found within hop limit.", risk_flags)

    candidates = []
    ofac_only_hit = None
    for node in trace_result["nodes"]:
        if node["hop_distance"] == 0:
            continue

        addr = node["address"]
        info = get_address_label(addr)

        if _is_high_risk(info, addr):
            flag = f"{_display_name(info)} flagged HIGH risk" if info else "OFAC Sanctioned Entity"
            if flag not in risk_flags:
                risk_flags.append(flag)

        if info:
            candidates.append({"address": addr, "info": info, "hop": node["hop_distance"]})
        elif addr in _OFAC_ADDRESSES and ofac_only_hit is None:
            ofac_only_hit = node

    if not candidates and ofac_only_hit:
        path = trace_result["paths"].get(ofac_only_hit["address"], [])
        base_score = HOP_WEIGHTS.get(ofac_only_hit["hop_distance"], 50)
        return {
            "selected_vasp": "OFAC Sanctioned Entity (Unlabelled)",
            "confidence": base_score,
            "hop_distance": ofac_only_hit["hop_distance"],
            "path": path,
            "evidence": [f"{ofac_only_hit['hop_distance']}-hop relationship to an OFAC SDN-listed address."],
            "risk_flags": risk_flags,
        }

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
        f"{best['hop']}-hop relationship to verified {_display_name(best_info)} address ({best_info.get('type', 'Unknown type')})."
    ]
    if path_count > 1:
        evidence.append(f"{path_count} independent transaction paths support this connection.")

    return {
        "selected_vasp": _display_name(best_info),
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