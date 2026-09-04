import json
import os

def fetch_transactions(address: str, mode: str) -> list[dict]:
    """
    mode="demo": load matching case from demo_cases.json, zero network calls.
    mode="live": call Etherscan API; on timeout/error/rate-limit, fall back to
                 cached local data WITHOUT raising — the caller must never see
                 an exception from a live-mode failure.
    Returns list of RAW tx dicts (pre-normalization), ready to pass to normalize_tx().
    """
    address = address.lower()
    
    if mode == "demo":
        return _fetch_demo_transactions(address)
    elif mode == "live":
        # Skeleton for live mode (Day 1)
        # Will implement Etherscan integration on Day 2.
        # Fallback to local cache immediately to prevent unhandled exceptions.
        return _fetch_demo_transactions(address)
    
    return []

def _fetch_demo_transactions(address: str) -> list[dict]:
    """Helper to fetch transactions from demo_cases.json without any network calls."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    demo_file_path = os.path.join(current_dir, '..', 'data', 'demo_cases.json')
    
    try:
        with open(demo_file_path, 'r', encoding='utf-8') as f:
            demo_cases = json.load(f)
            
        # Scan cases to find the matching target_address
        for case_id, case_data in demo_cases.items():
            if case_data.get("target_address") == address:
                return case_data.get("transactions", [])
                
        return []
    except Exception:
        # Never let failures propagate
        return []
