// src/components/SpinWheel.js
import React, { useState } from 'react';
import './SpinWheel.css';

const SpinWheel = ({ onCategorySelect }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const categories = [
    { name: "Religious", icon: "🕉️", color: "#FF6B35" },
    { name: "Historic", icon: "🏛️", color: "#4ECDC4" },
    { name: "Reunion", icon: "👥", color: "#45B7D1" },
    { name: "Concerts", icon: "🎵", color: "#96CEB4" },
    { name: "Tournaments", icon: "🏆", color: "#FECA57" },
    { name: "Adventure", icon: "🏔️", color: "#FF9FF3" }
  ];

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spins = Math.floor(Math.random() * 5) + 5; // 5-10 full rotations
    const finalRotation = spins * 360 + Math.floor(Math.random() * 360);
    
    setRotation(prev => prev + finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Calculate which category was selected
      const normalizedRotation = (rotation + finalRotation) % 360;
      const segmentAngle = 360 / categories.length;
      const selectedIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % categories.length;
      onCategorySelect(categories[selectedIndex]);
    }, 3000);
  };

  return (
    <div className="spin-wheel-container">
      <div className="wheel-wrapper">
        {/* Pointer */}
        <div className="wheel-pointer">▼</div>
        
        {/* Wheel */}
        <div 
          className={`wheel ${isSpinning ? 'spinning' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          onClick={spinWheel}
        >
          {categories.map((category, index) => {
            const angle = (360 / categories.length) * index;
            return (
              <div
                key={category.name}
                className="wheel-segment"
                style={{
                  backgroundColor: category.color,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <div className="segment-content">
                  <div className="segment-icon">{category.icon}</div>
                  <div className="segment-text">{category.name}</div>
                </div>
              </div>
            );
          })}
          
          {/* Center circle */}
          <div className="wheel-center">
            <div className="center-text">
              {isSpinning ? "🎲" : "SPIN"}
            </div>
          </div>
        </div>
      </div>
      
      {isSpinning && (
        <p className="spinning-text">🎡 Spinning... Finding your adventure!</p>
      )}
    </div>
  );
};

export default SpinWheel;
