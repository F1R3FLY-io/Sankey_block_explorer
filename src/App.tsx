import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Explorer from './pages/Explorer.tsx';
import BlocksList from './pages/BlocksList';
import logo from './assets/Copernicus.png';
import { BlockWithDeploys, analyzeBlockChain, getBlockByHash } from './services/blockService';

interface BlockCategories {
  sources: BlockWithDeploys[];
  sinks: BlockWithDeploys[];
  sourceSinks: BlockWithDeploys[];
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    if (!blocksData.blocks.length) {
      fetchData();
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div className="logo-section">
              <img src={logo} alt="MeTTaCycle Logo" className="logo" />
              <h1>MeTTaCycle Block Explorer</h1>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button 
                className="refresh-button" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh data'}
              </button>
            </div>
          </div>
        </header>
        <main>
          {error && <div style={{ color: 'white', padding: '32px 90px' }}>Error: {error}</div>}
          <Routes>
            <Route 
              path="/" 
              element={
                <Explorer
                  blocks={blocksData.blocks}
                  categories={blocksData.categories}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/blocks" 
              element={
                <BlocksList 
                  blocks={blocksData.blocks} 
                  categories={blocksData.categories}
                  loading={loading}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;