// src/components/SplashScreen.js
import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-container">
      <div className="travel-animation">
        {/* Dotted path */}
        <div className="dotted-path">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        
        {/* Travel icons around the path */}
        <div className="travel-icon icon-1">🥾</div>
        <div className="travel-icon icon-2">⛵</div>
        <div className="travel-icon icon-3">🎒</div>
        <div className="travel-icon icon-4">🗺️</div>
        
        {/* Main traveler emoji */}
        <div className="main-traveler">🚶‍♂️</div>
        
        {/* Destination pin */}
        <div className="destination-pin">📍</div>
      </div>
      
      {/* App name with animation */}
      <div className="app-name">
        <h1 className="logo-text">WanderWheel</h1>
        <p className="tagline">Spin Your Next Adventure! 🎡</p>
      </div>
      
      {/* Loading dots */}
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default SplashScreen;
