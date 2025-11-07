// App.js -
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/config';
import { getUserProfile } from './firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TravelPlanner from './components/TravelPlanner';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [currentView, setCurrentView] = useState('splash');
  const [showSplash, setShowSplash] = useState(true);
  
  // Handle splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setCurrentView('home');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load user profile when authenticated
  useEffect(() => {
    if (user && !userProfile) {
      loadUserProfile();
    }
  }, [user, userProfile]);

  const loadUserProfile = async () => {
    try {
      const result = await getUserProfile(user.uid);
      
      if (result.success) {
        setUserProfile(result.data);
        setCurrentView('dashboard');
      } else {
        console.error('❌ Profile load failed:', result.error);
        alert(`Profile load failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Profile load error:', err);
      alert(`Profile load error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h5>Authentication Error</h5>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
     
      {showSplash && <SplashScreen />}
      
      {!showSplash && (
        <>
          {!user && (
            <>
              {currentView === 'home' && (
                <HomePage 
                  onLogin={() => {
                    setCurrentView('auth');
                  }}
                  onExplore={(category) => {
                  }}
                />
              )}
              
              {currentView === 'auth' && (
                <AuthPage 
                  onBack={() => {
                    setCurrentView('home');
                  }}
                  onSuccess={() => {
                    // Don't set view here, let useEffect handle it
                  }}
                />
              )}
            </>
          )}
          
          {user && userProfile && (
            <Dashboard 
              user={user} 
              userProfile={userProfile}
              onLogout={() => {
                setUserProfile(null);
                setCurrentView('home');
              }}
            />
          )}
          
          {user && !userProfile && (
            <div className="container mt-5">
              <div className="text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Loading your profile...</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => loadUserProfile()}
                >
                  Retry Loading Profile
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


export default App;
