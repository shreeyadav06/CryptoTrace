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
    nodes: 8,
    edges: 11,
  },
}