// src/components/CategoryDetails.js
import React from 'react';

const CategoryDetails = ({ category, onBack }) => {
  const categoryData = {
    "Religious": {
      places: ["Varanasi Ghats", "Golden Temple, Amritsar", "Tirupati Temple"],
      description: "Sacred places for spiritual journey and inner peace"
    },
    "Historic": {
      places: ["Taj Mahal, Agra", "Red Fort, Delhi", "Hampi Ruins"],
      description: "Step back in time and explore India's rich heritage"
    },
    "Reunion": {
      places: ["Goa Beaches", "Coorg Hill Station", "Munnar Tea Gardens"],
      description: "Perfect spots for family gatherings and memories"
    },
    "Concerts": {
      places: ["Mumbai Music Festival", "Goa Electronic Festival", "Delhi Rock Concert"],
      description: "Live music and entertainment experiences"
    },
    "Tournaments": {
      places: ["Eden Gardens Cricket", "Goa Football Stadium", "Bangalore Tennis"],
      description: "Sports events and competitive experiences"
    },
    "Adventure": {
      places: ["Ladakh Trekking", "Rishikesh Rafting", "Manali Paragliding"],
      description: "Thrilling outdoor activities and extreme sports"
    }
  };

  const data = categoryData[category.name] || { places: [], description: "" };

  return (
    <div className="card shadow category-details">
      <div className="card-header" style={{backgroundColor: category.color, color: '#333'}}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {category.icon} {category.name} Adventures
          </h5>
          <button className="btn btn-sm btn-outline-dark" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">{data.description}</p>
        <h6>Popular Destinations:</h6>
        <ul className="list-group list-group-flush">
          {data.places.map((place, index) => (
            <li key={index} className="list-group-item border-0 px-0">
              📍 {place}
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <small className="text-muted">
            💡 Login for personalized recommendations and community tips!
          </small>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
