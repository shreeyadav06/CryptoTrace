// Mock/offline-fallback responses for all 3 ground-truth cases.
// Used ONLY when the live backend is unreachable (see Dashboard.jsx catch block).
// Keys are lowercased target_address values from backend/data/demo_cases.json --
// keep these in sync if the ground truth ever changes.

export const mockTraceResponses = {
  '0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a': {
    success: true,
    case_id: 'CASE-001',
    attribution: {
      vasp_name: 'Binance',
      vasp_type: 'Verified VASP',
      confidence: 80,
    },
    trace: {
      hops: 2,
      transactions_analyzed: 2,
      path_found: true,
    },
    evidence: [
      {
        type: 'Trace signal 1',
        description: '2-hop relationship to verified Binance address (vasp).',
      },
    ],
    risk_flags: [],
    nodes: [
      { id: '0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a', label: 'Origin Wallet', type: 'target', hop: 0, risk: 'LOW' },
      { id: '0x765032347c528ec6769b8d4f1356e4aa48cde453', label: 'Intermediary', type: 'intermediary', hop: 1, risk: 'LOW' },
      { id: '0xf977814e90da44bfa03b6295a0616a897441acec', label: 'Binance: Hot Wallet 20', type: 'vasp', hop: 2, risk: 'LOW' },
    ],
    edges: [
      {
        source: '0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a',
        target: '0x765032347c528ec6769b8d4f1356e4aa48cde453',
        tx_hash: '0xb4c001aa11111111111111111111111111111111111111111111111111111111',
        value: 4.10,
        timestamp: '2026-09-01T09:12:00',
      },
      {
        source: '0x765032347c528ec6769b8d4f1356e4aa48cde453',
        target: '0xf977814e90da44bfa03b6295a0616a897441acec',
        tx_hash: '0xb4c001bb22222222222222222222222222222222222222222222222222222222',
        value: 4.06,
        timestamp: '2026-09-01T09:18:00',
      },
    ],
    graph: { nodes: 3, edges: 2 },
  },

  '0xc3bfbab68c680a962fb9c3193b6fd2736b7db275': {
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
    graph: { nodes: 2, edges: 1 },
  },

  '0xf27eced4cde3b613ddbe5ea119969efe60151b20': {
    success: true,
    case_id: 'CASE-003',
    attribution: {
      vasp_name: 'No Confident Attribution',
      vasp_type: 'Insufficient evidence',
      confidence: 0,
    },
    trace: {
      hops: 0,
      transactions_analyzed: 0,
      path_found: false,
    },
    evidence: [
      {
        type: 'Trace signal 1',
        description: 'No outgoing/incoming transactions connecting to a known VASP within 3 hops.',
      },
    ],
    risk_flags: [],
    nodes: [
      { id: '0xf27eced4cde3b613ddbe5ea119969efe60151b20', label: 'Origin Wallet', type: 'target', hop: 0, risk: 'LOW' },
    ],
    edges: [],
    graph: { nodes: 1, edges: 0 },
  },
}

// Fallback-of-last-resort if the traced address doesn't match ANY known case
// (still needs to say "No Confident Attribution", never fabricate a VASP).
export const mockTraceResponseUnknown = {
  success: true,
  case_id: null,
  attribution: {
    vasp_name: 'No Confident Attribution',
    vasp_type: 'Insufficient evidence',
    confidence: 0,
  },
  trace: { hops: 0, transactions_analyzed: 0, path_found: false },
  evidence: [],
  risk_flags: [],
  nodes: [],
  edges: [],
  graph: { nodes: 0, edges: 0 },
}

// Backward-compat named export (some components may still import this directly)
export const mockTraceResponse = mockTraceResponses['0xc3bfbab68c680a962fb9c3193b6fd2736b7db275']