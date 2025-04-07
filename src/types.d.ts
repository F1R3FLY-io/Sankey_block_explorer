declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

export type Block = {
  id: string;
  height: number;
  size: number;
  timestamp: number;
  transactions: number;
};

export type Transaction = {
  id: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  blockId: string;
};

export type Deploy = {
  deployHash: string;
  account: string;
  timestamp: string;
  cost: number;
  status: string;
  blockHeight: number;
  blockHash: string;
};

export type SankeyNode = {
  id: string;
  name: string;
  type: 'block' | 'address';
  value: number;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

// React Router type augmentation
declare module 'react-router' {
  interface FutureConfig {
    v7_startTransition: boolean;
    v7_relativeSplatPath: boolean;
  }
}