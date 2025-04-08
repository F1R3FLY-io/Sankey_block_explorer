import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [blocks, setBlocks] = useState<BlockWithDeploys[]>(propsBlocks);
  const [categories, setCategories] = useState(propsCategories);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(blocks.length / itemsPerPage);

  React.useEffect(() => {
    setBlocks(propsBlocks);
    setCategories(propsCategories);
  }, [propsBlocks, propsCategories]);

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
    if (blocks.length > 0) {
      navigate('/', { 
        state: { 
          currentBlockIndex: 0
        } 
      });
    } else {
      navigate('/');
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '32px 90px' }}>Loading...</div>;
  if (!blocks.length) return <div style={{ color: 'white', padding: '32px 90px' }}>No data available</div>;

  return (
    <div style={{
      padding: '32px 0',
      paddingLeft: '90px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button 
          onClick={handleBackToExplorer}
          style={{
            color: 'rgb(157, 167, 177)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          ← Back to Explorer
        </button>
      </div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: '400',
        marginBottom: '32px',
        textAlign: 'left'
      }}>
        Blocks list
      </h1>

      <div style={{
        background: 'rgb(22, 30, 38)',
        borderRadius: '12px',
        width: 'calc(100% - 310px)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              textAlign: 'left',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '8%' }}>Block #</th>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '12%' }}>Type</th>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '10%' }}>Deploys</th>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '12%' }}>Total cost</th>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '12%' }}>Total Phlo</th>
              <th style={{ padding: '16px 32px', color: 'rgb(157, 167, 177)', textAlign: 'left', width: '46%' }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageBlocks().map((block, index) => {
              const blockType = getBlockType(block);
              const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr 
                  key={block.blockInfo.blockHash}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <td style={{ padding: '16px 32px', textAlign: 'left' }}>#{actualIndex}</td>
                  <td style={{ padding: '16px 32px', color: getBlockTypeColor(blockType), textAlign: 'left' }}>{blockType}</td>
                  <td style={{ padding: '16px 32px', textAlign: 'left' }}>{block.deploys.length}</td>
                  <td style={{ padding: '16px 32px', textAlign: 'left' }}>{calculateTotalCost(block)}</td>
                  <td style={{ padding: '16px 32px', textAlign: 'left' }}>{calculateTotalPhlo(block)}</td>
                  <td style={{ padding: '16px 32px', textAlign: 'left' }}>
                    <span style={{
                      color: 'rgb(0, 122, 255)',
                      cursor: 'pointer',
                      wordBreak: 'break-all'
                    }}>
                      {block.blockInfo.blockHash}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination-container" style={{ 
        marginTop: '32px',
        marginBottom: '32px'
      }}>
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