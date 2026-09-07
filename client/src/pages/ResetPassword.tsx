import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      setError("This reset link is missing its token");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not reset the password");
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
            <span className="cn-grad-text">New password</span>
          </h1>
          <p style={{ textAlign: "center", color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>
            Choose a new password for your account
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

          {done ? (
            <div
              style={{
                color: "#86efac",
                marginBottom: 12,
                padding: 10,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.4)",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Password updated. Taking you to sign in…
            </div>
          ) : (
            <>
              <input
                placeholder="New password (6+ characters)"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                style={{ width: "100%", marginBottom: 12 }}
              />
              <input
                placeholder="Confirm new password"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                disabled={loading}
                style={{ width: "100%", marginBottom: 16 }}
              />
              <button onClick={submit} disabled={loading} style={{ width: "100%" }}>
                {loading ? "Updating…" : "Update password"}
              </button>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-dim)" }}>
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
