import React from 'react';

function BookingLinks({ destination, startDate, endDate, duration, budget }) {
  const destinationEncoded = encodeURIComponent(destination);
  
  // Calculate checkout date
  const checkout = new Date(startDate);
  checkout.setDate(checkout.getDate() + duration);
  const checkoutDate = checkout.toISOString().split('T')[0];
  
  return (
    <div className="booking-links card mt-4 border-primary">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">🔗 Quick Booking Links</h5>
      </div>
      <div className="card-body">
        <p className="text-muted small">Click to open booking platforms with your trip details pre-filled</p>
        
        {/* Hotels */}
        <div className="mb-3">
          <h6>🏨 Hotels & Accommodation</h6>
          <div className="d-flex gap-2 flex-wrap">
            <a
              href={`https://www.booking.com/searchresults.html?ss=${destinationEncoded}&checkin=${startDate}&checkout=${checkoutDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              <img src="https://cdn.worldvectorlogo.com/logos/bookingcom-1.svg" height="20" alt="Booking.com" className="me-2"/>
              Booking.com
            </a>
            
            <a
              href={`https://www.makemytrip.com/hotels/hotel-listing/?city=${destinationEncoded}&checkin=${startDate}&checkout=${checkoutDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info"
            >
              MakeMyTrip Hotels
            </a>
            
            <a
              href={`https://www.airbnb.co.in/s/${destinationEncoded}/homes?checkin=${startDate}&checkout=${checkoutDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-danger"
            >
              Airbnb
            </a>
            
            <a
              href={`https://www.goibibo.com/hotels/hotels-in-${destinationEncoded.toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-warning"
            >
              Goibibo
            </a>
          </div>
        </div>
        
        {/* Flights */}
        <div className="mb-3">
          <h6>✈️ Flights & Transportation</h6>
          <div className="d-flex gap-2 flex-wrap">
            <a
              href={`https://www.makemytrip.com/flights/?from=&to=${destinationEncoded}&date=${startDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              MakeMyTrip Flights
            </a>
            
            <a
              href={`https://www.goibibo.com/flights/?from=&to=${destinationEncoded}&date=${startDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-warning"
            >
              Goibibo Flights
            </a>
            
            <a
              href={`https://www.skyscanner.co.in/transport/flights/&/${destinationEncoded}/?outboundDate=${startDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-success"
            >
              Skyscanner
            </a>
            
            <a
              href={`https://www.cleartrip.com/flights`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary"
            >
              Cleartrip
            </a>
          </div>
        </div>
        
        {/* Trains */}
        <div className="mb-3">
          <h6>🚂 Trains</h6>
          <div className="d-flex gap-2 flex-wrap">
            <a
              href={`https://www.irctc.co.in/nget/train-search`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              IRCTC
            </a>
            
            <a
              href={`https://www.makemytrip.com/railways/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info"
            >
              MakeMyTrip Trains
            </a>
          </div>
        </div>
        
        {/* Activities */}
        <div>
          <h6>🎭 Activities & Tours</h6>
          <div className="d-flex gap-2 flex-wrap">
            <a
              href={`https://www.getyourguide.com/s/?q=${destinationEncoded}&date_from=${startDate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-success"
            >
              GetYourGuide
            </a>
            
            <a
              href={`https://www.tripadvisor.in/Attractions-g-Activities-${destinationEncoded}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-danger"
            >
              TripAdvisor
            </a>
            
            <a
              href={`https://www.thrillophilia.com/search?q=${destinationEncoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-warning"
            >
              Thrillophilia
            </a>
          </div>
        </div>
      </div>
      
      <div className="card-footer text-muted small">
        💡 Tip: Compare prices across platforms for the best deals!
      </div>
    </div>
  );
}

export default BookingLinks;
