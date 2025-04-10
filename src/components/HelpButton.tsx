import React, { useState } from 'react';
import Button from './ui/Button';
import Typography from './ui/Typography';
import Card from './ui/Card';

const HelpButton: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => setShowHelp(!showHelp);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleHelp}
        className="fixed bottom-4 right-4 z-50 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
      >
        Help (?)
      </Button>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" onClick={toggleHelp}> 
          <Card 
            className="bg-neutral-800 border border-neutral-700 max-w-lg w-11/12 p-6 rounded-lg shadow-xl text-white relative z-50"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <Typography variant="h3" className="mb-4 text-blue-400">How to Use the Explorer</Typography>
            <Typography variant="body" className="mb-2 text-neutral-300">
              - The Sankey diagram visualizes Phlogiston (Phlo) flow within a block.
            </Typography>
            <Typography variant="body" className="mb-2 text-neutral-300">
              - Left nodes represent inputs (sources of Phlo).
            </Typography>
            <Typography variant="body" className="mb-2 text-neutral-300">
              - Right nodes represent outputs (destinations of Phlo).
            </Typography>
             <Typography variant="body" className="mb-2 text-neutral-300">
              - Link width indicates the relative amount of Phlo transferred.
            </Typography>
            <Typography variant="body" className="mb-2 text-neutral-300">
              - Hover over nodes/links for details (e.g., addresses, amounts).
            </Typography>
             <Typography variant="body" className="mb-4 text-neutral-300">
              - Use the navigation buttons to move between blocks.
            </Typography>
            <Button variant="secondary" onClick={toggleHelp} className="mt-4 float-right">Close</Button> 
          </Card>
        </div>
      )}
    </>
  );
};

export default HelpButton; 