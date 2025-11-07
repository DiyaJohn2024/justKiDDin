import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

function CommunitySpots({ userId }) {
  const [activeView, setActiveView] = useState('discover'); // discover, mySpots, addNew
  const [spots, setSpots] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Add new spot form
  const [newSpot, setNewSpot] = useState({
    name: '',
    location: '',
    city: '',
    category: 'hidden_gem',
    description: '',
    bestTime: '',
    budget: 'free',
    tags: []
  });

  // Load community spots from Firebase
  useEffect(() => {
    loadCommunitySpots();
  }, [selectedCategory]);

  const loadCommunitySpots = async () => {
    setLoading(true);
    try {
      const spotsRef = collection(db, 'community_spots');
      const q = query(spotsRef, orderBy('timestamp', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      
      const spotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by category
      const filtered = selectedCategory === 'all' 
        ? spotsData 
        : spotsData.filter(s => s.category === selectedCategory);
      
      setSpots(filtered);
    } catch (error) {
      console.error('Error loading spots:', error);
    }
    setLoading(false);
  };

  // Load nearby events
  const loadNearbyEvents = async (city) => {
    try {
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      
      const response = await axios.post('http://localhost:5000/get-events', {
        city: city,
        country_code: 'IN',
        start_date: new Date().toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        type: 'all'
      });
      
      if (response.data.success) {
        setEvents(response.data.events.slice(0, 5)); // Top 5 events
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Submit new community spot
  const submitSpot = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'community_spots'), {
        ...newSpot,
        userId: userId,
        timestamp: new Date(),
        likes: 0,
        verified: false
      });
      
      alert('✅ Spot added! It will be visible after verification.');
      
      // Reset form
      setNewSpot({
        name: '',
        location: '',
        city: '',
        category: 'hidden_gem',
        description: '',
        bestTime: '',
        budget: 'free',
        tags: []
      });
      
      setActiveView('discover');
      loadCommunitySpots();
    } catch (error) {
      console.error('Error adding spot:', error);
      alert('Error adding spot. Please try again.');
    }
    setLoading(false);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'hidden_gem': '💎',
      'food': '🍜',
      'viewpoint': '🌄',
      'adventure': '⛰️',
      'culture': '🏛️',
      'nightlife': '🌃',
      'nature': '🌳',
      'shopping': '🛍️'
    };
    return icons[category] || '📍';
  };

  return (
    <div className="community-spots">
      {/* Header with View Toggle */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>🌍 Community Discoveries</h4>
          <p className="text-muted">Real travelers, real experiences</p>
          
          <div className="btn-group w-100 mt-3" role="group">
            <button
              className={`btn ${activeView === 'discover' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveView('discover')}
            >
              🔍 Discover
            </button>
            <button
              className={`btn ${activeView === 'events' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveView('events')}
            >
              🎭 Events
            </button>
            <button
              className={`btn ${activeView === 'addNew' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveView('addNew')}
            >
              ➕ Add Spot
            </button>
          </div>
        </div>
      </div>

      {/* DISCOVER VIEW - Community Spots */}
      {activeView === 'discover' && (
        <>
          {/* Category Filter */}
          <div className="card mb-3">
            <div className="card-body">
              <h6>Filter by Category:</h6>
              <div className="d-flex flex-wrap gap-2">
                {['all', 'hidden_gem', 'food', 'viewpoint', 'adventure', 'culture', 'nightlife', 'nature', 'shopping'].map(cat => (
                  <button
                    key={cat}
                    className={`btn btn-sm ${selectedCategory === cat ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {getCategoryIcon(cat)} {cat === 'all' ? 'All' : cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Community Spots Grid */}
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary"></div>
              <p>Loading community spots...</p>
            </div>
          ) : spots.length === 0 ? (
            <div className="alert alert-info">
              <h6>No spots found in this category</h6>
              <p>Be the first to add one!</p>
              <button className="btn btn-primary" onClick={() => setActiveView('addNew')}>
                Add Your Hidden Gem
              </button>
            </div>
          ) : (
            <div className="row">
              {spots.map((spot, idx) => (
                <div key={spot.id} className="col-md-6 mb-3">
                  <div className="card h-100 border-success">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title">
                          {getCategoryIcon(spot.category)} {spot.name}
                        </h5>
                        {spot.verified && (
                          <span className="badge bg-success">✓ Verified</span>
                        )}
                      </div>
                      
                      <p className="card-text">
                        <strong>📍 Location:</strong> {spot.location}, {spot.city}
                      </p>
                      
                      <p className="card-text">{spot.description}</p>
                      
                      <div className="mb-2">
                        <small className="text-muted">
                          <strong>⏰ Best Time:</strong> {spot.bestTime || 'Anytime'}
                        </small>
                        <br/>
                        <small className="text-muted">
                          <strong>💰 Budget:</strong> {spot.budget}
                        </small>
                      </div>
                      
                      {spot.tags && spot.tags.length > 0 && (
                        <div className="mb-2">
                          {spot.tags.map((tag, i) => (
                            <span key={i} className="badge bg-light text-dark me-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          👍 {spot.likes || 0} likes
                        </small>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => loadNearbyEvents(spot.city)}
                        >
                          View Events Nearby
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* EVENTS VIEW - Like Events Explorer */}
      {activeView === 'events' && (
        <div className="card">
          <div className="card-header bg-warning">
            <h5 className="mb-0">🎭 Upcoming Events</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter city..."
                  onBlur={(e) => loadNearbyEvents(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-warning w-100"
                  onClick={() => {
                    const city = document.querySelector('input[placeholder="Enter city..."]').value;
                    loadNearbyEvents(city);
                  }}
                >
                  🔍 Find Events
                </button>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="alert alert-info">
                <p>Enter a city above to discover concerts, sports, festivals and more!</p>
              </div>
            ) : (
              <div className="row">
                {events.map((event, idx) => (
                  <div key={idx} className="col-md-6 mb-3">
                    <div className="card border-warning">
                      <div className="card-body">
                        {event.image && (
                          <img
                            src={event.image}
                            className="card-img-top mb-2"
                            alt={event.name}
                            style={{height: '150px', objectFit: 'cover', borderRadius: '8px'}}
                          />
                        )}
                        <h6 className="card-title">{event.name}</h6>
                        <span className="badge bg-warning text-dark mb-2">{event.type}</span>
                        <p className="card-text small">
                          📅 {event.date} • ⏰ {event.time}<br/>
                          📍 {event.venue}<br/>
                          {event.location}
                        </p>
                        {event.description && (
                          <p className="card-text small text-muted">{event.description}</p>
                        )}
                        <div className="d-flex gap-2">
                          {event.ticket_url && (
                            <a
                              href={event.ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-warning"
                            >
                              🎫 Get Tickets
                            </a>
                          )}
                          <button className="btn btn-sm btn-outline-primary">
                            ✈️ Plan Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD NEW SPOT VIEW */}
      {activeView === 'addNew' && (
        <div className="card">
          <div className="card-header bg-success text-white" >
            <h5 className="mb-0"
>➕ Share Your Hidden Gem</h5>
          </div>
          <div className="card-body">
            <form onSubmit={submitSpot}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Spot Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Secret Beach Cafe"
                    value={newSpot.name}
                    onChange={(e) => setNewSpot({...newSpot, name: e.target.value})}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newSpot.category}
                    onChange={(e) => setNewSpot({...newSpot, category: e.target.value})}
                    required
                  >
                    <option value="hidden_gem">💎 Hidden Gem</option>
                    <option value="food">🍜 Food Spot</option>
                    <option value="viewpoint">🌄 Viewpoint</option>
                    <option value="adventure">⛰️ Adventure</option>
                    <option value="culture">🏛️ Cultural</option>
                    <option value="nightlife">🌃 Nightlife</option>
                    <option value="nature">🌳 Nature</option>
                    <option value="shopping">🛍️ Shopping</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Goa"
                    value={newSpot.city}
                    onChange={(e) => setNewSpot({...newSpot, city: e.target.value})}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Exact Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Near Anjuna Beach"
                    value={newSpot.location}
                    onChange={(e) => setNewSpot({...newSpot, location: e.target.value})}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Best Time to Visit</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Sunset, Early morning"
                    value={newSpot.bestTime}
                    onChange={(e) => setNewSpot({...newSpot, bestTime: e.target.value})}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Budget</label>
                  <select
                    className="form-select"
                    value={newSpot.budget}
                    onChange={(e) => setNewSpot({...newSpot, budget: e.target.value})}
                  >
                    <option value="free">Free</option>
                    <option value="under_500">Under ₹500</option>
                    <option value="500_1000">₹500-1000</option>
                    <option value="1000_plus">₹1000+</option>
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Why is this place special? What should travelers know?"
                    value={newSpot.description}
                    onChange={(e) => setNewSpot({...newSpot, description: e.target.value})}
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., quiet, instagrammable, local favorite"
                    onChange={(e) => setNewSpot({...newSpot, tags: e.target.value.split(',').map(t => t.trim())})}
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : '✨ Share This Spot'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunitySpots;
