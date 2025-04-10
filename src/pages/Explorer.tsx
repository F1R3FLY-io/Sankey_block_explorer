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

  if (loading) return <div className="text-white py-8 px-20">Loading...</div>;
  if (!currentBlocks?.length) return <div className="text-white py-8 px-20">No data available</div>;

  return (
    <div className="information-container relative">
      <div className="absolute right-[90px] top-4 flex flex-col gap-6 w-[200px]">
        <div className="bg-neutral-900 rounded-xl p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] text-center h-[140px] flex flex-col justify-center">
          <span className="text-4xl font-medium text-white block mb-3 leading-none">
            {currentBlocks.length - 1}
          </span>
          <span className="text-sm text-neutral-400 mb-4">
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
            className="block text-sm text-blue-500 decoration-none bg-none border-none p-0 cursor-pointer w-full text-center hover:underline"
          >
            View all blocks →
          </button>
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] h-[140px] flex flex-col justify-center items-center">
          <span className="text-4xl font-medium text-white block mb-3 leading-none text-center">
            {/*
            TODO:
            this logic should be updated, when we will communicate with the MORK db and can easily get info
            about agents that performed at least one operation in the last hour
            */}
            {currentCategories.sources.length + currentCategories.sinks.length + currentCategories.sourceSinks.length - 1}
          </span>
          <span className="text-sm text-neutral-400 block text-center mb-2">
            Active agents
          </span>
          <span className="text-xs text-neutral-400 block text-center max-w-[180px]">
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