import json
import os

_LABELS_CACHE = None

def _load_labels() -> dict:
    """
    Task 1.4 — Label Resolution Hardening.
    Loads labels.json with in-process caching for zero-latency repeat lookups.
    Cache is populated once per process startup. Returns empty dict on any file error.
    """
    global _LABELS_CACHE
    if _LABELS_CACHE is not None:
        return _LABELS_CACHE

    current_dir = os.path.dirname(os.path.abspath(__file__))
    labels_path = os.path.normpath(os.path.join(current_dir, "..", "data", "labels.json"))

    if not os.path.exists(labels_path):
        _LABELS_CACHE = {}
        return _LABELS_CACHE

    try:
        with open(labels_path, "r", encoding="utf-8") as f:
            _LABELS_CACHE = json.load(f)
    except Exception:
        _LABELS_CACHE = {}

    return _LABELS_CACHE


def get_address_label(address: str) -> dict | None:
    """
    Task 1.4 — Safe cross-chain label lookup.

    Lookup strategy:
    - Both EVM (0x...) and Tron (T...) addresses are stored as lowercase keys in labels.json
      because normalizer.py calls .lower() on all addresses before they reach this function.
    - We always lowercase the input before lookup, which handles both chains correctly.
    - Returns a dict with: label, name, category, type, entity_type
      or None if address is not in our label database.
    """
    if not address or not isinstance(address, str):
        return None
    labels = _load_labels()
    return labels.get(address.strip().lower())


def reload_labels() -> None:
    """
    Force-clears the label cache. Useful for testing or hot-reloading labels.json
    without restarting the Flask process.
    """
    global _LABELS_CACHE
    _LABELS_CACHE = None
