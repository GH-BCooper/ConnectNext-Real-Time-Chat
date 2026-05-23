import { useEffect, useState } from "react";
import api from "../api/axios";

// Dashboard Component
export default function Dashboard() {
  // State Management
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  // Fetch Logged In User
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      window.location.href = "/";
    }
  };

  // Fetch Available Chat Rooms
  const fetchRooms = async () => {
    const res = await api.get("/rooms");
    setRooms(res.data);
  };

  // Logout Handler
  const logout = async () => {
    await api.post("/auth/logout");
    window.location.href = "/";
  };

  // UI Rendering
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar Layout */}
      <div
        style={{
          width: "250px",
          background: "#1e293b",
          padding: "20px",
        }}
      >
        <h2>ConnectNext</h2>

        {/* User Information */}
        {user && <p>{user.username}</p>}

        {/* Logout Button */}
        <button onClick={logout}>Logout</button>

        {/* Room List */}
        <h3>Rooms</h3>

        {rooms.map((room) => (
          <div key={room.id} style={{ marginBottom: "10px" }}>
            <button
              onClick={() => (window.location.href = `/chat?roomId=${room.id}`)}
            >
              {room.name}
            </button>
          </div>
        ))}
      </div>

      {/* Main Dashboard Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Welcome to ConnectNext 🚀</h1>
      </div>
    </div>
  );
}