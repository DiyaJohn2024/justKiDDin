import React, { useState } from 'react';
import axios from 'axios';
import BookingLinks from './BookingLinks';
import SafetyAlerts from './SafetyAlerts';

function TravelPlanner({ userProfile }) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState(20000);
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  //const [mode, setMode] = useState('explore'); // or 'plan', 'view', etc.
  const [mode, setMode] = useState('explore');
  const [naturalInput, setNaturalInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [safetyScore, setSafetyScore] = useState(100);
  const [bestTimeAdvice, setBestTimeAdvice] = useState('');

  const calculateEndDate = (start, days) => {
  // Validate inputs
  if (!start || !days) return '';
  
  // Try to create date object
  const startDateObj = new Date(start);
  
  // Check if date is valid
  if (isNaN(startDateObj.getTime())) {
    console.error('Invalid start date:', start);
    return '';
  }
  
  // Parse days safely
  const numDays = parseInt(days);
  if (isNaN(numDays) || numDays <= 0) {
    console.error('Invalid duration:', days);
    return '';
  }
  
  // Calculate end date
  startDateObj.setDate(startDateObj.getDate() + numDays);
  
  // Return formatted date
  return startDateObj.toISOString().split('T')[0];
};

  // Update end date when start date or duration changes
  React.useEffect(() => {
  if (startDate && duration && parseInt(duration) > 0) {
    const calculatedEnd = calculateEndDate(startDate, duration);
    if (calculatedEnd) {  // Only set if valid
      setEndDate(calculatedEnd);
    }
  }
}, [startDate, duration]);


  const extractFromText = async () => {
    if (!naturalInput.trim()) {
      alert('Please describe your trip!');
      return;
    }

    setExtracting(true);
    try {
      const response = await axios.post('http://localhost:5000/extract-trip-details', {
        text: naturalInput,
        user_profile: {
          interests: userProfile.interests,
          travel_style: userProfile.travelStyle
        }
      });
      
      if (response.data.success) {
        const extracted = response.data.extracted;
        
        // Show AI's interpretation
        setExtractedData(extracted);
        
        // Handle suggested destinations (when user didn't mention one)
        if (extracted.suggested_destinations && extracted.suggested_destinations.length > 0) {
          // Show destination options
          const destChoice = window.confirm(
            `AI suggests these destinations:\n\n${extracted.suggested_destinations.join('\n')}\n\nPick the first one?`
          );
          if (destChoice) {
            setDestination(extracted.suggested_destinations[0]);
          }
        } else if (extracted.destination) {
          setDestination(extracted.destination);
        }
        
        // Auto-fill with AI's intelligent guesses
        if (extracted.duration) setDuration(extracted.duration);
        if (extracted.budget) setBudget(extracted.budget);
        if (extracted.start_date) setStartDate(extracted.start_date);
        
        // Show what AI understood
        alert(`🤖 AI Understood:\n\n${extracted.ai_interpretation}\n\nCheck the form and adjust if needed!`);
        
        setMode('quick');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert('AI had trouble understanding. Can you add more details?');
    }
    setExtracting(false);
  };

  const generateItinerary = async () => {
  if (!destination) {
    alert('Please enter a destination!');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    const response = await axios.post('http://localhost:5000/generate-itinerary', {
      destination,
      duration: parseInt(duration),
      budget: parseInt(budget),
      interests: userProfile.interests || ['general'],
      traveler_type: userProfile.travelStyle || 'solo',
      user_id: userProfile.uid || userProfile.id
    });
    
    if (response.data.success) {
      setItinerary(response.data.itinerary);
      setHotels(response.data.hotels || []);  // Set hotels from ML model
      setSafetyAlerts(response.data.safety_alerts || []);
      setSafetyScore(response.data.safety_score || 100);
      setBestTimeAdvice(response.data.best_time_advice || '');
      // Optional: Log for debugging
      console.log('✅ Itinerary generated');
      console.log('✅ Hotels received:', response.data.hotels_count);
      console.log('✅ Safety alerts:', response.data.safety_alerts?.length || 0);
    } else {
      setError('Failed to generate itinerary. Please try again.');
    }
  } catch (err) {
    console.error('Error:', err);
    setError('Could not connect to server. Make sure Flask is running on port 5000.');
  }
  
  setLoading(false);
};

return (
  <div className="travel-planner">
    {/* ===== 1. MODE TOGGLE BUTTONS ===== */}
    <div className="btn-group w-100 mb-4" role="group">
      <button
        className={`btn ${mode === 'quick' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => setMode('quick')}
      >
        📝 Quick Form
      </button>
      <button
        className={`btn ${mode === 'natural' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => setMode('natural')}
      >
        💬 Describe Freely
      </button>
    </div>

    {/* ===== 2. NATURAL LANGUAGE MODE ===== */}
    {mode === 'natural' && (
      <div className="card mb-4 border-primary">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">💬 Tell Us About Your Trip</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Describe your trip naturally. Examples:</p>
          <ul className="small text-muted mb-3">
            <li>"I want to visit Goa for 5 days with a budget of ₹30,000"</li>
            <li>"Plan a weekend getaway to Ooty under 15k"</li>
            <li>"Family trip to Jaipur, 4 days, around 50000 rupees"</li>
            <li>"Looking for a beach destination for next week"</li>
          </ul>
          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Type here... e.g., 'I want a 3-day adventure trip to Manali starting next Friday under ₹25,000'"
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
          />
          <button
            className="btn btn-primary w-100"
            onClick={extractFromText}
            disabled={extracting || !naturalInput.trim()}
          >
            {extracting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Understanding Your Request...
              </>
            ) : (
              '✨ Understand & Fill Form'
            )}
          </button>

          {extractedData && (
            <div className="alert alert-success mt-3">
              <h6>✅ Got It! Here's what I understood:</h6>
              <ul className="mb-2">
                {extractedData.destination && (
                  <li><strong>Destination:</strong> {extractedData.destination}</li>
                )}
                {extractedData.duration && (
                  <li><strong>Duration:</strong> {extractedData.duration} days</li>
                )}
                {extractedData.budget && (
                  <li><strong>Budget:</strong> ₹{extractedData.budget}</li>
                )}
                {extractedData.start_date && (
                  <li><strong>Start Date:</strong> {extractedData.start_date}</li>
                )}
                {extractedData.interests?.length > 0 && (
                  <li><strong>Interests:</strong> {extractedData.interests.join(', ')}</li>
                )}
              </ul>
              <button
                className="btn btn-sm btn-success"
                onClick={() => setMode('quick')}
              >
                View Form & Generate →
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ===== 3. QUICK FORM MODE ===== */}
    {mode === 'quick' && (
      <div className="row mb-4">
        {/* Destination */}
        <div className="col-md-3">
          <label className="form-label">🌍 Destination</label>
          <input 
            type="text"
            className="form-control"
            placeholder="e.g., Goa, Jaipur, Kerala"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        
        {/* Start Date */}
        <div className="col-md-3">
          <label className="form-label">📅 Start Date</label>
          <input 
            type="date"
            className="form-control"
            min={new Date().toISOString().split('T')[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        {/* Duration */}
        <div className="col-md-3">
          <label className="form-label">⏱️ Duration (days)</label>
          <input 
            type="number"
            className="form-control"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          {startDate && (
            <small className="text-muted d-block mt-1">
              Ends: {calculateEndDate(startDate, duration)}
            </small>
          )}
        </div>
        
        {/* Budget */}
        <div className="col-md-3">
          <label className="form-label">💰 Budget (₹)</label>
          <input 
            type="number"
            className="form-control"
            placeholder="e.g., 20000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
      </div>
    )}

    {/* ===== 4. GENERATE BUTTON ===== */}
    <div className="mb-4">
      <button 
        className="btn btn-primary btn-lg w-100"
        onClick={generateItinerary}
        disabled={loading || !destination || !startDate}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Generating Your Perfect Trip...
          </>
        ) : (
          '✨ Generate AI Itinerary'
        )}
      </button>
    </div>

    {/* ===== 5. ERROR MESSAGE ===== */}
    {error && (
      <div className="alert alert-danger">
        <strong>Error:</strong> {error}
      </div>
    )}

    {/* ===== 6. ITINERARY DISPLAY ===== */}
    {itinerary && (
      <>
      {/* Safety Alerts FIRST */}
    <SafetyAlerts 
      alerts={safetyAlerts}
      safetyScore={safetyScore}
      bestTimeAdvice={bestTimeAdvice}
    />
        <div className="card border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">🎯 Your Personalized Itinerary</h5>
          </div>
          <div className="card-body">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {itinerary}
            </div>
          </div>
        </div>
        {hotels && hotels.length > 0 && (
      <div className="card mt-4 border-info">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">🏨 AI-Recommended Hotels (ML-Powered)</h5>
          <small>Based on proximity to your planned attractions</small>
        </div>
        <div className="card-body">
          {hotels.map((hotel, idx) => (
            <div key={idx} className="card mb-3 border-success">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h6>{hotel.name}</h6>
                    <span className="badge bg-primary me-2">{hotel.type}</span>
                    <span className="badge bg-success">⭐ {hotel.rating.toFixed(1)}</span>
                    <p className="mt-2 mb-1">
                      <strong>📍 Near:</strong> {hotel.famous_place}
                      <br/>
                      <strong>🚶 Distance:</strong> {hotel.distance_to_attraction.toFixed(1)} km
                      <br/>
                      <strong>💰 Price:</strong> ₹{hotel.price_per_night}/night
                      <br/>
                      <small className="text-muted">{hotel.address}</small>
                    </p>
                    <div className="progress" style={{height: '5px'}}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{width: `${hotel.relevance_score * 100}%`}}
                      ></div>
                    </div>
                    <small className="text-muted">
                      ML Relevance Score: {(hotel.relevance_score * 100).toFixed(0)}%
                    </small>
                  </div>
                  <div className="col-md-4 text-end">
                    <p className="h4 text-primary mb-3">
                      ₹{hotel.price_per_night}
                      <small className="text-muted">/night</small>
                    </p>
                    <a
                      href={hotel.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success w-100"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
        {/* Booking Links */}
        <BookingLinks 
          destination={destination}
          startDate={startDate}
          endDate={endDate}
          duration={duration}
          budget={budget}
        />
      </>
    )}

    {/* ===== 7. PLACEHOLDER MESSAGE ===== */}
    {!itinerary && !loading && (
      <div className="text-center text-muted">
        <p>Enter destination, duration, and budget to generate your trip plan!</p>
        <p>We'll use your profile interests: <strong>{userProfile.interests?.join(', ')}</strong></p>
      </div>
    )}
  </div>
);

}
export default TravelPlanner;
