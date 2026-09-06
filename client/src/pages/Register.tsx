import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(() => navigate("/dashboard")).catch(() => {});
  }, [navigate]);

  const submit = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cn-page">
      <div
        className="cn-container"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="cn-card" style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ textAlign: "center", margin: "0 0 6px", fontSize: 26 }}>
            <span className="cn-grad-text">Start studying</span>
          </h1>
          <p style={{ textAlign: "center", color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>
            Create an account to join and run study rooms
          </p>

          {error && (
            <div
              style={{
                color: "#fca5a5",
                marginBottom: 12,
                padding: 10,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            disabled={loading}
            style={{ width: "100%", marginBottom: 12 }}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            style={{ width: "100%", marginBottom: 12 }}
          />
          <input
            placeholder="Password (6+ characters)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={loading}
            style={{ width: "100%", marginBottom: 16 }}
          />
          <button onClick={submit} disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-dim)" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
