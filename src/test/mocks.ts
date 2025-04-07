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