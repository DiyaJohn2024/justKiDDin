// src/pages/HomePage.js
import React, { useState } from 'react';
import SpinWheel from '../components/SpinWheel';
import CategoryDetails from '../components/CategoryDetails';
import './HomePage.css';

const HomePage = ({ onLogin, onExplore }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTrending, setShowTrending] = useState(true);

  const trendingNow = [
    { icon: "🎆", title: "Diwali Celebrations", location: "Varanasi, UP", trending: "🔥 Trending" },
    { icon: "🏔️", title: "Winter Trekking", location: "Manali, HP", trending: "❄️ Seasonal" },
    { icon: "🎵", title: "Music Festival", location: "Goa Beach", trending: "🎉 Live Now" },
    { icon: "🏛️", title: "Heritage Walk", location: "Jaipur, RJ", trending: "📿 Cultural" }
  ];

  const handleWheelSpin = (category) => {
    setSelectedCategory(category);
    setShowTrending(false);
    onExplore(category);
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">🎡 WanderWheel</span>
          <div className="navbar-nav ms-auto">
            <button className="btn btn-outline-light" onClick={onLogin}>
              Login for Personal Recommendations 🔐
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Hero Section */}
        <div className="hero-section text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">
            Discover Your Next Adventure! 🌟
          </h1>
          <p className="lead text-muted">
            Spin the wheel and let serendipity guide your journey
          </p>
        </div>

        <div className="row">
          {/* Spinning Wheel Section */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-lg wheel-card">
              <div className="card-header bg-gradient text-white text-center">
                <h4 className="mb-0">🎡 Spin Your Adventure</h4>
              </div>
              <div className="card-body text-center">
                <SpinWheel onCategorySelect={handleWheelSpin} />
                <p className="mt-3 text-muted">
                  Click the wheel to discover something amazing!
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="col-lg-6">
            {showTrending && (
              <div className="card shadow trending-card">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">🔥 What's Trending Now</h5>
                </div>
                <div className="card-body">
                  {trendingNow.map((item, index) => (
                    <div key={index} className="trending-item p-3 mb-2 border-start border-warning border-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {item.icon} {item.title}
                          </h6>
                          <small className="text-muted">📍 {item.location}</small>
                        </div>
                        <span className="badge bg-warning text-dark">
                          {item.trending}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory && (
              <CategoryDetails 
                category={selectedCategory}
                onBack={() => {
                  setSelectedCategory(null);
                  setShowTrending(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
