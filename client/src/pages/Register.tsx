import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Register Component
export default function Register() {
  // Navigation Hook
  const navigate = useNavigate();

  // Form State Management
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // UI State Management
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration Submission Handler
  const submit = async () => {
    // Input Validation
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
      const response = await api.post("/auth/register", form);
      if (response.status === 200 || response.status === 201) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      // Error Handling
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // UI Rendering
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "space-between",
        background: "#0f172a",
        color: "white",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: "20px",
        }}
      >
        {/* Register Form Container */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "40px",
            background: "#1e293b",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
            Register
          </h1>

          {/* Error Message Display */}
          {error && (
            <div
              style={{
                color: "#ff6b6b",
                marginBottom: "10px",
                padding: "10px",
                background: "#3a2a2a",
                borderRadius: "6px",
              }}
            >
              {error}
            </div>
          )}

          {/* Username Input */}
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />

          {/* Email Input */}
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />

          {/* Password Input */}
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />

          {/* Register Button */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              background: "#2563eb",
              border: "none",
              color: "white",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login Navigation Link */}
          <p style={{ textAlign: "center" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
              }}
            >
              Login here
            </button>
          </p>
        </div>
      </div>

      {/* Footer with Copyright */}
      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #334155",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        © 2026 Made by Brett Cooper
      </footer>
    </div>
  );
}
