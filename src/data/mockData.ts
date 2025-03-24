import { SankeyNode, SankeyLink } from '../../components/SankeyDiagram';

// Energy flow data for Sankey diagram
export const energyFlowData = {
  nodes: [
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
  ] as SankeyNode[],
  
  links: [
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
  ] as SankeyLink[]
};

// Configuration for the Sankey diagram
export const sankeyConfig = {
  width: 900,
  height: 600,
  nodeWidth: 20,
  nodePadding: 10,
  margin: { top: 30, right: 150, bottom: 30, left: 150 }
};
