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

// These simplified type definitions are kept for reference.
// Service implementations should use the more detailed types from blockService.ts
// to ensure compatibility with API responses.

// Legacy/reference types - Don't use these directly
type LegacyBlock = {
  id: string;
  height: number;
  size: number;
  timestamp: number;
  transactions: number;
};

type LegacyTransaction = {
  id: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  blockId: string;
};

type LegacyDeploy = {
  deployHash: string;
  account: string;
  timestamp: string;
  cost: number;
  status: string;
  blockHeight: number;
  blockHash: string;
};

// React Router type augmentation
declare module 'react-router' {
  interface FutureConfig {
    v7_startTransition: boolean;
    v7_relativeSplatPath: boolean;
  }
}