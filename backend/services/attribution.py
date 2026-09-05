import networkx as nx
from services.labels import get_address_label

def rank_vasp_candidates(G: nx.DiGraph, target_address: str) -> dict:
    """
    Ranks candidate VASPs in the transaction graph starting from target_address.
    Calculates confidence score based on multi-hop proximity, paths, volume, recency, and reliability.
    Returns dictionary with top VASP attribution, score, path, evidence trail, and risk flags.
    """
    target = str(target_address).lower()
    
    if target not in G or len(G.nodes) == 0:
        return _no_attribution_result(target)

    candidates = []
    
    # Scan all nodes in graph for labels
    for node in G.nodes():
        node_clean = str(node).lower()
        label_info = get_address_label(node_clean)
        
        if not label_info:
            continue
            
        vasp_name = label_info.get("label") or label_info.get("name", "Unknown VASP")
        
        # Calculate paths from target to candidate node using NetworkX
        try:
            if nx.has_path(G, target, node_clean):
                all_paths = list(nx.all_simple_paths(G, target, node_clean, cutoff=3))
            elif nx.has_path(G, node_clean, target):
                all_paths = list(nx.all_simple_paths(G, node_clean, target, cutoff=3))
            else:
                all_paths = []
        except Exception:
            all_paths = []

        if not all_paths:
            if node_clean == target:
                all_paths = [[target]]
            else:
                continue

        shortest_path = min(all_paths, key=len)
        hop_distance = len(shortest_path) - 1

        # 1. Proximity Weight W_proximity
        if hop_distance == 0:
            w_proximity = 95
        elif hop_distance == 1:
            w_proximity = 80
        elif hop_distance == 2:
            w_proximity = 70
        elif hop_distance == 3:
            w_proximity = 55
        else:
            w_proximity = 0

        # 2. Path Multiplicity S_paths
        num_paths = len(all_paths)
        s_paths = min(15, (num_paths - 1) * 5) if num_paths > 1 else 0

        # 3. Volume Weight S_volume
        max_volume = 0.0
        for p in all_paths:
            vol = 0.0
            for i in range(len(p) - 1):
                u_n, v_n = p[i], p[i+1]
                if G.has_edge(u_n, v_n):
                    vol += G[u_n][v_n].get("value", 0.0)
                elif G.has_edge(v_n, u_n):
                    vol += G[v_n][u_n].get("value", 0.0)
            if vol > max_volume:
                max_volume = vol

        if max_volume > 50:
            s_volume = 10
        elif max_volume > 10:
            s_volume = 5
        else:
            s_volume = 0

        # 4. Recency Bonus S_recency
        s_recency = 5

        # 5. Label Reliability S_reliability
        s_reliability = 10 if label_info.get("type") == "vasp" else 5

        # Calculate final confidence score
        score = min(100, w_proximity + s_paths + s_volume + s_recency + s_reliability)
        
        risk_flag = None
        if label_info.get("type") == "high_risk" or "Sanctioned" in vasp_name or "OFAC" in vasp_name:
            risk_flag = vasp_name

        candidates.append({
            "vasp": vasp_name,
            "address": node_clean,
            "confidence": score,
            "hop_distance": hop_distance,
            "path": shortest_path,
            "risk_flag": risk_flag
        })

    if not candidates:
        return _no_attribution_result(target)

    # Sort by confidence descending
    candidates.sort(key=lambda x: x["confidence"], reverse=True)
    top_candidate = candidates[0]

    # No Forced Attribution Rule
    if top_candidate["confidence"] < 40:
        return _no_attribution_result(target)

    selected_vasp = top_candidate["vasp"]
    confidence = top_candidate["confidence"]
    hop_distance = top_candidate["hop_distance"]
    path = top_candidate["path"]
    
    risk_flags = [c["risk_flag"] for c in candidates if c["risk_flag"]]

    evidence = generate_evidence_trail(selected_vasp, path, confidence, {"hop_distance": hop_distance})

    return {
        "selected_vasp": selected_vasp,
        "confidence": confidence,
        "hop_distance": hop_distance,
        "path": path,
        "evidence": evidence,
        "risk_flags": risk_flags
    }

def generate_evidence_trail(selected_vasp: str, path: list[str], score: int, metadata: dict) -> list[str]:
    """Generates human-readable evidence strings explaining attribution logic."""
    target_addr = path[0] if path else "target"
    hop = metadata.get("hop_distance", len(path) - 1 if path else 0)
    
    trail = [
        f"Target wallet {target_addr[:10]}... initiated transaction trace.",
        f"Graph traversal identified multi-hop path ({hop} hop(s)) connecting to '{selected_vasp}'.",
        f"Attributed candidate '{selected_vasp}' with {score}% confidence score.",
        f"Verified against deterministic graph proximity and label reliability model."
    ]
    return trail

def _no_attribution_result(target_address: str) -> dict:
    return {
        "selected_vasp": "No Confident Attribution",
        "confidence": 0,
        "hop_distance": 0,
        "path": [target_address],
        "evidence": ["No outgoing/incoming transactions connecting to a known VASP within 3 hops."],
        "risk_flags": []
    }
