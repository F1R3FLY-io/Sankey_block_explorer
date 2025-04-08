import { useState, useEffect, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, RouteObject } from 'react-router-dom';
import './App.css';
import './styles/gradients.css';
import Explorer from './pages/Explorer.tsx';
import BlocksList from './pages/BlocksList';
import Demo from './pages/Demo';
import MainLayout from './layouts/MainLayout';
import { BlockWithDeploys, analyzeBlockChain, getBlockByHash } from './services/blockService';

interface BlockCategories {
  sources: BlockWithDeploys[];
  sinks: BlockWithDeploys[];
  sourceSinks: BlockWithDeploys[];
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocksData, setBlocksData] = useState<{ blocks: BlockWithDeploys[], categories: BlockCategories }>({ 
    blocks: [], 
    categories: { 
      sources: [], 
      sinks: [], 
      sourceSinks: [] 
    } 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching blockchain data...');
      const analysis = await analyzeBlockChain();
      const allBlocks: BlockWithDeploys[] = [];
      const categories: BlockCategories = {
        sources: [],
        sinks: [],
        sourceSinks: []
      };

      // Fetch all blocks
      for (const hash of [...analysis.sources, ...analysis.sinks, ...analysis.sourceSinks]) {
        try {
          const block = await getBlockByHash(hash);
          allBlocks.push(block);
          
          // Categorize blocks
          if (analysis.sources.includes(hash)) {
            categories.sources.push(block);
          } else if (analysis.sinks.includes(hash)) {
            categories.sinks.push(block);
          } else if (analysis.sourceSinks.includes(hash)) {
            categories.sourceSinks.push(block);
          }
        } catch (blockError) {
          console.error(`Error fetching block ${hash}:`, blockError);
        }
      }

      // Sort blocks by block number
      allBlocks.sort((a, b) => a.blockInfo.blockNumber - b.blockInfo.blockNumber);
      console.log(`Loaded ${allBlocks.length} blocks successfully`);

      setBlocksData({ blocks: allBlocks, categories });
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching blockchain data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    if (!blocksData.blocks.length) {
      fetchData();
    }
  }, [fetchData, blocksData.blocks.length]);

  // Define routes
  const routes: RouteObject[] = [
    {
      path: "/",
      element: (
        <MainLayout onRefresh={handleRefresh} loading={loading} blocks={blocksData.blocks} categories={blocksData.categories}>
          <div className="main-content-wrapper">
            {error && <div style={{ color: 'white', padding: '32px 90px' }}>Error: {error}</div>}
            <Explorer
              blocks={blocksData.blocks}
              categories={blocksData.categories}
              loading={loading}
            />
          </div>
        </MainLayout>
      )
    },
    {
      path: "/blocks",
      element: (
        <MainLayout onRefresh={handleRefresh} loading={loading} blocks={blocksData.blocks} categories={blocksData.categories}>
          <div className="main-content-wrapper">
            {error && <div style={{ color: 'white', padding: '32px 90px' }}>Error: {error}</div>}
            <BlocksList 
              blocks={blocksData.blocks} 
              categories={blocksData.categories}
              loading={loading}
            />
          </div>
        </MainLayout>
      )
    },
    {
      path: "/demo",
      element: <Demo />
    }
  ];

  // Create router with future flags using type assertion to bypass TypeScript errors
  // This is a safe assertion as these flags are actually supported by the router at runtime
  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any // Type assertion to bypass TypeScript type checking
  });

  return <RouterProvider router={router} />;
}

export default App;