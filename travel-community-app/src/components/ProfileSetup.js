// src/components/ProfileSetup.js
import React, { useState } from 'react';

const ProfileSetup = ({ onProfileComplete }) => {
  const [profile, setProfile] = useState({
    name: '',
    ageGroup: '',
    travelStyle: '',
    previousPlaces: '',
    interests: []
  });

  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const travelStyles = ['Adventure', 'Relaxation', 'Cultural', 'Food Explorer', 'Budget Traveler'];
  const interestOptions = ['Beaches', 'Mountains', 'Historical Sites', 'Local Food', 'Nightlife', 'Shopping'];

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profile.name && profile.ageGroup && profile.travelStyle) {
      onProfileComplete(profile);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Welcome! Set Up Your Travel Profile 🎒</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Age Group */}
              <div className="mb-3">
                <label className="form-label">Age Group</label>
                <select 
                  className="form-select"
                  value={profile.ageGroup}
                  onChange={(e) => setProfile({...profile, ageGroup: e.target.value})}
                  required
                >
                  <option value="">Select age group</option>
                  {ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              {/* Travel Style */}
              <div className="mb-3">
                <label className="form-label">Travel Style</label>
                <select 
                  className="form-select"
                  value={profile.travelStyle}
                  onChange={(e) => setProfile({...profile, travelStyle: e.target.value})}
                  required
                >
                  <option value="">Select your style</option>
                  {travelStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Previous Places */}
              <div className="mb-3">
                <label className="form-label">Places You've Visited (Optional)</label>
                <textarea 
                  className="form-control"
                  value={profile.previousPlaces}
                  onChange={(e) => setProfile({...profile, previousPlaces: e.target.value})}
                  placeholder="e.g., Goa, Kerala, Rajasthan..."
                  rows="2"
                />
              </div>

              {/* Interests */}
              <div className="mb-4">
                <label className="form-label">Your Interests (Select multiple)</label>
                <div className="row">
                  {interestOptions.map(interest => (
                    <div key={interest} className="col-6 mb-2">
                      <div className="form-check">
                        <input 
                          className="form-check-input"
                          type="checkbox"
                          checked={profile.interests.includes(interest)}
                          onChange={() => handleInterestToggle(interest)}
                        />
                        <label className="form-check-label">{interest}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Start Exploring! 🚀
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
