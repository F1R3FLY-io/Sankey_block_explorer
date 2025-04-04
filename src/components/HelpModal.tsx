import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span role="img" aria-label="pray">🙏</span>
          <h2>MeTTaCycle Explorer</h2>
        </div>

        <div className="modal-body">
          <h3>What is it?</h3>
          <p>This is one block of events in a decentralized system.</p>
          <p>In this block, addresses (nodes) interacted with each other:</p>
          <ul>
            <li>exchanged data</li>
            <li>invoked agents</li>
            <li>performed computations</li>
            <li>signed or verified results</li>
          </ul>

          <h3>What do the elements mean?</h3>
          <div className="element-explanation">
            <div className="element">
              <span className="blue-square"></span>
              <span>Node (rectangle) — an address (a participant)</span>
            </div>
            <div className="element">
              <span className="arrow-icon">➡️</span>
              <span>Arrow between nodes — an interaction in this block</span>
            </div>
          </div>

          <h3>What can I learn?</h3>
          <ul>
            <li>What each address did in this block</li>
            <li>How many interactions it had</li>
            <li>How much data or compute it handled</li>
            <li>How many agents were active in the block</li>
          </ul>

          <h3>Why do I care?</h3>
          <p>To understand who did what, who interacted with whom, and how much it cost (Phlo / Cost).</p>

          <button className="modal-button" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 