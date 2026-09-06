import networkx as nx
from collections import deque


def build_graph(normalized_txs: list[dict]) -> nx.DiGraph:
    """
    Build a directed transaction graph from B1's normalized tx objects.
    Parallel transactions between the same pair are merged into one edge
    with aggregated value; individual tx hashes are kept for the evidence trail.
    """
    G = nx.DiGraph()

    for tx in normalized_txs:
        src, dst = tx["from"], tx["to"]
        G.add_node(src)
        G.add_node(dst)

        if G.has_edge(src, dst):
            G[src][dst]["value"] += tx["value"]
            G[src][dst]["hashes"].append(tx["hash"])
            G[src][dst]["count"] += 1
        else:
            G.add_edge(
                src, dst,
                value=tx["value"],
                hashes=[tx["hash"]],
                timestamp=tx["timestamp"],
                count=1,
            )

    return G


def bfs_trace(G: nx.DiGraph, seed_address: str, max_hops: int = 3) -> dict:
    """
    BFS outward from seed_address, capped at max_hops.
    Returns every node reached, its hop distance, and the path to reach it.
    """
    seed_address = seed_address.lower()

    if seed_address not in G:
        return {"seed": seed_address, "reached": False, "nodes": [], "edges": [], "paths": {}}

    visited = {seed_address: 0}
    parent = {seed_address: None}
    queue = deque([seed_address])
    edges_used = []

    while queue:
        current = queue.popleft()
        hop = visited[current]
        if hop >= max_hops:
            continue

        for neighbor in G.successors(current):
            if neighbor not in visited:
                visited[neighbor] = hop + 1
                parent[neighbor] = current
                queue.append(neighbor)
                edges_used.append((current, neighbor))

    def get_path(node):
        path = []
        while node is not None:
            path.append(node)
            node = parent[node]
        return list(reversed(path))

    return {
        "seed": seed_address,
        "reached": True,
        "nodes": [{"address": n, "hop_distance": visited[n]} for n in visited],
        "edges": [
            {"from": u, "to": v, "value": G[u][v]["value"], "hashes": G[u][v]["hashes"]}
            for u, v in edges_used
        ],
        "paths": {n: get_path(n) for n in visited},
    }


def get_path_to(trace_result: dict, target_address: str) -> list[str] | None:
    return trace_result["paths"].get(target_address.lower())


def extract_subgraph_nodes_and_edges(G: nx.DiGraph, seed_address: str = None, max_hops: int = 3) -> tuple[list[dict], list[dict]]:
    """
    Extracts serializable node and edge lists from NetworkX DiGraph for API & D3 rendering.
    """
    from services.labels import get_address_label

    nodes = []
    edges = []
    
    # Calculate hop distances if seed_address provided
    hop_distances = {}
    if seed_address and seed_address.lower() in G:
        bfs_res = bfs_trace(G, seed_address.lower(), max_hops=max_hops)
        for n_item in bfs_res.get("nodes", []):
            hop_distances[n_item["address"]] = n_item["hop_distance"]

    for node in G.nodes():
        node_clean = str(node).lower()
        label_info = get_address_label(node_clean)
        
        hop = hop_distances.get(node_clean, 0 if node_clean == (seed_address or "").lower() else 1)
        
        if label_info:
            label_name = label_info.get("name") or label_info.get("label", node_clean[:8])
            node_type = label_info.get("type", "vasp")
            risk = "HIGH" if node_type == "high_risk" else "LOW"
        elif seed_address and node_clean == seed_address.lower():
            label_name = "Target Wallet"
            node_type = "target"
            risk = "LOW"
        else:
            label_name = f"Wallet ({node_clean[:6]}...)"
            node_type = "unknown"
            risk = "LOW"

        nodes.append({
            "id": node_clean,
            "label": label_name,
            "type": node_type,
            "hop": hop,
            "risk": risk
        })

    for u, v, data in G.edges(data=True):
        hashes = data.get("hashes", [])
        tx_hash = hashes[0] if hashes else ""
        edges.append({
            "source": str(u).lower(),
            "target": str(v).lower(),
            "value": float(data.get("value", 0.0)),
            "tx_hash": tx_hash,
            "timestamp": str(data.get("timestamp", ""))
        })

    return nodes, edges


# Alias for backwards/forwards API compatibility
build_transaction_graph = build_graph


# Integration test against B1's REAL pipeline 
if __name__ == "__main__":
    import sys
    sys.path.append("..")

    from chain_adapter import fetch_transactions
    from normalizer import normalize_tx

    seed = "0x742d35cc6634c0532925a3b844bc454e4438f44e"  # CASE-001 target

    raw_txs = fetch_transactions(seed, mode="demo")
    print(f"Raw txs from B1's chain_adapter: {len(raw_txs)}")

    normalized_txs = [normalize_tx(tx) for tx in raw_txs]
    print(f"Normalized txs: {normalized_txs}")

    G = build_graph(normalized_txs)
    print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    result = bfs_trace(G, seed, max_hops=3)
    print("\nNodes reached:")
    for node in result["nodes"]:
        print(f"  {node['address']}  (hop {node['hop_distance']})")

    binance_addr = "0x28c6c06298d514db089934071355e5743bf21d60"
    print("\nPath to expected Binance address:")
    print(get_path_to(result, binance_addr))

    # Sanity check: address not in the graph should NOT crash, just return reached: False
    print("\n--- No-path sanity check ---")
    no_path_result = bfs_trace(G, "0x0000000000000000000000000000000000dead", max_hops=3)
    print(no_path_result)