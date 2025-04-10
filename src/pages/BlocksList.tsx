import React, { useState } from 'react';
import {useNavigate, useLocation } from 'react-router-dom';
import { BlockWithDeploys } from '../services/blockService';

interface BlockCategories {
  sources: BlockWithDeploys[];
  sinks: BlockWithDeploys[];
  sourceSinks: BlockWithDeploys[];
}

interface BlocksListProps {
  blocks: BlockWithDeploys[];
  categories: BlockCategories;
  loading: boolean;
}

const BlocksList: React.FC<BlocksListProps> = ({ 
  blocks: propsBlocks, 
  categories: propsCategories,
  loading
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    currentBlockIndex?: number, 
    blocks?: BlockWithDeploys[], 
    categories?: BlockCategories 
  };
  
  const [currentPage, setCurrentPage] = useState(1);

  //use data from state if exist
  const blocks = state?.blocks || propsBlocks;
  const categories = state?.categories || propsCategories;

  const itemsPerPage = 10;
  const totalPages = Math.ceil(blocks.length / itemsPerPage);

  const getCurrentPageBlocks = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return blocks.slice(start, end);
  };

  const getBlockType = (block: BlockWithDeploys) => {
    if (categories.sources.find(b => b.blockInfo.blockHash === block.blockInfo.blockHash)) return 'Source';
    if (categories.sinks.find(b => b.blockInfo.blockHash === block.blockInfo.blockHash)) return 'Sink';
    if (categories.sourceSinks.find(b => b.blockInfo.blockHash === block.blockInfo.blockHash)) return 'Source-Sink';
    return '';
  };

  const calculateTotalCost = (block: BlockWithDeploys) => {
    return block.deploys.reduce((total, deploy) => {
      return total + (deploy.cost || 0);
    }, 0);
  };

  const calculateTotalPhlo = (block: BlockWithDeploys) => {
    return block.deploys.reduce((total, deploy) => {
      return total + (deploy.phloLimit || 0);
    }, 0);
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'Source': return '#52c41a';
      case 'Sink': return '#f5222d';
      case 'Source-Sink': return '#1890ff';
      default: return 'white';
    }
  };

  const handleBackToExplorer = () => {
    navigate('/', { 
      state: { 
        currentBlockIndex: state?.currentBlockIndex || 0,
        blocks,
        categories
      } 
    });
  };

  if (loading) return <div className="text-white py-8 px-20">Loading...</div>;
  if (!blocks.length) return <div className="text-white py-8 px-20">No data available</div>;

  return (
    <div className="py-8 pl-[90px] text-white flex flex-col min-h-full w-full">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBackToExplorer}
          className="text-neutral-400 decoration-none flex items-center gap-2 text-sm bg-none border-none p-0 cursor-pointer hover:text-blue-400"
        >
          ← Back to Explorer
        </button>
      </div>

      <h1 className="text-2xl font-normal mb-8 text-left">
        Blocks list
      </h1>

      <div className="bg-neutral-900 rounded-xl w-[calc(100%-310px)] overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="p-4 text-neutral-400 text-left w-[8%]">Block #</th>
              <th className="p-4 text-neutral-400 text-left w-[12%]">Type</th>
              <th className="p-4 text-neutral-400 text-left w-[10%]">Deploys</th>
              <th className="p-4 text-neutral-400 text-left w-[12%]">Total cost</th>
              <th className="p-4 text-neutral-400 text-left w-[12%]">Total Phlo</th>
              <th className="p-4 text-neutral-400 text-left w-[46%]">Address</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageBlocks().map((block, index) => {
              const blockType = getBlockType(block);
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              return (
                <tr 
                  key={block.blockInfo.blockHash}
                  className="border-b border-white/10"
                >
                  <td className="p-4 text-left">#{actualIndex}</td>
                  <td className="p-4 text-left" style={{ color: getBlockTypeColor(blockType) }}>{blockType}</td>
                  <td className="p-4 text-left">{block.deploys.length}</td>
                  <td className="p-4 text-left">{calculateTotalCost(block)}</td>
                  <td className="p-4 text-left">{calculateTotalPhlo(block)}</td>
                  <td className="p-4 text-left">
                    <span className="text-blue-500 cursor-pointer break-all hover:underline">
                      {block.blockInfo.blockHash}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination-container mt-8 mb-8">
        <div className="navigation-controls">
          <button 
            className="nav-button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button 
            className="nav-button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <span className="block-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="nav-button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button 
            className="nav-button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlocksList; 