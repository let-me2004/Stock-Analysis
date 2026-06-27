import React from 'react';
import './PillarDetails.css';

const PillarDetails = ({ pillar, onClose }) => {
  if (!pillar) return null;

  return (
    <div className="pillar-details-overlay">
      <div className="pillar-details-content glass-panel">
        <button className="back-button" onClick={onClose}>
          ← Back to Dashboard
        </button>
        
        <div className="pillar-header">
          <span className="pillar-number">#{pillar.id}</span>
          <h1 className="pillar-title">{pillar.title}</h1>
        </div>

        <div className="pillar-body">
          {pillar.text.map((paragraph, index) => (
            <p key={index} className="pillar-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillarDetails;
