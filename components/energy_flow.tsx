import React, { useState, useEffect } from 'react';
import SankeyDiagram, { SankeyNode, SankeyLink } from './SankeyDiagram';
import { energyFlowData, sankeyConfig } from '../data/mockData';

const EnergyFlowExample: React.FC = () => {
  const [data, setData] = useState<{nodes: SankeyNode[], links: SankeyLink[]}>({
    nodes: [],
    links: []
  });
  
  useEffect(() => {
    // In a real application, you might fetch this data from an API
    // Now using the mock data from the data file
    setData({ 
      nodes: energyFlowData.nodes, 
      links: energyFlowData.links 
    });
  }, []);
  
  return (
    <div className="energy-flow-container">
      <h2>Energy Flow Sankey Diagram</h2>
      <p>Visualizing the flow of energy from sources to end users</p>
      
      {data.nodes.length > 0 && (
        <SankeyDiagram 
          nodes={data.nodes} 
          links={data.links} 
          width={sankeyConfig.width} 
          height={sankeyConfig.height}
          nodeWidth={sankeyConfig.nodeWidth}
          nodePadding={sankeyConfig.nodePadding}
          margin={sankeyConfig.margin}
        />
      )}
      
      <div className="legend" style={{marginTop: '20px'}}>
        <h3>Legend</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {data.nodes.map(node => (
            <div key={node.id} style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
              <div 
                style={{
                  width: '15px', 
                  height: '15px', 
                  backgroundColor: node.color,
                  marginRight: '5px'
                }} 
              />
              <span>{node.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnergyFlowExample;