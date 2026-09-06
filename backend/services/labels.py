import json
import os

_LABELS_CACHE = None

def _load_labels():
    global _LABELS_CACHE
    if _LABELS_CACHE is not None:
        return _LABELS_CACHE

    current_dir = os.path.dirname(os.path.abspath(__file__))
    labels_path = os.path.join(current_dir, "..", "data", "labels.json")
    if os.path.exists(labels_path):
        try:
            with open(labels_path, "r", encoding="utf-8") as f:
                _LABELS_CACHE = json.load(f)
                return _LABELS_CACHE
        except Exception:
            _LABELS_CACHE = {}
            return _LABELS_CACHE
    _LABELS_CACHE = {}
    return _LABELS_CACHE

def get_address_label(address: str) -> dict | None:
    """
    Query labels dataset for a given blockchain address.
    Returns dictionary with label metadata if found, else None.
    """
    if not address or not isinstance(address, str):
        return None
    labels = _load_labels()
    return labels.get(address.strip().lower())
