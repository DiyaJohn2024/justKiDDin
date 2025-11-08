import React, { useState } from 'react';
import './ProfileSetup.css'; // Make sure your CSS file is in the same folder

const ProfileSetup = ({ onProfileComplete }) => {
  const [profile, setProfile] = useState({
    name: '',
    ageGroup: '',
    travelStyle: '',
    previousPlaces: '',
    interests: []
  });

  const [flying, setFlying] = useState([]); // For interest animation

  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const travelStyles = ['Adventure', 'Relaxation', 'Cultural', 'Food Explorer', 'Budget Traveler'];
  const interestOptions = ['Beaches', 'Mountains', 'Historical Sites', 'Local Food', 'Nightlife', 'Shopping'];

  // Add with flying animation
  const handleInterestAdd = (interest) => {
    if (profile.interests.includes(interest)) return;
    setFlying([...flying, interest]);
    setTimeout(() => {
      setFlying(current => current.filter(i => i !== interest));
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }, 700); // Animation duration in ms
  };

  // Remove from basket list
  const handleInterestRemove = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profile.name && profile.ageGroup && profile.travelStyle) {
      onProfileComplete(profile);
    }
  };

  return (
    <div className="profile-bg"
      style={{
        minHeight: "100vh",
        width: "99.3vw",
        backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingLeft: "70px",    // adds 60px space on left
        paddingRight: "60px"

      }}
    >
      <div className="col-md-6" >
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

              {/* Interests (Card Selector with Basket List and Animation) */}
              <div className="mb-4">
                <label className="form-label">Your Interests (Select multiple)</label>
                <div className="interests-basket-row">
                  {/* Card row */}
                  <div className="interests-row">
                    {interestOptions.map(interest => {
                      // Show the card only if NOT already in profile.interests or if it's flying
                      if (profile.interests.includes(interest) && !flying.includes(interest)) return null;
                      return (
                        <div
                          key={interest}
                          className={`interest-card${flying.includes(interest) ? " fly-to-basket" : ""}`}
                          onClick={() => handleInterestAdd(interest)}
                        >
                          <span>{interest}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Large basket with list */}
                  <div className="interest-basket-large">
                    <span role="img" aria-label="basket" style={{ fontSize: "4.2rem" }}>🧺</span>
                    <div className="basket-list">
                      {profile.interests.length === 0 && (
                        <div className="basket-empty">Basket Empty</div>
                      )}
                      {profile.interests.map(interest => (
                        <div className="basket-chip" key={interest}>
                          {interest}
                          <button
                            className="basket-remove"
                            onClick={() => handleInterestRemove(interest)}
                            title="Remove"
                            type="button"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
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