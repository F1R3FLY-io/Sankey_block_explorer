import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  const [blocksData, setBlocksData] = useState<{ blocks: BlockWithDeploys[], categories: BlockCategories }>({ 
    blocks: [], 
    categories: { 
      sources: [], 
      sinks: [], 
      sourceSinks: [] 
    } 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
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

      setBlocksData({ blocks: allBlocks, categories });
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!blocksData.blocks.length) {
      fetchData();
    }
  }, [blocksData.blocks.length]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout>
              <div className="main-content-wrapper">
                <Explorer
                  blocks={blocksData.blocks}
                  categories={blocksData.categories}
                  loading={loading}
                />
              </div>
            </MainLayout>
          } 
        />
        <Route 
          path="/blocks" 
          element={
            <MainLayout>
              <div className="main-content-wrapper">
                <BlocksList 
                  blocks={blocksData.blocks} 
                  categories={blocksData.categories}
                  loading={loading}
                />
              </div>
            </MainLayout>
          } 
        />
        <Route 
          path="/demo" 
          element={<Demo />} 
        />
      </Routes>
    </Router>
  );
}

export default App;