from datetime import datetime


def detect_laundering_typologies(transactions: list[dict], path: list[str], nodes: list[dict]) -> list[str]:
    """
    1. Peeling Chain: monotonically decreasing values across >= 2 hops.
    2. Mixer Obfuscation: any node tagged entity_type == 'mixer' (or label mentions a known mixer).
    3. Rapid Pass-Through: inter-hop time delta < 900 seconds (15 minutes).
    """
    typologies = []

    if not transactions or len(transactions) < 2:
        for n in (nodes or []):
            if _is_mixer_node(n):
                typologies.append("Mixer Obfuscation")
                break
        return typologies

    # 1. Peeling Chain
    values = [float(tx.get("value", 0.0)) for tx in transactions if float(tx.get("value", 0.0)) > 0]
    if len(values) >= 2:
        is_peeling = all(
            values[i] > values[i + 1] and (values[i] - values[i + 1]) / values[i] < 0.25
            for i in range(len(values) - 1)
        )
        if is_peeling:
            typologies.append("Peeling Chain")

    # 2. Mixer Obfuscation
    for n in (nodes or []):
        if _is_mixer_node(n) and "Mixer Obfuscation" not in typologies:
            typologies.append("Mixer Obfuscation")

    # 3. Rapid Pass-Through
    timestamps = []
    for tx in transactions:
        ts_str = tx.get("timestamp", "")
        try:
            dt = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
            timestamps.append(dt.timestamp())
        except Exception:
            pass
    if len(timestamps) >= 2:
        deltas = [abs(timestamps[i + 1] - timestamps[i]) for i in range(len(timestamps) - 1)]
        if any(d <= 900 for d in deltas):
            typologies.append("Rapid Pass-Through")

    return typologies


def _is_mixer_node(node: dict) -> bool:
    entity_type = str(node.get("entity_type", "")).lower()
    label = str(node.get("label", "")).lower()
    return entity_type == "mixer" or "mixer" in label or "tornado" in label


if __name__ == "__main__":
    # Self-contained test — no dependency on demo_cases.json or B4's branch
    test_txs = [
        {"from": "0xaaa", "to": "0xbbb", "value": 50000.0, "timestamp": "2026-09-08T10:00:00"},
        {"from": "0xbbb", "to": "0xccc", "value": 49950.0, "timestamp": "2026-09-08T10:07:00"},
    ]
    test_nodes = [{"label": "Intermediary", "entity_type": "unknown"}]
    result = detect_laundering_typologies(test_txs, [], test_nodes)
    assert "Peeling Chain" in result, f"Expected Peeling Chain, got {result}"
    assert "Rapid Pass-Through" in result, f"Expected Rapid Pass-Through, got {result}"
    print("ALL SELF-TESTS PASSED:", result)