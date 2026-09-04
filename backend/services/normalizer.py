from datetime import datetime

def normalize_tx(raw_tx: dict) -> dict:
    """
    Normalizes a raw transaction dictionary.
    Returns: {"hash": str, "from": str, "to": str, "value": float, "timestamp": str (ISO 8601), "block": int}
    
    Pure function: deterministic, no I/O, no side effects.
    """
    # Extract value, handling both Etherscan format (string in Wei) and standard float formats
    value = raw_tx.get("value", 0.0)
    if isinstance(value, str) and value.isdigit():
        value = float(value) / 1e18
    else:
        try:
            value = float(value)
        except ValueError:
            value = 0.0
            
    # Extract timestamp and format to ISO 8601
    raw_time = raw_tx.get("timestamp") or raw_tx.get("timeStamp", "")
    timestamp_iso = str(raw_time)
    if isinstance(raw_time, str) and raw_time.isdigit():
        timestamp_iso = datetime.utcfromtimestamp(int(raw_time)).isoformat()
    elif isinstance(raw_time, int):
        timestamp_iso = datetime.utcfromtimestamp(raw_time).isoformat()
        
    # Extract block
    block = raw_tx.get("block") or raw_tx.get("blockNumber", 0)
    
    return {
        "hash": str(raw_tx.get("hash", "")).lower(),
        "from": str(raw_tx.get("from", "")).lower(),
        "to": str(raw_tx.get("to", "")).lower(),
        "value": value,
        "timestamp": timestamp_iso,
        "block": int(block)
    }
