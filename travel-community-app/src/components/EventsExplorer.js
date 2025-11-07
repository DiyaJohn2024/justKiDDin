import React, { useState } from 'react';
import axios from 'axios';

function EventsExplorer() {
  const [city, setCity] = useState('Mumbai');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const searchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/get-events', {
        city,
        country_code: 'IN',
        start_date: startDate,
        end_date: endDate,
        type: eventType
      });
      
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const groupByType = () => {
    const grouped = {};
    events.forEach(event => {
      const type = event.type;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupByType();

  return (
    <div className="events-explorer">
      {/* Search Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>🎭 Discover Events & Trending Spots</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="music">Concerts</option>
                <option value="sports">Sports</option>
                <option value="arts">Comedy/Arts</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary mt-3 w-100"
            onClick={searchEvents}
            disabled={loading || !startDate || !endDate}
          >
            {loading ? 'Searching...' : '🔍 Find Events'}
          </button>
        </div>
      </div>

      {/* Events Display - Grouped by Type */}
      {Object.keys(groupedEvents).map(type => (
        <div key={type} className="mb-4">
          <h6 className="text-primary">{type} ({groupedEvents[type].length})</h6>
          <div className="row">
            {groupedEvents[type].map((event, idx) => (
              <div key={idx} className="col-md-6 mb-3">
                <div className="card h-100">
                  {event.image && (
                    <img
                      src={event.image}
                      className="card-img-top"
                      alt={event.name}
                      style={{height: '150px', objectFit: 'cover'}}
                    />
                  )}
                  <div className="card-body">
                    <h6 className="card-title">{event.name}</h6>
                    <p className="card-text small text-muted">
                      📅 {event.date} {event.time && `• ⏰ ${event.time}`}<br/>
                      📍 {event.venue}<br/>
                      {event.location}
                    </p>
                    {event.description && (
                      <p className="card-text small">{event.description}</p>
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedEvent(event)}
                      >
                        More Details →
                      </button>
                      {event.ticket_url && (
                        <a
                          href={event.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-success"
                        >
                          🎫 Book
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{selectedEvent.name}</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedEvent(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {selectedEvent.date}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                {selectedEvent.description && <p>{selectedEvent.description}</p>}
                
                {/* Button to plan trip around this event */}
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => {
                    // Navigate to planner with this event pre-filled
                    alert('Planning trip around ' + selectedEvent.name);
                  }}
                >
                  ✈️ Plan Trip for This Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsExplorer;
