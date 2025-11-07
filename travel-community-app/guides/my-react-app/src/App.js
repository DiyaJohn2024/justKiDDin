
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
      alert("Error booking guide" + "\n" + error);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#212121",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 16,
        boxShadow: "0 4px 28px 0 rgba(0,0,0,0.12)",
        padding: "2rem",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", fontWeight: 700 }}>
        Find and Book a Local Guide
      </h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          style={{
            flex: 1,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: "1px solid #ced4da",
            fontWeight: 500,
          }}
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          style={{
            flex: 2,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: "1px solid #ced4da",
            fontWeight: 500,
          }}
          placeholder="Places (comma separated)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </div>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <label style={{ cursor: "pointer", fontWeight: 500 }}>
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

        <label style={{ cursor: "pointer", fontWeight: 500 }}>
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
          padding: "0.8rem 1.4rem",
          background: "linear-gradient(to right,#007bff,#1565c0)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "1rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,123,255,0.09)",
          transition: "background 0.2s"
        }}
      >
        Search Guides
      </button>

      {guides.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 16, marginTop: 16 }}>Available Guides:</h3>
          {guides.map((guide, index) => (
            <div
              key={index}
              onClick={() => setSelectedGuide(guide)}
              style={{
                border:
                  selectedGuide === guide
                    ? "2px solid #007bff"
                    : "1px solid #ced4da",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: 10,
                cursor: "pointer",
                background:
                  selectedGuide === guide
                    ? "#e9f5ff"
                    : "rgba(13,110,253,0.06)",
                color: "#222",
                fontWeight: 500,
                boxShadow:
                  selectedGuide === guide
                    ? "0 2px 14px 0 rgba(0,123,255,0.06)"
                    : "none",
                transition: "all 0.18s"
              }}
            >
              <b style={{ color: "#1565c0" }}>{guide["Guide Name"]}</b> -{" "}
              {guide["Places"].join(", ")}, {guide["Destination"]}
              <br />
              Phone: {guide["Phone Number"]}
              <br />
              Languages: {guide["Languages Spoken"] || "NA"}
            </div>
          ))}
        </div>
      )}

      {selectedGuide && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.4rem",
            border: "1px solid #007bff",
            borderRadius: 10,
            background: "#f4fafd"
          }}
        >
          <h3 style={{ marginBottom: 14, color: "#007bff", fontWeight: 700 }}>
            Book Guide: {selectedGuide["Guide Name"]}
          </h3>
          <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Your Name"
              style={{
                padding: "0.6rem",
                borderRadius: 6,
                border: "1px solid #bbb",
                minWidth: 180,
                flex: "1 1 120px"
              }}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Your Contact Info"
              style={{
                padding: "0.6rem",
                borderRadius: 6,
                border: "1px solid #bbb",
                minWidth: 170,
                flex: "1 1 120px"
              }}
              value={userContact}
              onChange={(e) => setUserContact(e.target.value)}
            />
            <input
              type="date"
              style={{
                padding: "0.6rem",
                borderRadius: 6,
                border: "1px solid #bbb",
                minWidth: 120,
                flex: "1 1 90px"
              }}
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
            />
          </div>
          <button
            onClick={bookGuide}
            style={{
              marginTop: "0.7rem",
              padding: "0.8rem 2.1rem",
              background: "linear-gradient(to right,#28a745,#218838)",
              color: "white",
              border: "none",
              borderRadius: 5,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(40,167,69,0.06)",
              cursor: "pointer"
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
            padding: "1.4rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 10 }}>
            Booking Confirmed!
          </h3>
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
