export const mockTraceResponse = {
  success: true,
  case_id: 'CASE-002',
  attribution: {
    vasp_name: 'OFAC SDN: Lazarus Group (DPRK) - Ronin Bridge Exploiter',
    vasp_type: 'Sanctioned Entity',
    confidence: 95,
  },
  trace: {
    hops: 1,
    transactions_analyzed: 1,
    path_found: true,
  },
  evidence: [
    {
      type: 'Sanctions Match',
      description: 'Destination address 0x098b...2f96 is listed on the OFAC SDN Cyber-related Designations (04/14/2022).',
    },
    {
      type: 'Fund Flow',
      description: 'Direct 1-hop transfer of 12.75 ETH from target wallet to sanctioned address.',
    },
    {
      type: 'Risk Assessment',
      description: 'HIGH risk — immediate SAR filing recommended per FinCEN guidelines.',
    },
  ],
  risk_flags: ['OFAC Sanctioned Entity'],
  nodes: [
    { id: '0xc3bfbab68c680a962fb9c3193b6fd2736b7db275', label: 'Target Wallet', type: 'target', hop: 0, risk: 'LOW' },
    { id: '0x098b716b8aaf21512996dc57eb0615e2383e2f96', label: 'OFAC SDN: Lazarus Group (DPRK) - Ronin Bridge Exploiter', type: 'vasp', hop: 1, risk: 'HIGH' },
  ],
  edges: [
    {
      source: '0xc3bfbab68c680a962fb9c3193b6fd2736b7db275',
      target: '0x098b716b8aaf21512996dc57eb0615e2383e2f96',
      tx_hash: '0xb4c002aa33333333333333333333333333333333333333333333333333333333',
      value: 12.75,
      timestamp: '2026-09-02T03:40:00',
    },
  ],
  graph: {
    nodes: 2,
    edges: 1,
  },
}