

import React, { useState } from "react";
import axios from "axios";

function App() {
  const [destination, setDestination] = useState("");
  const [place, setPlace] = useState("");
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [userName, setUserName] = useState("");
  const [userContact, setUserContact] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [tripDate, setTripDate] = useState("");
  const [guideType, setGuideType] = useState("place");

  const ROUTE_GUIDE_COST = 1500;
  const PLACE_GUIDE_COST = 800;

  const fetchGuides = async () => {
    if (guideType === "place" && !place.trim()) {
    alert("Please enter at least one place for Place Guide");
    return;
  }
  if (!destination.trim()) {
    alert("Destination is required");
    return;
  }
    try {
      const response = await axios.get("http://127.0.0.1:5000/guides", {
        params: { destination, place },
      });
      
      setGuides(response.data.guides);
      setBookingResult(null);
      setSelectedGuide(null);
    } catch (error) {
      alert("Error fetching guides");
    }
  };

  const bookGuide = async () => {
    if (!selectedGuide) return alert("Select a guide to book");
    if (!userName || !userContact || !tripDate)
      return alert("Fill all booking details");

    try {
      const response = await axios.post("http://127.0.0.1:5000/book-guide", {
        guide_name: selectedGuide["Guide Name"],
        user_name: userName,
        user_contact: userContact,
        trip_date: tripDate,
      });
      setBookingResult(response.data.booking);
      setSelectedGuide(null);
      setUserName("");
      setUserContact("");
      setTripDate("");
    } catch (error) {
      alert("Error booking guide"+"\n"+error);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem" }}>Find and Book a Local Guide</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          style={{
            flex: 2,
            padding: "0.5rem",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
          placeholder="Places (comma separated)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </div>

      <div
        style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}
      >
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            value="place"
            checked={guideType === "place"}
            onChange={() => setGuideType("place")}
          />
          <span style={{ marginLeft: "0.3rem" }}>
            Place Guide (₹{PLACE_GUIDE_COST})
          </span>
        </label>

        <label>
          <input
            type="radio"
            value="route"
            checked={guideType === "route"}
            onChange={() => setGuideType("route")}
          />
          <span style={{ marginLeft: "0.3rem" }}>
            Route Guide (₹{ROUTE_GUIDE_COST})
          </span>
        </label>
      </div>

      <button
        onClick={fetchGuides}
        style={{
          padding: "0.7rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        Search Guides
      </button>

      {guides.length > 0 && (
        <div>
          <h3>Available Guides:</h3>
          {guides.map((guide, index) => (
            <div
              key={index}
              onClick={() => setSelectedGuide(guide)}
              style={{
                border:
                  selectedGuide === guide
                    ? "2px solid #007bff"
                    : "1px solid #ccc",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor:
                  selectedGuide === guide ? "#e9f5ff" : "transparent",
              }}
            >
              <b>{guide["Guide Name"]}</b> - {guide["Places"].join(", ")}, {guide["Destination"]}, {guide.Destination}
              <br />
              Phone: {guide["Phone Number"]}<br />
              Languages: {guide["Languages Spoken"] || "NA"}
            </div>
          ))}
        </div>
      )}

      {selectedGuide && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          <h3>Book Guide: {selectedGuide["Guide Name"]}</h3>
          <input
            type="text"
            placeholder="Your Name"
            style={{ padding: "0.4rem", marginRight: "1rem", width: "40%" }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Contact Info"
            style={{ padding: "0.4rem", marginRight: "1rem", width: "40%" }}
            value={userContact}
            onChange={(e) => setUserContact(e.target.value)}
          />
          <input
            type="date"
            style={{ padding: "0.4rem", width: "18%" }}
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
          />
          <button
            onClick={bookGuide}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Confirm Booking
          </button>
        </div>
      )}

      {bookingResult && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: 4,
          }}
        >
          <h3>Booking Confirmed!</h3>
          <p>Booking ID: {bookingResult.booking_id}</p>
          <p>Guide Name: {bookingResult.guide_name}</p>
          <p>User Name: {bookingResult.user_name}</p>
          <p>Contact: {bookingResult.user_contact}</p>
          <p>Trip Date: {bookingResult.trip_date}</p>
        </div>
      )}
    </div>
  );
}

export default App;
