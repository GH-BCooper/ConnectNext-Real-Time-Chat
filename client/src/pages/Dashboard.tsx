import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();

  // State Management
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create-room form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const createRoom = async () => {
    if (!newName.trim()) {
      setCreateError("Room name is required");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const res = await api.post("/rooms", {
        name: newName,
        description: newDesc,
      });
      setNewName("");
      setNewDesc("");
      await fetchRooms();
      navigate(`/chat?roomId=${res.data.id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Could not create room");
    } finally {
      setCreating(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div style={centered}>
        <p>Loading...</p>
      </div>
    );
  }

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
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "280px",
            background: "#1e293b",
            padding: "20px",
            borderRight: "1px solid #334155",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>ConnectNext</h2>

          {user && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
                Welcome,
              </p>
              <p style={{ fontWeight: "bold", margin: "2px 0 0" }}>
                {user.username}
              </p>
            </div>
          )}

          <button onClick={() => navigate("/profile")} style={btn("#334155")}>
            👤 My Profile
          </button>
          <button
            onClick={logout}
            style={{ ...btn("#dc2626"), marginBottom: "24px" }}
          >
            Logout
          </button>

          {/* Create Room */}
          <h3 style={{ margin: "0 0 10px", fontSize: "15px" }}>New Room</h3>
          {createError && (
            <p style={{ color: "#fca5a5", fontSize: "12px", margin: "0 0 8px" }}>
              {createError}
            </p>
          )}
          <input
            placeholder="Room name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={input}
          />
          <input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            style={input}
          />
          <button
            onClick={createRoom}
            disabled={creating}
            style={{ ...btn("#16a34a"), marginBottom: "24px", opacity: creating ? 0.6 : 1 }}
          >
            {creating ? "Creating..." : "+ Create Room"}
          </button>

          {/* Room List */}
          <h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>
            Rooms ({rooms.length})
          </h3>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/chat?roomId=${room.id}`)}
              style={{ ...btn("#2563eb"), textAlign: "left", marginBottom: "8px" }}
            >
              {room.name}
              <span style={{ display: "block", fontSize: "11px", opacity: 0.7 }}>
                {room.message_count ?? 0} messages
              </span>
            </button>
          ))}
        </div>

        {/* Main Area */}
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
          <h1 style={{ fontSize: "40px", marginBottom: "16px" }}>
            Welcome to ConnectNext 🚀
          </h1>
          <p style={{ fontSize: "17px", color: "#94a3b8", maxWidth: "500px" }}>
            Pick a room on the left to start chatting, spin up a new room, or
            check your profile. Try <code>/ai your question</code> inside a room
            to talk to the AI assistant.
          </p>
        </div>
      </div>

      <footer style={footer}>© 2026 Made by Brett Cooper</footer>
    </div>
  );
}

// Small shared style helpers
const centered: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "#0f172a",
  color: "white",
};

const btn = (bg: string): CSSProperties => ({
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  background: bg,
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
});

const input: CSSProperties = {
  width: "100%",
  padding: "9px",
  marginBottom: "8px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  boxSizing: "border-box",
};

const footer: CSSProperties = {
  padding: "15px 20px",
  textAlign: "center",
  borderTop: "1px solid #334155",
  color: "#64748b",
  fontSize: "12px",
  background: "#1e293b",
};
