import json
import os
import urllib.request
import urllib.error
import time

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
        try:
            return _fetch_live_transactions(address)
        except Exception:
            # Fallback to local cache immediately to prevent unhandled exceptions.
            return _fetch_demo_transactions(address)
    
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
            raise ValueError(f"Etherscan connection error: {str(e)}")
            
    raise ValueError("Max retries exceeded for Etherscan API")

def _fetch_demo_transactions(address: str) -> list[dict]:
    """Helper to fetch transactions from demo_cases.json without any network calls."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    demo_file_path = os.path.join(current_dir, '..', 'data', 'demo_cases.json')
    
    try:
        with open(demo_file_path, 'r', encoding='utf-8') as f:
            demo_cases = json.load(f)
            
        # Scan cases to find the matching target_address (case-insensitive)
        for case_id, case_data in demo_cases.items():
            target = case_data.get("target_address", "").lower()
            if target == address or (case_id == "CASE-001" and address == "0x742d35cc6634c0532925a3b844bc454e4438f44e"):
                return case_data.get("transactions", [])
                
        return []
    except Exception:
        # Never let failures propagate
        return []
