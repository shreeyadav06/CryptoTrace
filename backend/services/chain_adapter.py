import json
import os
import urllib.request
import urllib.error
import time

def is_tron_address(address: str) -> bool:
    addr = str(address or "").strip()
    return addr.startswith("T") and len(addr) == 34

def fetch_transactions(address: str, mode: str) -> list[dict]:
    """
    mode="demo": load matching case from demo_cases.json, zero network calls.
    mode="live": call Etherscan API; on timeout/error/rate-limit, fall back to
                 cached local data WITHOUT raising — the caller must never see
                 an exception from a live-mode failure.
    Tron addresses are ALWAYS routed to demo/local data — Etherscan is Ethereum-only.
    Returns list of RAW tx dicts (pre-normalization), ready to pass to normalize_tx().
    """
    is_tron = is_tron_address(address)
    address_lower = address.lower()

    # Task 1.3: Tron always goes to demo — Etherscan cannot serve Tron data
    if mode == "demo" or is_tron:
        return _fetch_demo_transactions(address_lower)
    elif mode == "live":
        try:
            return _fetch_live_transactions(address_lower)
        except Exception:
            # Task 1.3: Fallback silently — caller must never see a live-mode crash
            return _fetch_demo_transactions(address_lower)
    
    return []

def _fetch_live_transactions(address: str) -> list[dict]:
    """Fetch from Etherscan, raising exceptions on failure so caller can fallback.
    Implements exponential backoff for rate limits."""
    api_key = os.environ.get("ETHERSCAN_API_KEY", "YourApiKeyToken")
    url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey={api_key}"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    max_retries = 3
    base_delay = 1.0
    
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            if data.get("status") == "1" and isinstance(data.get("result"), list):
                return data["result"]
            else:
                # Etherscan often returns status "0" for rate limit or no transactions
                message = str(data.get('message', '')).lower()
                result = data.get('result', '')
                if 'rate limit' in message or 'max rate limit' in str(result).lower():
                    if attempt < max_retries - 1:
                        time.sleep(base_delay * (2 ** attempt))
                        continue
                raise ValueError(f"Etherscan API error: {data.get('message')} - {result}")
        except urllib.error.URLError as e:
            if attempt < max_retries - 1:
                time.sleep(base_delay * (2 ** attempt))
                continue
            raise ValueError(f"Etherscan connection error: {str(e)}") from e
            
    raise ValueError("Max retries exceeded for Etherscan API")

def _fetch_demo_transactions(address: str) -> list[dict]:
    """
    Task 1.3 — Zero-Latency Offline Safety Net.
    Loads transactions from demo_cases.json with complete exception isolation.
    Performs case-insensitive address matching for both EVM (0x...) and Tron (T...) addresses.
    NEVER raises. Always returns a list (empty on any failure or no match).
    """
    try:
        # Use absolute path resolution — works regardless of CWD at invocation time
        current_dir = os.path.dirname(os.path.abspath(__file__))
        demo_file_path = os.path.normpath(os.path.join(current_dir, '..', 'data', 'demo_cases.json'))

        if not os.path.exists(demo_file_path):
            return []

        with open(demo_file_path, 'r', encoding='utf-8') as f:
            demo_cases = json.load(f)

        # Case-insensitive match: both EVM (lowercased by normalizer) and
        # Tron (stored as mixed-case in demo_cases.json) are handled via .lower()
        for case_data in demo_cases.values():
            target = str(case_data.get("target_address", "")).lower()
            if target == address:
                return list(case_data.get("transactions", []))

        return []
    except Exception:
        # Task 1.3 mandate: NEVER let any failure propagate to the caller
        return []
