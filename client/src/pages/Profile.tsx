import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import api from "../api/axios";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users/stats")
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        else setError("Could not load your profile");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (authLoading || loading) {
    return (
      <div className="cn-page">
        <div className="cn-container">Loading…</div>
      </div>
    );
  }

  return (
    <div className="cn-page">
      <NavBar username={user?.username} />

      <div className="cn-container" style={{ maxWidth: 520 }}>
        <h1 style={{ margin: "0 0 20px", fontSize: 28 }}>
          <span className="cn-grad-text">My Profile</span> 👤
        </h1>

        {error && <p style={{ color: "#fca5a5" }}>{error}</p>}

        {profile && (
          <div className="cn-card">
            <Row label="Username" value={profile.username} />
            <Row label="Email" value={profile.email} />
            <Row label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />

            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <Stat label="Messages sent" value={profile.messageCount} color="var(--cyan)" />
              <Stat label="Rooms created" value={profile.roomsCreated} color="var(--pink)" />
            </div>
          </div>
        )}
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text-dim)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value ?? 0}</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</div>
    </div>
  );
}
