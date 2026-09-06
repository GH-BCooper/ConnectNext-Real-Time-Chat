import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import api from "../api/axios";

interface Room {
  id: number;
  name: string;
  description?: string;
  message_count?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  const createRoom = async () => {
    if (!newName.trim()) {
      setCreateError("Room name is required");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await api.post("/rooms", { name: newName, description: newDesc });
      setNewName("");
      setNewDesc("");
      navigate(`/chat?roomId=${res.data.id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Could not create room");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="cn-page">
        <div className="cn-container">Loading…</div>
      </div>
    );
  }

  return (
    <div className="cn-page">
      <NavBar username={user?.username} />

      <div className="cn-container">
        <h1 className="cn-h1" style={{ fontSize: "clamp(1.5rem, 6vw, 1.875rem)" }}>
          Welcome back, <span className="cn-grad-text">{user?.username}</span> 🚀
        </h1>
        <p style={{ margin: "0 0 24px", color: "var(--text-dim)" }}>
          Join a study room, start one for what you're revising, or ask the{" "}
          <a href="/assistant">AI Tutor</a> what your group has been covering.
        </p>

        <div className="cn-split">
          {/* Rooms grid */}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>
              Study rooms <span style={{ color: "var(--text-faint)" }}>({rooms.length})</span>
            </h2>
            <div className="cn-grid">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate(`/chat?roomId=${room.id}`)}
                  className="cn-card cn-bubble"
                  style={{
                    textAlign: "left",
                    padding: 16,
                    background: "var(--bg-2)",
                    display: "block",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    # {room.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-dim)",
                      minHeight: 30,
                    }}
                  >
                    {room.description || "No description"}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className="cn-pill" style={{ fontSize: 10 }}>
                      💬 {room.message_count ?? 0} messages
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Create room */}
          <div className="cn-card cn-split__aside">
            <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>✨ New study room</h2>
            {createError && (
              <p style={{ color: "#fca5a5", fontSize: 12, margin: "0 0 8px" }}>
                {createError}
              </p>
            )}
            <input
              placeholder="What are you studying?"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              placeholder="Topic or goal (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
            />
            <button
              onClick={createRoom}
              disabled={creating}
              style={{ width: "100%", background: "var(--green)" }}
            >
              {creating ? "Creating…" : "+ Create room"}
            </button>
          </div>
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
