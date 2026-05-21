import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      window.location.href = "/";
    }
  };

  const fetchRooms = async () => {
    const res = await api.get("/rooms");
    setRooms(res.data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#1e293b",
          padding: "20px",
        }}
      >
        <h2>ConnectNext</h2>

        {user && <p>{user.username}</p>}

        <button onClick={logout}>Logout</button>

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

      {/* Main Area */}
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
