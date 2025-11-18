import React, { useState, useContext, useEffect } from "react";
import "./dashboard.css";
import VideoMeet from "./videoMeet.jsx";
import { AuthContext } from "../context/authContext";

function Dashboard() {
  const { userData } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch rooms
  useEffect(() => {
    if (!userData || !userData._id) return;

    async function fetchRooms() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/meetings/${userData._id}`
        );
        if (!res.ok) {
          console.error("Failed to fetch rooms:", res.status);
          return;
        }
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.log(err);
      }
    }

    fetchRooms();
  }, [userData]);

  // Create room
  const handleCreateRoom = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userData._id }),
      });

      const data = await res.json();
      if (data.success) {
        setRooms((prev) => [data.meeting, ...prev]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/meetings/${roomId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => prev.filter((room) => room._id !== roomId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Copy room code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Room code "${code}" copied to clipboard!`);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>

        <button className="btn-primary create-room-btn" onClick={handleCreateRoom}>
          ➕ Create Room
        </button>

        <h3 className="sidebar-subtitle">Your Rooms</h3>

        <div className="rooms-list">
  {rooms.length === 0 ? (
    <p className="no-rooms">No rooms yet.</p>
  ) : (
    rooms.map((room) => (
      <div key={room._id} className="room-item">
        <div className="room-info" onClick={() => setSelectedRoom(room)}>
          <p className="room-code">{room.meeting_code}</p>
          <p className="room-user">Created by: {userData.username}</p>
          <p className="room-date">
            Date: {new Date(room.date).toLocaleDateString()}{" "}
            {new Date(room.date).toLocaleTimeString()}
          </p>
        </div>
        <div className="room-actions">
          <button
            className="btn room-btn copy-btn"
            onClick={() => handleCopyCode(room.meeting_code)}
          >
            Copy
          </button>
          <button
            className="btn room-btn delete-btn"
            onClick={() => handleDeleteRoom(room._id)}
          >
            Delete
          </button>
        </div>
      </div>
    ))
  )}
</div>

      </div>

      {/* Main Display */}
      <div className="video-container">
       <VideoMeet/>
      </div>
    </div>
  );
}

export default Dashboard;


