import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Profile Component - shows the logged-in user's info and simple stats
export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/stats");
        setProfile(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError("Could not load your profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div style={page}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#1e293b",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "24px" }}>My Profile</h1>

        {error && <p style={{ color: "#fca5a5" }}>{error}</p>}

        {profile && (
          <>
            <Row label="Username" value={profile.username} />
            <Row label="Email" value={profile.email} />
            <Row
              label="Joined"
              value={new Date(profile.created_at).toLocaleDateString()}
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Stat label="Messages sent" value={profile.messageCount} />
              <Stat label="Rooms created" value={profile.roomsCreated} />
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "28px",
            width: "100%",
            padding: "11px",
            background: "#2563eb",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
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
        borderBottom: "1px solid #334155",
      }}
    >
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ fontWeight: "bold" }}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#0f172a",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "26px", fontWeight: "bold" }}>{value ?? 0}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

const page = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
  padding: "20px",
} as const;
