import os
import json
from services.labels import get_address_label


def _load_ofac_addresses() -> set:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    ofac_path = os.path.join(current_dir, "..", "data", "ofac.json")
    try:
        with open(ofac_path, "r", encoding="utf-8") as f:
            return set(a.lower() for a in json.load(f))
    except Exception:
        return set()


_OFAC_ADDRESSES = _load_ofac_addresses()


def check_risk_flags(graph) -> list[str]:
    """
    Scans graph nodes against ofac.json and labels.json for high-risk / sanctioned entities.
    Returns list of human-readable risk flags.
    """
    if graph is None:
        return []

    flags = []
    for node in graph.nodes:
        addr = str(node).strip().lower()
        info = get_address_label(addr)

        if addr in _OFAC_ADDRESSES:
            flag = "OFAC Sanctioned Entity"
            if flag not in flags:
                flags.append(flag)

        if info and (
            info.get("type") == "high_risk"
            or info.get("category") == "sanctioned"
            or info.get("risk") == "HIGH"
        ):
            label_name = info.get("label") or info.get("name") or "Sanctioned Entity"
            flag = f"{label_name} flagged HIGH risk"
            if flag not in flags:
                flags.append(flag)

    return flags
