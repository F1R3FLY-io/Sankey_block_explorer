import { Block, Deploy } from '../services/blockService';

export const mockDeploys: Deploy[] = [
  {
    deployer: 'deployer1',
    term: 'term1',
    timestamp: 1649086000000,
    sig: 'sig1',
    sigAlgorithm: 'Ed25519',
    phloPrice: 100,
    phloLimit: 1000,
    validAfterBlockNumber: 1,
    cost: 500,
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer1',
    term: 'term2',
    timestamp: 1649086100000,
    sig: 'sig2',
    sigAlgorithm: 'Ed25519',
    phloPrice: 120,
    phloLimit: 1200,
    validAfterBlockNumber: 1,
    cost: 600,
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer2',
    term: 'term3',
    timestamp: 1649086200000,
    sig: 'sig3',
    sigAlgorithm: 'Ed25519',
    phloPrice: 90,
    phloLimit: 900,
    validAfterBlockNumber: 1,
    cost: 450,
    errored: false,
    systemDeployError: ''
  }
];

export const mockDeploysWithPattern: Deploy[] = [
  {
    deployer: 'deployer1',
    term: 'match ("addr1", "addr2", 1000)',
    timestamp: 1649086000000,
    sig: 'sig1',
    sigAlgorithm: 'Ed25519',
    phloPrice: 100,
    phloLimit: 1000,
    validAfterBlockNumber: 1,
    cost: 500,
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer1',
    term: 'match ("addr1", "addr3", 1500)',
    timestamp: 1649086100000,
    sig: 'sig2',
    sigAlgorithm: 'Ed25519',
    phloPrice: 120,
    phloLimit: 1200,
    validAfterBlockNumber: 1,
    cost: 600,
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer2',
    term: 'match ("addr4", "addr2", 800)',
    timestamp: 1649086200000,
    sig: 'sig3',
    sigAlgorithm: 'Ed25519',
    phloPrice: 90,
    phloLimit: 900,
    validAfterBlockNumber: 1,
    cost: 450,
    errored: false,
    systemDeployError: ''
  }
];

// Mock deploys for internal Phlo consumption - Rholang code execution
export const mockDeploysWithInternalConsumption: Deploy[] = [
  {
    deployer: 'deployer1',
    term: 'new x in { x!(10) | for(y <- x) { y * 2 } }', // Rholang code that only consumes Phlo
    timestamp: 1649086000000,
    sig: 'sig4',
    sigAlgorithm: 'Ed25519',
    phloPrice: 100,
    phloLimit: 2000,
    validAfterBlockNumber: 650,
    cost: 1500, // Internal consumption (cost without external transfers)
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer2',
    term: 'for(@x <- @"registry") { @"output"!(x) }', // Rholang code that only reads registry
    timestamp: 1649086100000,
    sig: 'sig5',
    sigAlgorithm: 'Ed25519',
    phloPrice: 120,
    phloLimit: 1800,
    validAfterBlockNumber: 650,
    cost: 900, // Internal consumption
    errored: false,
    systemDeployError: ''
  }
];

// Mock deploys for a mix of internal consumption and transfers
export const mockDeploysWithMixedPatterns: Deploy[] = [
  {
    deployer: 'deployer1',
    term: 'new x in { x!(10) | for(y <- x) { y * 2 } }', // Internal Phlo consumption
    timestamp: 1649086000000,
    sig: 'sig6',
    sigAlgorithm: 'Ed25519',
    phloPrice: 100,
    phloLimit: 1500,
    validAfterBlockNumber: 651,
    cost: 800,
    errored: false,
    systemDeployError: ''
  },
  {
    deployer: 'deployer2',
    term: 'match ("addr1", "addr3", 1200)', // External transfer
    timestamp: 1649086100000,
    sig: 'sig7',
    sigAlgorithm: 'Ed25519',
    phloPrice: 120,
    phloLimit: 1200,
    validAfterBlockNumber: 651,
    cost: 600,
    errored: false,
    systemDeployError: ''
  }
];

export const mockBlock: Block = {
  blockHash: 'abcd1234',
  sender: 'sender1',
  seqNum: 1,
  sig: 'blockSig1',
  sigAlgorithm: 'Ed25519',
  shardId: 'shard1',
  extraBytes: '',
  version: 1,
  timestamp: 1649086000000,
  headerExtraBytes: '',
  parentsHashList: ['parent1', 'parent2'],
  blockNumber: 10,
  preStateHash: 'preState1',
  postStateHash: 'postState1',
  bodyExtraBytes: '',
  bonds: [
    { validator: 'validator1', stake: 100 },
    { validator: 'validator2', stake: 200 }
  ],
  blockSize: '1024',
  deployCount: 3,
  faultTolerance: 0.5,
  justifications: [
    { validator: 'validator1', latestBlockHash: 'latestHash1' },
    { validator: 'validator2', latestBlockHash: 'latestHash2' }
  ],
  rejectedDeploys: [],
  totalCost: 1550,
  totalPhlo: 3100
};

// Block #650 referenced in the spec - internal consumption only
export const mockBlock650: Block = {
  blockHash: 'hash650',
  sender: 'validator1',
  seqNum: 15,
  sig: 'blockSig650',
  sigAlgorithm: 'Ed25519',
  shardId: 'shard1',
  extraBytes: '',
  version: 1,
  timestamp: 1649086650000,
  headerExtraBytes: '',
  parentsHashList: ['parent3', 'parent4'],
  blockNumber: 650,
  preStateHash: 'preState650',
  postStateHash: 'postState650',
  bodyExtraBytes: '',
  bonds: [
    { validator: 'validator1', stake: 150 },
    { validator: 'validator3', stake: 300 }
  ],
  blockSize: '2048',
  deployCount: 2,
  faultTolerance: 0.7,
  justifications: [
    { validator: 'validator1', latestBlockHash: 'latestHash3' },
    { validator: 'validator3', latestBlockHash: 'latestHash4' }
  ],
  rejectedDeploys: [],
  totalCost: 2400, // Total internal Phlo consumption
  totalPhlo: 3800
};

// Block #651 referenced in the spec - mixed (internal consumption and transfer)
export const mockBlock651: Block = {
  blockHash: 'hash651',
  sender: 'validator3',
  seqNum: 10,
  sig: 'blockSig651',
  sigAlgorithm: 'Ed25519',
  shardId: 'shard1',
  extraBytes: '',
  version: 1,
  timestamp: 1649086700000,
  headerExtraBytes: '',
  parentsHashList: ['hash650'],
  blockNumber: 651,
  preStateHash: 'preState651',
  postStateHash: 'postState651',
  bodyExtraBytes: '',
  bonds: [
    { validator: 'validator1', stake: 150 },
    { validator: 'validator3', stake: 300 }
  ],
  blockSize: '1536',
  deployCount: 2,
  faultTolerance: 0.65,
  justifications: [
    { validator: 'validator1', latestBlockHash: 'hash650' },
    { validator: 'validator3', latestBlockHash: 'hash650' }
  ],
  rejectedDeploys: [],
  totalCost: 1400, // Combined internal and external
  totalPhlo: 2700
};

export const mockSankeyNodes = [
  { id: 'node1', name: 'Node 1', value: 100 },
  { id: 'node2', name: 'Node 2', value: 200 }
];

export const mockSankeyLinks = [
  { source: 'node1', target: 'node2', value: 100, details: 'Link details' }
];

export const mockSankeyOptions = {
  node: {
    fill: '#1890ff',
    stroke: '#1890ff',
    opacity: 0.8
  },
  link: {
    fill: '#1890ff',
    stroke: '#1890ff',
    opacity: 0.3
  }
};