import React, { useState } from 'react';
import HelpModal from './HelpModal';

interface HelpButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

const HelpButton: React.FC<HelpButtonProps> = ({ className, style }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <button 
        className={`help-button ${className || ''}`}
        onClick={() => setIsHelpModalOpen(true)}
        style={{
          ...style
        }}
      >
        What am I looking at?
      </button>
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </>
  );
};

export default HelpButton; 