import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BlockWithDeploys } from '../services/blockService';
import BlockCard from '../components/BlockCard.tsx';

interface BlockCategories {
  sources: BlockWithDeploys[];
  sinks: BlockWithDeploys[];
  sourceSinks: BlockWithDeploys[];
}

interface InfoProps {
  blocks: BlockWithDeploys[];
  categories: BlockCategories;
  loading: boolean;
}

export default function Explorer({ blocks, categories, loading }: InfoProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { currentBlockIndex?: number };
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(
    state?.currentBlockIndex || 0
  );

  const handleNavigation = (direction: string) => {
    switch (direction) {
      case 'first':
        setCurrentBlockIndex(0);
        break;
      case 'prev':
        setCurrentBlockIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'next':
        setCurrentBlockIndex(prev => (prev < blocks.length - 1 ? prev + 1 : prev));
        break;
      case 'last':
        setCurrentBlockIndex(blocks.length - 1);
        break;
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '32px 90px' }}>Loading...</div>;
  if (!blocks.length) return <div style={{ color: 'white', padding: '32px 90px' }}>No data available</div>;

  return (
    <div className="example-container" style={{ position: 'relative' }}>
      <div style={{ 
        position: 'absolute',
        right: '90px',
        top: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '200px'
      }}>
        <div style={{
          background: 'rgb(22, 30, 38)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ 
            fontSize: '36px', 
            fontWeight: '500', 
            color: 'white', 
            display: 'block', 
            marginBottom: '12px',
            lineHeight: '1'
          }}>
            {blocks.length}
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: 'rgb(157, 167, 177)',
            marginBottom: '16px'
          }}>
            Blocks
          </span>
          <button 
            onClick={() => navigate('/blocks', { 
              state: { 
                blocks, 
                categories,
                currentBlockIndex
              } 
            })}
            style={{
              display: 'block',
              fontSize: '14px',
              color: 'rgb(0, 122, 255)',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center'
            }}
          >
            View all blocks →
          </button>
        </div>

        <div style={{
          background: 'rgb(22, 30, 38)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '36px', 
            fontWeight: '500', 
            color: 'white', 
            display: 'block', 
            marginBottom: '12px',
            lineHeight: '1',
            textAlign: 'center'
          }}>
            {categories.sources.length + categories.sinks.length + categories.sourceSinks.length}
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: 'rgb(157, 167, 177)',
            display: 'block',
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            Active agents
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: 'rgb(157, 167, 177)',
            display: 'block',
            textAlign: 'center',
            maxWidth: '180px'
          }}>
            Agents that performed at least one operation in the last hour
          </span>
        </div>
      </div>

      <BlockCard
        key={blocks[currentBlockIndex].blockInfo.blockHash}
        block={blocks[currentBlockIndex].blockInfo}
        deploys={blocks[currentBlockIndex].deploys}
        currentBlock={currentBlockIndex + 1}
        totalBlocks={blocks.length}
        onNavigate={handleNavigation}
      />
    </div>
  );
} 