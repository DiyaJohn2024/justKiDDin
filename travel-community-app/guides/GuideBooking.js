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

  const fetchGuides = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/guides", {
        params: {
          destination,
          place,
        },
      });
      setGuides(response.data.guides);
      setBookingResult(null);
    } catch (error) {
      alert("Error fetching guides");
    }
  };

  const bookGuide = async () => {
    if (!selectedGuide) return alert("Select a guide to book");
    if (!userName || !userContact || !tripDate) return alert("Fill all booking details");

    try {
      const response = await axios.post("http://127.0.0.1:5000/book-guide", {
        guide_name: selectedGuide["Guide Name"],
        user_name: userName,
        user_contact: userContact,
        trip_date: tripDate,
      });
      setBookingResult(response.data.booking);
      // Reset booking form and selections
      setSelectedGuide(null);
      setUserName("");
      setUserContact("");
      setTripDate("");
    } catch (error) {
      alert("Error booking guide");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Find and Book a Local Guide</h2>
      <div>
        <input
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          placeholder="Place"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
        <button onClick={fetchGuides} style={{ marginLeft: "1rem" }}>
          Search Guides
        </button>
      </div>

      {guides.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Available Guides:</h3>
          {guides.map((guide, index) => (
            <div
              key={index}
              style={{
                border: "1px solid gray",
                padding: "10px",
                margin: "5px 0",
                backgroundColor: selectedGuide === guide ? "#d0f0c0" : "white",
              }}
              onClick={() => setSelectedGuide(guide)}
            >
              <b>{guide["Guide Name"]}</b> - {guide.Place}, {guide.Destination}
              <br />
              Phone: {guide["Phone Number"]}
            </div>
          ))}
        </div>
      )}

      {selectedGuide && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Book Guide: {selectedGuide["Guide Name"]}</h3>
          <input
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <input
            placeholder="Your Contact Info"
            value={userContact}
            onChange={(e) => setUserContact(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <input
            type="date"
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <button onClick={bookGuide}>Confirm Booking</button>
        </div>
      )}

      {bookingResult && (
        <div style={{ marginTop: "2rem", color: "green" }}>
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
