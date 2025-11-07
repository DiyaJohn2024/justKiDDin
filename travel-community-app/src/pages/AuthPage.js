// src/pages/AuthPage.js
import React, { useState } from 'react';
import { signUpUser, signInUser } from '../firebase/auth';
import ProfileSetup from '../components/ProfileSetup';
import axios from 'axios';

const AuthPage = ({ onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [naturalInput, setNaturalInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedPreferences, setExtractedPreferences] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign In
        const result = await signInUser(authData.email, authData.password);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      } else {
        // Just collect email/password for signup, profile setup comes next
        setShowProfileSetup(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  const handleProfileComplete = async (profileData) => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...profileData,
        email: authData.email
      };
      
      const result = await signUpUser(authData.email, authData.password, userData);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
        setShowProfileSetup(false);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setShowProfileSetup(false);
    }
    
    setLoading(false);
  };

  const analyzePreferences = async () => {
  if (!naturalInput.trim()) {
    alert('Please tell us about your travel preferences!');
    return;
  }

  setAnalyzing(true);
  
  try {
    const response = await axios.post('http://localhost:5000/analyze-preferences', {
      user_input: naturalInput
    });
    
    if (response.data.success) {
      setExtractedPreferences(response.data.preferences);
      // Auto-fill form fields with extracted data
      // You can use this to populate interests, travel style, etc.
    }
  } catch (error) {
    console.error('Error analyzing preferences:', error);
  }
  
  setAnalyzing(false);
};

  if (showProfileSetup) {
    return (
      <div>
        <nav className="navbar navbar-dark bg-primary">
          <div className="container">
            <span className="navbar-brand">🎡 WanderWheel - Complete Profile</span>
          </div>
        </nav>
        <div className="container mt-4">
          <ProfileSetup onProfileComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">🎡 WanderWheel</span>
          <button className="btn btn-outline-light" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h4 className="mb-0">
                  {isLogin ? '🔐 Welcome Back!' : '🎒 Join the Community!'}
                </h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAuth}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={authData.email}
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      required
                      placeholder="Enter your password"
                      minLength="6"
                    />
                    <label className="form-label">
                      💬 Tell us about yourself in your own words:
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Example: I love exploring hidden beaches and trying local street food. I prefer budget-friendly trips and hate crowded tourist spots. I'm adventurous and like meeting locals..."
                      value={naturalInput}
                      onChange={(e) => setNaturalInput(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="btn btn-outline-primary mt-2"
                      onClick={analyzePreferences}
                      disabled={analyzing}
                    >
                      {analyzing ? 'Analyzing...' : '✨ Analyze My Preferences'}
                    </button>
                  </div>

                  {extractedPreferences && (
  <div className="alert alert-success mt-3">
    <h6>We understood you! 🎯</h6>
    <p><strong>Interests:</strong> {extractedPreferences.interests.join(', ')}</p>
    <p><strong>Travel Style:</strong> {extractedPreferences.travel_style}</p>
    <p><strong>Budget Preference:</strong> {extractedPreferences.budget_level}</p>
    <p><strong>Personality:</strong> {extractedPreferences.personality_traits.join(', ')}</p>
  </div>
)}

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Please wait...
                      </span>
                    ) : (
                      isLogin ? '🚀 Sign In' : '✨ Create Account'
                    )}
                  </button>
                </form>

                <hr />

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setAuthData({ email: '', password: '' });
                    }}
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up here!" 
                      : "Already have an account? Sign in here!"
                    }
                  </button>
                </div>

                {!isLogin && (
                  <div className="alert alert-info mt-3">
                    <small>
                      <strong>🎯 Next step:</strong> After creating your account, 
                      you'll set up your travel preferences for personalized recommendations!
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
