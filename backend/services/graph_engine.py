import networkx as nx
from collections import deque


def build_transaction_graph(normalized_txs: list[dict]) -> nx.DiGraph:
    """Builds a directed transaction graph from B1's normalized tx objects."""
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


def _bfs_trace(G: nx.DiGraph, seed_address: str, max_hops: int = 3) -> dict:
    """Internal BFS helper — used by rank_vasp_candidates and by extract_subgraph_nodes_and_edges."""
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
            {"from": u, "to": v, "value": G[u][v]["value"],
             "hashes": G[u][v]["hashes"], "timestamp": G[u][v]["timestamp"]}
            for u, v in edges_used
        ],
        "paths": {n: get_path(n) for n in visited},
    }


def extract_subgraph_nodes_and_edges(G: nx.DiGraph, seed_address: str, max_hops: int = 3):
    """
    Returns (nodes, edges) restricted to the BFS-reached subgraph within max_hops.
    node: {"id", "label", "type", "hop", "risk"}
    edge: {"source", "target", "value", "tx_hash", "timestamp"}
    """
    from services.labels import get_address_label

    trace_result = _bfs_trace(G, seed_address, max_hops)
    seed_address = seed_address.lower()

    if not trace_result["reached"]:
        return (
            [{"id": seed_address, "label": "Target Wallet", "type": "target", "hop": 0, "risk": "NONE"}],
            [],
        )

    nodes = []
    for n in trace_result["nodes"]:
        addr = n["address"]
        if addr == seed_address:
            node_type, label, risk = "target", "Target Wallet", "NONE"
        else:
            info = get_address_label(addr)
            if info:
                node_type = "vasp"
                label = info["name"]
                risk = info.get("risk", "NONE")
            else:
                node_type = "intermediary"
                label = f"Unknown ({addr[:8]}...)"
                risk = "NONE"

        nodes.append({
            "id": addr,
            "label": label,
            "type": node_type,
            "hop": n["hop_distance"],
            "risk": risk,
        })

    edges = []
    for e in trace_result["edges"]:
        hashes = e.get("hashes", [])
        edges.append({
            "source": e["from"],
            "target": e["to"],
            "value": e["value"],
            "tx_hash": hashes[0] if hashes else "",
            "timestamp": str(e.get("timestamp", "")),
        })

    return nodes, edges


# Keep old names as aliases so nothing else breaks if anyone imported the old names
build_graph = build_transaction_graph
bfs_trace = _bfs_trace


if __name__ == "__main__":
    import sys, os
    sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
    from services.chain_adapter import fetch_transactions
    from services.normalizer import normalize_tx

    seed = "0x742d35cc6634c0532925a3b844bc454e4438f44e"
    raw_txs = fetch_transactions(seed, mode="demo")
    normalized_txs = [normalize_tx(tx) for tx in raw_txs]
    G = build_transaction_graph(normalized_txs)

    nodes, edges = extract_subgraph_nodes_and_edges(G, seed, max_hops=3)
    print("Nodes:", nodes)
    print("Edges:", edges)