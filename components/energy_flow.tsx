import React, { useState, useEffect } from 'react';
import SankeyDiagram, { SankeyNode, SankeyLink } from './SankeyDiagram';

const EnergyFlowExample: React.FC = () => {
  const [data, setData] = useState<{nodes: SankeyNode[], links: SankeyLink[]}>({
    nodes: [],
    links: []
  });
  
  useEffect(() => {
    // In a real application, you might fetch this data from an API
    const energyNodes: SankeyNode[] = [
      { id: 'solar', name: 'Solar', color: '#f6e58d' },
      { id: 'wind', name: 'Wind', color: '#7ed6df' },
      { id: 'hydro', name: 'Hydroelectric', color: '#4834d4' },
      { id: 'coal', name: 'Coal', color: '#535c68' },
      { id: 'nuclear', name: 'Nuclear', color: '#686de0' },
      { id: 'natural_gas', name: 'Natural Gas', color: '#95afc0' },
      
      { id: 'electricity', name: 'Electricity Generation', color: '#f9ca24' },
      { id: 'transmission', name: 'Transmission & Distribution', color: '#f0932b' },
      
      { id: 'residential', name: 'Residential', color: '#eb4d4b' },
      { id: 'commercial', name: 'Commercial', color: '#6ab04c' },
      { id: 'industrial', name: 'Industrial', color: '#22a6b3' },
      { id: 'transportation', name: 'Transportation', color: '#be2edd' }
    ];
    
    const energyLinks: SankeyLink[] = [
      // Energy sources to electricity generation
      { source: 'solar', target: 'electricity', value: 15 },
      { source: 'wind', target: 'electricity', value: 25 },
      { source: 'hydro', target: 'electricity', value: 20 },
      { source: 'coal', target: 'electricity', value: 30 },
      { source: 'nuclear', target: 'electricity', value: 40 },
      { source: 'natural_gas', target: 'electricity', value: 35 },
      
      // Electricity to transmission
      { source: 'electricity', target: 'transmission', value: 165 },
      
      // Transmission to end users
      { source: 'transmission', target: 'residential', value: 60 },
      { source: 'transmission', target: 'commercial', value: 45 },
      { source: 'transmission', target: 'industrial', value: 50 },
      { source: 'transmission', target: 'transportation', value: 10 }
    ];
    
    setData({ nodes: energyNodes, links: energyLinks });
  }, []);
  
  return (
    <div className="energy-flow-container">
      <h2>Energy Flow Sankey Diagram</h2>
      <p>Visualizing the flow of energy from sources to end users</p>
      
      {data.nodes.length > 0 && (
        <SankeyDiagram 
          nodes={data.nodes} 
          links={data.links} 
          width={900} 
          height={600}
          nodeWidth={20}
          nodePadding={10}
          margin={{ top: 30, right: 150, bottom: 30, left: 150 }}
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
