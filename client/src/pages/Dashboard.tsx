import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Dashboard Component
export default function Dashboard() {
  // Navigation Hook
  const navigate = useNavigate();

  // State Management
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Not logged in, redirect to login
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Available Chat Rooms
  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Logout Handler
  const logout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f172a",
          color: "white",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // UI Rendering
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >
      {/* Main Content */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar Layout */}
        <div
          style={{
            width: "250px",
            background: "#1e293b",
            padding: "20px",
            borderRight: "1px solid #334155",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>ConnectNext</h2>

          {/* User Information */}
          {user && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>Welcome,</p>
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                {user.username}
              </p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "30px",
              background: "#dc2626",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>

          {/* Room List */}
          <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>Rooms</h3>

          {rooms.map((room) => (
            <div key={room.id} style={{ marginBottom: "10px" }}>
              <button
                onClick={() =>
                  (window.location.href = `/chat?roomId=${room.id}`)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#2563eb",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#1d4ed8";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#2563eb";
                }}
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
            Welcome to ConnectNext 🚀
          </h1>
          <p style={{ fontSize: "18px", color: "#94a3b8", maxWidth: "500px" }}>
            Select a room from the left sidebar to start chatting, or create a
            new conversation with people around the world.
          </p>
        </div>
      </div>

      {/* Footer with Copyright */}
      <footer
        style={{
          padding: "15px 20px",
          textAlign: "center",
          borderTop: "1px solid #334155",
          color: "#64748b",
          fontSize: "12px",
          background: "#1e293b",
        }}
      >
        © 2026 Made by Brett Cooper
      </footer>
    </div>
  );
}
