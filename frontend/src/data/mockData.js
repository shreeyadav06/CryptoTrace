export const mockTraceResponse = {
  success: true,
  attribution: {
    vasp_name: 'Example Exchange',
    vasp_type: 'Centralized Exchange',
    confidence: 87,
  },
  trace: {
    hops: 3,
    transactions_analyzed: 42,
    path_found: true,
  },
  evidence: [
    {
      type: 'Transaction Pattern',
      description: 'Repeated interaction with known VASP-related addresses.',
    },
    {
      type: 'Fund Flow',
      description: 'Funds converge toward a high-confidence exchange cluster.',
    },
    {
      type: 'Address Cluster',
      description: 'Wallet is closely connected to an identified VASP cluster.',
    },
  ],
  graph: {
    nodes: [
      { id: 'wallet1', label: 'Target Wallet', type: 'target', hop: 0 },
      { id: 'wallet2', label: 'Intermediary A', type: 'wallet', hop: 1 },
      { id: 'wallet3', label: 'Intermediary B', type: 'wallet', hop: 2 },
      { id: 'vasp1', label: 'Example Exchange', type: 'vasp', hop: 3 },
    ],
    edges: [
      { source: 'wallet1', target: 'wallet2' },
      { source: 'wallet2', target: 'wallet3' },
      { source: 'wallet3', target: 'vasp1' },
    ],
  },
}