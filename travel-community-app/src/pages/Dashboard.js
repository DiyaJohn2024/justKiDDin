// src/pages/Dashboard.js - 
import { logoutUser } from '../firebase/auth';
import { getPersonalizedRecommendations, getAllCommunitySpots } from '../firebase/database';
import CommunitySpots from '../components/CommunitySpots';
import AddSpotForm from '../components/AddSpotForm';
import TravelPlanner from '../components/TravelPlanner';
import Chatbot from '../components/Chatbot';
import React, { useState, useEffect, useCallback } from 'react';
import EventsExplorer from '../components/EventsExplorer';

const Dashboard = ({ user, userProfile, onLogout }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [communitySpots, setCommunitySpots] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);

    const loadDashboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Load personalized recommendations
      const recResult = await getPersonalizedRecommendations(userProfile);
      if (recResult.success) {
        setRecommendations(recResult.data);
      }

      // Load community spots
      const communityResult = await getAllCommunitySpots();
      if (communityResult.success) {
        setCommunitySpots(communityResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    
    setLoading(false);
  }, [userProfile]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      onLogout();
    }
  };

  const handleSpotAdded = () => {
    // Refresh community spots when new one is added
    loadDashboardData();
    setActiveTab('community');
  };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🎡 WanderWheel - Welcome, {userProfile.name}!
          </span>
          <div className="navbar-nav ms-auto">
            <button className="btn btn-outline-light me-2" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Profile Summary */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-primary text-white">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="mb-1">👋 Hello, {userProfile.name}!</h5>
                    <p className="mb-0">
                      {userProfile.travelStyle} • {userProfile.ageGroup} • 
                      Loves: {userProfile.interests.slice(0, 3).join(', ')}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="row text-center">
                      <div className="col-6">
                        <h6 className="mb-0">{userProfile.totalContributions || 0}</h6>
                        <small>Contributions</small>
                      </div>
                      <div className="col-6">
                        <h6 className="mb-0">{userProfile.totalRatings || 0}</h6>
                        <small>Reviews</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills nav-fill mb-4" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              🎯 For You
            </button>
          </li>
          <li className="nav-item">
          <button className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}>
            🎭 Events & Trending
          </button>
        </li>
          {/* ADD THIS NEW TAB */}
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              ✈️ Plan Trip
            </button>
          </li>
          <li className="nav-item" role="presentation">
  <button 
    className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
    onClick={() => setActiveTab('chat')}
  >
    💬 Chat Assistant
  </button>
</li>
          
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              🌍 Community Spots
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')} 
            >
              ➕ Add Local Gem
            </button>
          </li>
          <li className="nav-item" role="presentation">
        <button
          className={`nav-link ${activeTab === 'localGuide' ? 'active' : ''}`}
          onClick={() => {
            // Open guide app in new tab
            window.open('http://localhost:3001', '_blank');
            // Optionally keep active tab on previous tab or set to localGuide
            setActiveTab('localGuide');
          }}
        >
          🧭 localGuide
        </button>
      </li>

        </ul>


        {/* Tab Content */}
        <div className="tab-content">
          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">🎯 Personalized Just for You</h5>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-2">Finding perfect spots for you...</p>
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="row">
                        {recommendations.map((spot, index) => (
                          <div key={index} className="col-md-6 mb-3">
                            <div className="card border-success">
                              <div className="card-body">
                                <h6 className="card-title">{spot.name}</h6>
                                <p className="card-text text-muted">{spot.description}</p>
                                <div className="d-flex justify-content-between">
                                  <small className="text-success">
                                    📍 {spot.location}
                                  </small>
                                  <small className="text-warning">
                                    ⭐ {spot.averageRating || 'New'}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center">
                        <h6>🎲 Spin the wheel to discover places!</h6>
                        <p className="text-muted">
                          Add more interests to your profile for better recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'events' && (
          <div className="row">
            <div className="col-12">
              <EventsExplorer />
            </div>
          </div>
        )}
          {activeTab === 'chat' && (
          <div className="row">
            <div className="col-12">
              <Chatbot userProfile={userProfile} />
            </div>
          </div>
        )}

          
          {activeTab === 'planner' && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">✈️ AI Trip Planner</h5>
                </div>
                <div className="card-body">
                  <TravelPlanner userProfile={userProfile} />
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'community' && (
            <CommunitySpots spots={communitySpots} loading={loading} userId={user.uid} />
            )}


          {/* Add Spot Tab */}
          {activeTab === 'add' && (
            <AddSpotForm userId={user.uid} onSpotAdded={handleSpotAdded} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
