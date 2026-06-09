import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Login Component
export default function Login() {
  // Navigation Hook
  const navigate = useNavigate();

  // Form State Management
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // UI State Management
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          navigate("/dashboard");
        }
      } catch {
        // Not logged in, stay on login page
      }
    };

    checkAuth();
  }, [navigate]);

  // Login Submission Handler
  const submit = async () => {
    // Input Validation
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", form);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // ← add this
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }

    // try {
    //   const response = await api.post("/auth/login", form);
    //   if (response.status === 200) {
    //     navigate("/dashboard");
    //   }
    // } catch (err: any) {
    //   // Error Handling
    //   const errorMessage =
    //     err.response?.data?.message ||
    //     err.response?.data?.error ||
    //     err.message ||
    //     "Login failed";
    //   setError(errorMessage);
    // } finally {
    //   setLoading(false);
    // }
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
        {/* Login Form Container */}
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
          <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Login</h1>

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

          {/* Login Button */}
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
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Navigation Link */}
          <p style={{ textAlign: "center" }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
              }}
            >
              Register here
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
