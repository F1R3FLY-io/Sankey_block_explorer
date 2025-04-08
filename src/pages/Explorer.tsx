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
  const state = location.state as { currentBlockIndex?: number, blocks?: BlockWithDeploys[], categories?: BlockCategories };
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(
    state?.currentBlockIndex || 0
  );

  //use data from state if exist
  const currentBlocks = state?.blocks || blocks;
  const currentCategories = state?.categories || categories;

  const handleNavigation = (direction: string) => {
    switch (direction) {
      case 'first':
        setCurrentBlockIndex(0);
        break;
      case 'prev':
        setCurrentBlockIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'next':
        setCurrentBlockIndex(prev => (prev < currentBlocks.length - 1 ? prev + 1 : prev));
        break;
      case 'last':
        setCurrentBlockIndex(currentBlocks.length - 1);
        break;
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '32px 90px' }}>Loading...</div>;
  if (!currentBlocks?.length) return <div style={{ color: 'white', padding: '32px 90px' }}>No data available</div>;

  return (
    <div className="information-container" style={{ position: 'relative' }}>
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
            {currentBlocks.length - 1}
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
                blocks: currentBlocks, 
                categories: currentCategories,
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
            {/*
            TODO:
            this logic should be updated, when we will communicate with the MORK db and can easily get info
            about agents that performed at least one operation in the last hour
            */}
            {currentCategories.sources.length + currentCategories.sinks.length + currentCategories.sourceSinks.length - 1}
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
        key={currentBlocks[currentBlockIndex].blockInfo.blockHash}
        block={currentBlocks[currentBlockIndex].blockInfo}
        deploys={currentBlocks[currentBlockIndex].deploys}
        currentBlock={currentBlockIndex}
        totalBlocks={currentBlocks.length}
        onNavigate={handleNavigation}
      />
    </div>
  );
} 