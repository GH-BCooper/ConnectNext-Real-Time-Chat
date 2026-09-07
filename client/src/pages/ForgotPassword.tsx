import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState("");

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSent(true);
      // In local/dev mode the server hands the reset link back directly
      // because no email provider is configured.
      setDevLink(res.data?.resetLink || "");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
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
            <span className="cn-grad-text">Reset password</span>
          </h1>
          <p style={{ textAlign: "center", color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>
            Enter your email and we'll send a link to set a new password
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

          {sent ? (
            <>
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
                If an account exists for that email, a password reset link is on
                its way to your inbox. Check your spam folder too.
              </div>

              {devLink && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.4)",
                    borderRadius: 8,
                    fontSize: 13,
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Dev mode:</strong> no email service is configured (set
                  <code> RESEND_API_KEY</code> in <code>server/.env</code> to
                  send real emails). Use this link directly:
                  <br />
                  <a href={devLink}>{devLink}</a>
                </div>
              )}
            </>
          ) : (
            <>
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                disabled={loading}
                style={{ width: "100%", marginBottom: 16 }}
              />
              <button onClick={submit} disabled={loading} style={{ width: "100%" }}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-dim)" }}>
            Remembered it? <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
